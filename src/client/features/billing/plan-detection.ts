import {
  PAYPAL_PLAN_IDS,
  planTierFromPaypalPlanId,
  type PlanTier,
} from "@/shared/plans";

// Exported for call-site compatibility.
export type PlanStatus = "free" | "paid";

export function getCustomerPlanTier(
  customer:
    | { subscriptions?: Array<{ planId: string; status: string }> }
    | undefined,
): PlanTier {
  if (!customer?.subscriptions) return "free";

  const tieredPlanIds = new Set<string>(
    (["lite", "pro", "agency"] as const)
      .map((tier) => PAYPAL_PLAN_IDS[tier])
      .filter((id): id is string => id !== null),
  );

  const tiered = customer.subscriptions.filter(
    (s) => s.planId && tieredPlanIds.has(s.planId),
  );

  if (tiered.length === 0) return "free";

  const active = tiered.find((s) => s.status === "active") ?? tiered[0];
  if (!active || !active.planId) return "free";

  return planTierFromPaypalPlanId(active.planId) ?? "free";
}

export function getCustomerPlanStatus(
  customer:
    | { subscriptions?: Array<{ planId: string; status: string }> }
    | undefined,
): PlanStatus {
  return getCustomerPlanTier(customer) === "free" ? "free" : "paid";
}

export type SubscriptionProblem = "past_due" | "unpaid";

export function getSubscriptionProblemStatus(
  customer:
    | { subscriptions?: Array<{ planId: string; status: string }> }
    | undefined,
): SubscriptionProblem | null {
  if (!customer?.subscriptions) return null;

  const tieredPlanIds = new Set<string>(
    (["lite", "pro", "agency"] as const)
      .map((tier) => PAYPAL_PLAN_IDS[tier])
      .filter((id): id is string => id !== null),
  );

  const problem = customer.subscriptions.find(
    (s) =>
      tieredPlanIds.has(s.planId) &&
      (s.status === "past_due" || s.status === "unpaid"),
  );
  if (!problem) return null;
  return problem.status === "past_due" || problem.status === "unpaid"
    ? problem.status
    : null;
}
