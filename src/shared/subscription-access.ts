import type { PlanTier } from "./plans";

export const SUBSCRIPTION_PAYMENT_GRACE_DAYS = 14;

export function hasPaymentStateAccess(
  statusInput: string | null | undefined,
  currentPeriodEnd: string | null | undefined,
  now = new Date(),
) {
  const status = statusInput?.toLowerCase();
  if (status === "active" || status === "trialing") return true;
  if ((status !== "past_due" && status !== "suspended") || !currentPeriodEnd) {
    return false;
  }

  const periodEnd = new Date(currentPeriodEnd);
  if (Number.isNaN(periodEnd.getTime())) return false;
  const graceEnd =
    periodEnd.getTime() +
    SUBSCRIPTION_PAYMENT_GRACE_DAYS * 24 * 60 * 60 * 1_000;
  return now.getTime() <= graceEnd;
}

type SubscriptionAccessState = {
  planTier: PlanTier;
  status: string | null | undefined;
  currentPeriodEnd: string | null | undefined;
};

/**
 * Resolve the effective paid entitlement from the locally-synced subscription.
 * A tier name alone is insufficient: cancelled subscriptions and payment
 * failures beyond the recovery window must behave as Free everywhere.
 */
export function hasSubscriptionAccess(
  subscription: SubscriptionAccessState | null | undefined,
  now = new Date(),
) {
  if (!subscription || subscription.planTier === "free") return false;
  return hasPaymentStateAccess(
    subscription.status,
    subscription.currentPeriodEnd,
    now,
  );
}
