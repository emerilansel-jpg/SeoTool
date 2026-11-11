import { PayPalWebhookEventRepository } from "@/server/features/admin/repositories/PayPalWebhookEventRepository";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { MONTHLY_CREDIT_PACKS, type MonthlyPlanTier } from "@/shared/billing";
import { addTopupCredits } from "./credits";
import { LTD_OFFERS } from "./paypal-checkout-service";

const ONE_MONTH_MS = 31 * 86_400_000;

export function toDodoSubscriptionRef(subscriptionId: string): string {
  return `dodo:${subscriptionId}`;
}

export function parseDodoSubscriptionRef(ref: string | null | undefined) {
  if (!ref || !ref.startsWith("dodo:")) return null;
  const subscriptionId = ref.slice("dodo:".length).trim();
  return subscriptionId || null;
}

/**
 * Atomically claim a credit grant for a Dodo payment/cycle using the webhook
 * audit log table so webhook retries, redirect verification, and page reloads
 * never double-credit an organization.
 */
// ponytail: reuses paypal_webhook_events for provider-agnostic idempotency to avoid a schema migration
async function claimCreditGrantOnce(input: {
  idempotencyKey: string;
  eventType: string;
  organizationId: string;
  payload: string;
  grant: () => Promise<void>;
}): Promise<boolean> {
  const claimed = await PayPalWebhookEventRepository.record({
    id: input.idempotencyKey,
    eventType: input.eventType,
    organizationId: input.organizationId,
    payload: input.payload,
  });
  if (!claimed) return false;

  try {
    await input.grant();
    await PayPalWebhookEventRepository.markStatus(
      input.idempotencyKey,
      "processed",
      null,
    );
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await PayPalWebhookEventRepository.markStatus(
      input.idempotencyKey,
      "failed",
      message.slice(0, 500),
    );
    throw error;
  }
}

export async function fulfillDodoLtd(input: {
  organizationId: string;
  planKey: string;
  paymentId: string;
  eventType: string;
}): Promise<void> {
  const offer = LTD_OFFERS[input.planKey] ?? LTD_OFFERS.krp_founder_10;
  await QuotaRepository.upsertSubscription({
    organizationId: input.organizationId,
    planTier: offer.tier,
    status: "active",
    currentPeriodEnd: "2099-12-31T23:59:59.000Z",
  });

  if (offer.bonusCredits <= 0) return;

  await claimCreditGrantOnce({
    idempotencyKey: `dodo:pay:${input.paymentId}`,
    eventType: input.eventType,
    organizationId: input.organizationId,
    payload: JSON.stringify({
      type: "ltd",
      planKey: input.planKey,
      paymentId: input.paymentId,
      credits: offer.bonusCredits,
    }),
    grant: () => addTopupCredits(input.organizationId, offer.bonusCredits),
  });
}

export async function fulfillDodoTopup(input: {
  organizationId: string;
  credits: number;
  paymentId: string;
  eventType: string;
}): Promise<void> {
  if (!Number.isFinite(input.credits) || input.credits <= 0) return;

  await claimCreditGrantOnce({
    idempotencyKey: `dodo:pay:${input.paymentId}`,
    eventType: input.eventType,
    organizationId: input.organizationId,
    payload: JSON.stringify({
      type: "topup",
      paymentId: input.paymentId,
      credits: input.credits,
    }),
    grant: () => addTopupCredits(input.organizationId, input.credits),
  });
}

export async function fulfillDodoSubscription(input: {
  organizationId: string;
  tier: string;
  subscriptionId: string | null;
  cycleAnchor: string;
  nextBillingDate: string | null;
  eventType: string;
}): Promise<void> {
  const pack = MONTHLY_CREDIT_PACKS.find((p) => p.tier === input.tier);
  const resolvedTier: MonthlyPlanTier = pack ? pack.tier : "starter";
  const resolvedCredits =
    pack?.credits ??
    MONTHLY_CREDIT_PACKS.find((p) => p.tier === "starter")?.credits ??
    0;

  await QuotaRepository.upsertSubscription({
    organizationId: input.organizationId,
    planTier: resolvedTier,
    paypalSubscriptionId: input.subscriptionId
      ? toDodoSubscriptionRef(input.subscriptionId)
      : undefined,
    status: "active",
    currentPeriodEnd:
      input.nextBillingDate ||
      new Date(Date.now() + ONE_MONTH_MS).toISOString(),
  });

  if (resolvedCredits <= 0) return;

  const idempotencyKey = input.subscriptionId
    ? `dodo:sub:${input.subscriptionId}:${input.cycleAnchor}`
    : `dodo:pay:${input.cycleAnchor}`;

  await claimCreditGrantOnce({
    idempotencyKey,
    eventType: input.eventType,
    organizationId: input.organizationId,
    payload: JSON.stringify({
      type: "subscription",
      tier: resolvedTier,
      subscriptionId: input.subscriptionId,
      cycleAnchor: input.cycleAnchor,
      credits: resolvedCredits,
    }),
    grant: () => addTopupCredits(input.organizationId, resolvedCredits),
  });
}
