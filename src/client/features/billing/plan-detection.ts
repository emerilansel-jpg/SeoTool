import {
  AUTUMN_PLAN_IDS,
  planTierFromAutumnPlanId,
  type PlanTier,
} from "@/shared/plans";

// Exported for call-site compatibility. Still correctly divides free vs paid.
export type PlanStatus = "free" | "paid";

export function getCustomerPlanTier(
  customer:
    | { subscriptions?: Array<{ planId: string; status: string }> }
    | undefined,
): PlanTier {
  if (!customer?.subscriptions) return "free";

  const tieredPlanIds = new Set<string>(
    (["lite", "pro", "agency"] as const)
      .map((tier) => AUTUMN_PLAN_IDS[tier])
      .filter((id): id is string => id !== null),
  );

  const tiered = customer.subscriptions.filter(
    (s) => s.planId && tieredPlanIds.has(s.planId),
  );

  if (tiered.length === 0) return "free";

  // Prefer active subscriptions, otherwise take the first found.
  const active = tiered.find((s) => s.status === "active") ?? tiered[0];
  if (!active || !active.planId) return "free";

  return planTierFromAutumnPlanId(active.planId) ?? "free";
}

export function getCustomerPlanStatus(
  customer:
    | { subscriptions?: Array<{ planId: string; status: string }> }
    | undefined,
): PlanStatus {
  return getCustomerPlanTier(customer) === "free" ? "free" : "paid";
}

/**
 * Actionable payment problems on a paid (tiered) subscription. `past_due` and
 * `unpaid` mean a renewal charge failed and the user must update their payment
 * method to keep the plan. Returns null when the account is in good standing
 * (or on the free plan, which has no payment to fail).
 */
export type SubscriptionProblem = "past_due" | "unpaid";

export function getSubscriptionProblemStatus(
  customer:
    | { subscriptions?: Array<{ planId: string; status: string }> }
    | undefined,
): SubscriptionProblem | null {
  if (!customer?.subscriptions) return null;

  const tieredPlanIds = new Set<string>(
    (["lite", "pro", "agency"] as const)
      .map((tier) => AUTUMN_PLAN_IDS[tier])
      .filter((id): id is string => id !== null),
  );

  const problem = customer.subscriptions.find(
    (s) =>
      tieredPlanIds.has(s.planId) &&
      (s.status === "past_due" || s.status === "unpaid"),
  );
  if (!problem) return null;
  // The find() above already matched one of the two literal statuses; re-check
  // so TypeScript narrows the union without an unsafe cast.
  return problem.status === "past_due" || problem.status === "unpaid"
    ? problem.status
    : null;
}
