import { getDodoClient } from "./dodo-client";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { addTopupCredits } from "./credits";
import { LTD_OFFERS } from "./paypal-checkout-service";
import { MONTHLY_CREDIT_PACKS, type MonthlyPlanTier } from "@/shared/billing";

export const DODO_WEBHOOK_PATH = "/api/billing/dodo-webhook";

export async function handleDodoWebhookRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await request.text();
  const dodo = await getDodoClient();
  const webhookSecret = await getOptionalEnvValue("DODO_WEBHOOK_SECRET");

  let event: any;
  try {
    if (webhookSecret) {
      const headers: Record<string, string> = {};
      request.headers.forEach((val, key) => {
        headers[key.toLowerCase()] = val;
      });
      event = dodo.webhooks.unwrap(rawBody, { headers, key: webhookSecret });
    } else {
      event = dodo.webhooks.unsafeUnwrap(rawBody);
    }
  } catch (err) {
    console.error("[Dodo Webhook Signature Verification Failed]:", err);
    return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventType = event.type;
  const data = event.data;
  const metadata = (data?.metadata as Record<string, string>) || {};
  const orgId = metadata.organizationId;

  console.log(`[Dodo Webhook Received]: ${eventType} for org: ${orgId}`);

  try {
    switch (eventType) {
      case "payment.succeeded": {
        if (!orgId) break;

        const type = metadata.type;
        if (type === "ltd" || metadata.planKey) {
          const planKey = metadata.planKey || "krp_founder_10";
          const offer = LTD_OFFERS[planKey] ?? LTD_OFFERS.krp_founder_10;
          await QuotaRepository.upsertSubscription({
            organizationId: orgId,
            planTier: offer.tier,
            status: "active",
            currentPeriodEnd: "2099-12-31T23:59:59.000Z",
          });
          if (offer.bonusCredits > 0) {
            await addTopupCredits(orgId, offer.bonusCredits);
          }
        } else if (type === "topup") {
          const credits = Number(metadata.credits || 0);
          if (credits > 0) {
            await addTopupCredits(orgId, credits);
          }
        }
        break;
      }

      case "subscription.active":
      case "subscription.renewed": {
        if (!orgId) break;

        const tier = (metadata.tier || "starter") as MonthlyPlanTier;
        const pack = MONTHLY_CREDIT_PACKS.find((p) => p.tier === tier);
        await QuotaRepository.upsertSubscription({
          organizationId: orgId,
          planTier: tier,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 31 * 86400 * 1000).toISOString(),
        });
        if (pack && pack.credits > 0) {
          await addTopupCredits(orgId, pack.credits);
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        if (!orgId) break;

        const tier = (metadata.tier || "starter") as MonthlyPlanTier;
        await QuotaRepository.upsertSubscription({
          organizationId: orgId,
          planTier: tier,
          status: eventType === "subscription.cancelled" ? "cancelled" : "expired",
        });
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`[Dodo Webhook Processing Error on ${eventType}]:`, err);
    return new Response(JSON.stringify({ error: "Internal processing error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
