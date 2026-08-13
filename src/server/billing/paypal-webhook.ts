import { z } from "zod";
import { captureServerError } from "@/server/lib/posthog";
import { syncPaypalCustomerStatus } from "./customer-status-sync";
import {
  extractWebhookHeaders,
  verifyWebhookSignature,
} from "./paypal-webhook-verify";

export const PAYPAL_WEBHOOK_PATH = "/api/paypal/webhook";

const paypalWebhookEventSchema = z
  .object({
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

  if (SYNC_EVENTS.has(payload.event_type)) {
    const orgId = getOrganizationId(payload);
    if (!orgId) {
      return json({ error: "Missing organization id in webhook" }, 400);
    }

    try {
      await syncPaypalCustomerStatus(orgId, payload);
    } catch (error) {
      console.error(
        `PayPal ${payload.event_type} sync failed`,
        orgId,
        error,
        {
          cause: error instanceof Error ? error.cause : undefined,
        },
      );
      await captureServerError(error, {
        source: "paypal_webhook",
        organization_id: orgId,
      });
      return json({ error: "Webhook processing failed" }, 500);
    }
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
  const purchaseUnits = Array.isArray(resource.purchase_units)
    ? (resource.purchase_units as Array<Record<string, unknown>>)
    : [];
  for (const unit of purchaseUnits) {
    const refId = typeof unit.reference_id === "string" ? unit.reference_id : null;
    if (refId) {
      // reference_id format: "topup-{orgId}-{timestamp}"
      const match = refId.match(/^topup-([^-]+(?:-[^-]+)*)-\d+$/);
      if (match) return match[1];
    }
  }

  return null;
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}
