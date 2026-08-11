import {
  AUTUMN_PLAN_IDS,
  planTierFromAutumnPlanId,
  type PlanTier,
} from "@/shared/plans";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export type BillingCustomerStatusSnapshot = {
  organizationId: string;
  isPaying: boolean;
  paidPlanId: string | null;
  paidPlanStatus: string | null;
  planTier: PlanTier;
  autumnSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  customerJson: string;
  syncedAt: string;
};

export function deriveBillingCustomerStatusSnapshot(
  customerInput: unknown,
): BillingCustomerStatusSnapshot {
  const customer = isRecord(customerInput) ? customerInput : {};
  const organizationId = typeof customer.id === "string" ? customer.id : null;
  if (!organizationId) {
    throw new Error("Autumn customer is missing an id");
  }

  const rawSubs = Array.isArray(customer.subscriptions)
    ? customer.subscriptions
    : [];
  const subscriptions = rawSubs.filter(isRecord);
  const subscription = selectTierSubscription(subscriptions);
  const planTier = subscription
    ? (planTierFromAutumnPlanId(
        typeof subscription.planId === "string" ? subscription.planId : null,
      ) ?? "free")
    : "free";

  return {
    organizationId,
    isPaying: subscription?.status === "active",
    paidPlanId:
      typeof subscription?.planId === "string" ? subscription.planId : null,
    paidPlanStatus:
      typeof subscription?.status === "string" ? subscription.status : null,
    planTier,
    autumnSubscriptionId:
      typeof subscription?.id === "string" ? subscription.id : null,
    currentPeriodEnd:
      typeof subscription?.currentPeriodEnd === "string"
        ? subscription.currentPeriodEnd
        : null,
    // Full payload kept verbatim — query rarely-used fields via json_extract.
    customerJson: JSON.stringify(customerInput),
    syncedAt: new Date().toISOString(),
  };
}

// Select the highest-tier active subscription. Scans for any of the tiered
// plan ids (lite/pro/agency), preferring "active" status. Falls back to null
// (free tier) when no tiered subscription is found.
function selectTierSubscription(
  subscriptions: Record<string, unknown>[],
): Record<string, unknown> | null {
  const tieredPlanIds = new Set<string>(
    (["lite", "pro", "agency"] as const)
      .map((tier) => AUTUMN_PLAN_IDS[tier])
      .filter((id): id is string => id !== null),
  );

  const tiered = subscriptions.filter((s) => {
    const planId = typeof s.planId === "string" ? s.planId : null;
    return planId !== null && tieredPlanIds.has(planId);
  });

  if (tiered.length === 0) return null;

  // Prefer active, then any (trialing, past_due, etc.)
  return tiered.find((s) => s.status === "active") ?? tiered[0] ?? null;
}
