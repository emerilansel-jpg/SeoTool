import { z } from "zod";
import { captureServerError } from "@/server/lib/posthog";
import { syncPaypalCustomerStatus } from "./customer-status-sync";
import { addTopupCredits } from "./credits";
import { CREDITS_PER_USD } from "@/shared/billing";
import { PayPalWebhookEventRepository } from "@/server/features/admin/repositories/PayPalWebhookEventRepository";
import {
  extractWebhookHeaders,
  verifyWebhookSignature,
} from "./paypal-webhook-verify";

export const PAYPAL_WEBHOOK_PATH = "/api/paypal/webhook";

const paypalWebhookEventSchema = z
  .object({
    id: z.string().optional(),
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

  const orgId = getOrganizationId(payload);
  const eventId = payload.id ?? crypto.randomUUID();

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
      // One-time credit top-up purchase: grant the purchased credits.
      // Subscription renewals also arrive as PAYMENT.CAPTURE.COMPLETED but
      // carry a custom_id (not a topup reference), so the grant is skipped.
      const topup = extractTopupGrant(payload, orgId);
      if (topup) {
        await addTopupCredits(topup.organizationId, topup.credits);
      }

      // Only subscription events carry a usable subscription resource; a
      // capture payload has no plan_id and would otherwise derive a free-tier
      // snapshot, silently downgrading a paying org on every renewal. For
      // capture events the sync fetches the live subscription from PayPal.
      const isSubscriptionEvent = payload.event_type.startsWith(
        "BILLING.SUBSCRIPTION.",
      );
      await syncPaypalCustomerStatus(
        orgId,
        isSubscriptionEvent ? payload : undefined,
      );

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

function getOrganizationId(payload: PayPalWebhookEvent): string | null {
  // PayPal subscription events store custom_id on the resource
  const resource = payload.resource;
  const customId =
    typeof resource.custom_id === "string" ? resource.custom_id : null;
  if (customId && customId.length > 0) return customId;

  // For payment capture events, extract from purchase_units
  for (const unit of toRecordArray(resource.purchase_units)) {
    const refId =
      typeof unit.reference_id === "string" ? unit.reference_id : null;
    if (refId) {
      // reference_id format: "topup-{orgId}-{timestamp}"
      const match = refId.match(/^topup-([^-]+(?:-[^-]+)*)-\d+$/);
      if (match) return match[1];
    }
  }

  return null;
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
  const topupUnit = toRecordArray(resource.purchase_units).find((unit) => {
    const refId =
      typeof unit.reference_id === "string" ? unit.reference_id : "";
    return refId.startsWith("topup-");
  });
  if (!topupUnit) return null;

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
    organizationId: fallbackOrgId,
    credits: Math.round(amountUsd * CREDITS_PER_USD),
  };
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
