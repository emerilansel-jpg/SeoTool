import { z } from "zod";
import { captureServerError } from "@/server/lib/posthog";
import { syncPaypalCustomerStatus } from "./customer-status-sync";
import { addTopupCredits } from "./credits";
import { CREDITS_PER_USD } from "@/shared/billing";
import { PayPalWebhookEventRepository } from "@/server/features/admin/repositories/PayPalWebhookEventRepository";
import { parseTopupMarker } from "./paypal-topup";
import { parseKeywordProMarker } from "@/shared/keyword-pro-membership";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { KeywordProMembershipService } from "@/server/features/keywords/services/KeywordProMembershipService";
import {
  extractWebhookHeaders,
  verifyWebhookSignature,
} from "./paypal-webhook-verify";

export const PAYPAL_WEBHOOK_PATH = "/api/paypal/webhook";

const paypalWebhookEventSchema = z
  .object({
    id: z.string().min(1),
    event_type: z.string(),
    resource: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .passthrough();

type PayPalWebhookEvent = z.infer<typeof paypalWebhookEventSchema>;

// Events that trigger a full customer status re-sync. Replaying or
// out-of-order events simply converge to the same row, so no dedup needed.
const SYNC_EVENTS = new Set([
  "BILLING.SUBSCRIPTION.CREATED",
  "BILLING.SUBSCRIPTION.UPDATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "PAYMENT.CAPTURE.COMPLETED",
  "PAYMENT.SALE.COMPLETED",
]);

export async function handlePaypalWebhookRequest(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      headers: { Allow: "POST" },
      status: 405,
    });
  }

  const rawPayload = await request.text();

  // Verify webhook signature
  const webhookHeaders = extractWebhookHeaders(request.headers);
  if (!webhookHeaders) {
    return json({ error: "Missing PayPal webhook headers" }, 400);
  }

  const isVerified = await verifyWebhookSignature({
    headers: webhookHeaders,
    rawBody: rawPayload,
  });

  if (!isVerified) {
    return json({ error: "Invalid webhook signature" }, 401);
  }

  let payload: PayPalWebhookEvent;
  try {
    payload = paypalWebhookEventSchema.parse(JSON.parse(rawPayload));
  } catch {
    return json({ error: "Invalid webhook payload" }, 400);
  }

  const orgId = await getOrganizationId(payload);
  const eventId = payload.id;

  // Idempotency + audit trail: the PayPal event id is the row id, so a
  // retried delivery returns early instead of double-processing.
  const isNewEvent = await PayPalWebhookEventRepository.record({
    id: eventId,
    eventType: payload.event_type,
    organizationId: orgId,
    payload: rawPayload,
  });
  if (!isNewEvent) {
    return json({ received: true });
  }

  if (SYNC_EVENTS.has(payload.event_type)) {
    if (!orgId) {
      await PayPalWebhookEventRepository.markStatus(
        eventId,
        "failed",
        "Missing organization id in webhook",
      );
      return json({ error: "Missing organization id in webhook" }, 400);
    }

    try {
      if (await processKeywordProEvent(payload)) {
        await PayPalWebhookEventRepository.markStatus(
          eventId,
          "processed",
          null,
        );
        return json({ received: true });
      }

      // One-time credit top-up purchase: grant the purchased credits.
      // Subscription renewals also arrive as PAYMENT.CAPTURE.COMPLETED but
      // carry a custom_id (not a topup reference), so the grant is skipped.
      const topup = extractTopupGrant(payload, orgId);
      if (topup) {
        await addTopupCredits(topup.organizationId, topup.credits);
        try {
          await PayPalWebhookEventRepository.markStatus(
            eventId,
            "processed",
            null,
          );
        } catch (statusError) {
          // The credit grant is the irreversible step. Leave the event in its
          // received state when only the audit-status update fails, so a
          // duplicate delivery is acknowledged without granting twice.
          console.error(
            "PayPal top-up status update failed",
            orgId,
            statusError,
          );
          await captureServerError(statusError, {
            source: "paypal_webhook_topup_status",
            organization_id: orgId,
          });
        }

        return json({ received: true });
      } else {
        // Only subscription events carry a usable subscription resource; a
        // renewal capture has no plan_id, so fetch its live subscription.
        // Top-ups do not need a subscription sync at all. Keeping the grant as
        // the only top-up side effect prevents a later sync failure from
        // causing PayPal's retry to add credits twice.
        const isSubscriptionEvent = payload.event_type.startsWith(
          "BILLING.SUBSCRIPTION.",
        );
        await syncPaypalCustomerStatus(
          orgId,
          isSubscriptionEvent ? payload : undefined,
        );
      }

      await PayPalWebhookEventRepository.markStatus(eventId, "processed", null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown processing error";
      await PayPalWebhookEventRepository.markStatus(eventId, "failed", message);
      console.error(`PayPal ${payload.event_type} sync failed`, orgId, error, {
        cause: error instanceof Error ? error.cause : undefined,
      });
      await captureServerError(error, {
        source: "paypal_webhook",
        organization_id: orgId,
      });
      return json({ error: "Webhook processing failed" }, 500);
    }
  } else {
    await PayPalWebhookEventRepository.markStatus(eventId, "processed", null);
  }

  return json({ received: true });
}

