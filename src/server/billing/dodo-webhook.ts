import type { UnwrapWebhookEvent } from "dodopayments/resources/webhooks/webhooks";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import { MONTHLY_CREDIT_PACKS, type MonthlyPlanTier } from "@/shared/billing";
import { getDodoClient } from "./dodo-client";
import {
  fulfillDodoLtd,
  fulfillDodoSubscription,
  fulfillDodoTopup,
  toDodoSubscriptionRef,
} from "./dodo-fulfillment";

export const DODO_WEBHOOK_PATH = "/api/billing/dodo-webhook";

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function readMetadata(metadata: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

export async function handleDodoWebhookRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = await getOptionalEnvValue("DODO_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[Dodo Webhook] DODO_WEBHOOK_SECRET is not configured");
    return jsonResponse({ error: "Webhook secret is not configured" }, 503);
  }

  const rawBody = await request.text();
  const dodo = await getDodoClient();

  let event: UnwrapWebhookEvent;
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });
    event = dodo.webhooks.unwrap(rawBody, { headers, key: webhookSecret });
  } catch (err) {
    console.error("[Dodo Webhook Signature Verification Failed]:", err);
    return jsonResponse({ error: "Invalid webhook signature" }, 401);
  }

  const eventType = event.type;
  console.log(`[Dodo Webhook Received]: ${eventType}`);

  try {
    switch (event.type) {
      case "payment.succeeded": {
        const payment = event.data;
        const metadata = readMetadata(payment.metadata);
        const orgId = metadata.organizationId;
        if (!orgId) break;

        const type = metadata.type;
        if (type === "ltd" || (type !== "subscription" && metadata.planKey)) {
          await fulfillDodoLtd({
            organizationId: orgId,
            planKey: metadata.planKey || "krp_founder_10",
            paymentId: payment.payment_id,
            eventType,
          });
        } else if (type === "topup") {
          const credits = Number(metadata.credits || 0);
          await fulfillDodoTopup({
            organizationId: orgId,
            credits,
            paymentId: payment.payment_id,
            eventType,
          });
        }
        break;
      }

      case "subscription.active":
      case "subscription.renewed": {
        const sub = event.data;
        const metadata = readMetadata(sub.metadata);
        const orgId = metadata.organizationId;
        if (!orgId) break;

        const cycleAnchor = sub.previous_billing_date || sub.created_at;
        await fulfillDodoSubscription({
          organizationId: orgId,
          tier: metadata.tier || "starter",
          subscriptionId: sub.subscription_id,
          cycleAnchor,
          nextBillingDate: sub.next_billing_date || null,
          eventType,
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const sub = event.data;
        const metadata = readMetadata(sub.metadata);
        const orgId = metadata.organizationId;
        if (!orgId) break;

        const rawTier = metadata.tier || "starter";
        const pack = MONTHLY_CREDIT_PACKS.find((p) => p.tier === rawTier);
        const tier: MonthlyPlanTier = pack ? pack.tier : "starter";

        await QuotaRepository.upsertSubscription({
          organizationId: orgId,
          planTier: tier,
          paypalSubscriptionId: toDodoSubscriptionRef(sub.subscription_id),
          status:
            event.type === "subscription.cancelled" ? "cancelled" : "expired",
        });
        break;
      }

      default:
        break;
    }

    return jsonResponse({ received: true }, 200);
  } catch (err) {
    console.error(`[Dodo Webhook Processing Error on ${eventType}]:`, err);
    return jsonResponse({ error: "Internal processing error" }, 500);
  }
}
