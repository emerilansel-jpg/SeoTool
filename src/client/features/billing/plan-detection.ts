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