async function getOrganizationId(
  payload: PayPalWebhookEvent,
): Promise<string | null> {
  // Subscription events store the raw organization id. Top-up captures carry
  // a prefixed marker so they cannot be confused with subscription renewals.
  const resource = payload.resource;
  const customId =
    typeof resource.custom_id === "string" ? resource.custom_id : null;
  const keywordPro = parseKeywordProMarker(customId);
  if (keywordPro) return keywordPro.organizationId;
  const topupOrganizationId = parseTopupReference(customId);
  if (topupOrganizationId) return topupOrganizationId;
  if (customId && customId.length > 0) return customId;

  const billingAgreementId =
    typeof resource.billing_agreement_id === "string"
      ? resource.billing_agreement_id
      : null;
  if (billingAgreementId) {
    const membership =
      await KeywordProRepository.getMembershipByPaypalSubscription(
        billingAgreementId,
      );
    if (membership) return membership.organizationId;
  }

  // For payment capture events, extract from purchase_units
  for (const unit of toRecordArray(resource.purchase_units)) {
    const refId =
      typeof unit.reference_id === "string" ? unit.reference_id : null;
    if (refId) {
      // reference_id format: "topup-{orgId}-{timestamp}"
      const organizationId = parseTopupReference(refId);
      if (organizationId) return organizationId;
    }
  }

  return null;
}

async function processKeywordProEvent(payload: PayPalWebhookEvent) {
  const resource = payload.resource;
  if (payload.event_type.startsWith("BILLING.SUBSCRIPTION.")) {
    const subscriptionId = typeof resource.id === "string" ? resource.id : null;
    if (!subscriptionId) return false;
    const marker = parseKeywordProMarker(resource.custom_id);
    const membership =
      await KeywordProRepository.getMembershipByPaypalSubscription(
        subscriptionId,
      );
    if (!marker && !membership) return false;
    await KeywordProMembershipService.syncWebhookSubscription(subscriptionId);
    return true;
  }

  if (payload.event_type !== "PAYMENT.SALE.COMPLETED") return false;
  const subscriptionId =
    typeof resource.billing_agreement_id === "string"
      ? resource.billing_agreement_id
      : null;
  const saleId = typeof resource.id === "string" ? resource.id : null;
  if (!subscriptionId || !saleId) return false;
  const membership =
    await KeywordProRepository.getMembershipByPaypalSubscription(
      subscriptionId,
    );
  if (!membership) return false;

  const amount = isRecord(resource.amount) ? resource.amount : null;
  const amountValue =
    amount && typeof amount.total === "string"
      ? amount.total
      : amount && typeof amount.value === "string"
        ? amount.value
        : null;
  const currency =
    amount && typeof amount.currency === "string"
      ? amount.currency
      : amount && typeof amount.currency_code === "string"
        ? amount.currency_code
        : null;
  const amountUsd = Number.parseFloat(amountValue ?? "");
  if (currency !== "USD" || !Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new Error("Invalid Keyword Research Pro PayPal sale amount");
  }
  await KeywordProMembershipService.rewardReferralSale({
    paypalSubscriptionId: subscriptionId,
    paypalSaleId: saleId,
    grossAmountUsdCents: Math.round(amountUsd * 100),
  });
  return true;
}

/** For a completed top-up capture, resolve the credited amount in credits.
 *  Returns null for subscription renewals and malformed captures. Exported
 *  for unit tests. */
export function extractTopupGrant(
  payload: PayPalWebhookEvent,
  fallbackOrgId: string,
): { organizationId: string; credits: number } | null {
  if (payload.event_type !== "PAYMENT.CAPTURE.COMPLETED") return null;

  const resource = payload.resource;
  const resourceMarker = parseTopupReference(resource.custom_id);
  const unitMarker = toRecordArray(resource.purchase_units)
    .map(
      (unit) =>
        parseTopupReference(unit.custom_id) ??
        parseTopupReference(unit.reference_id),
    )
    .find((organizationId) => organizationId !== null);
  const markerOrganizationId = resourceMarker ?? unitMarker ?? null;
  if (!markerOrganizationId || markerOrganizationId !== fallbackOrgId) {
    return null;
  }

  const amount = isRecord(resource.amount) ? resource.amount : null;
  const currency =
    amount && typeof amount.currency_code === "string"
      ? amount.currency_code
      : null;
  const value =
    amount && typeof amount.value === "string" ? amount.value : null;
  if (currency !== "USD" || value === null) return null;

  const amountUsd = Number.parseFloat(value);
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return null;

  return {
    organizationId: markerOrganizationId,
    credits: Math.round(amountUsd * CREDITS_PER_USD),
  };
}

function parseTopupReference(value: unknown): string | null {
  const markerOrganizationId = parseTopupMarker(value);
  if (markerOrganizationId) return markerOrganizationId;
  if (typeof value !== "string") return null;
  // Backwards compatibility for orders created before the explicit custom-id
  // marker was introduced. New orders use `topup:{orgId}:{timestamp}`.
  const legacy = value.match(/^topup-(.+)-\d+$/);
  return legacy?.[1] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Filters an unknown value down to plain-object array elements (PayPal
 *  payloads arrive as untyped JSON). */
function toRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}
