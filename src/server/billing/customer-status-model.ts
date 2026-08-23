import { planTierFromPaypalPlanId, type PlanTier } from "@/shared/plans";

export type BillingCustomerStatusSnapshot = {
  organizationId: string;
  isPaying: boolean;
  paidPlanId: string | null;
  paidPlanStatus: string | null;
  planTier: PlanTier;
  paypalSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  customerJson: string;
  syncedAt: string;
};

/** Derive a billing snapshot from a PayPal subscription resource object.
 *  Called by the webhook handler after fetching the subscription from PayPal.
 *  `planIdToTier` maps admin-configured PayPal plan ids to tiers; plan ids not
 *  in the map fall back to the static map in shared/plans.ts. */
export function deriveBillingCustomerStatusSnapshot(args: {
  organizationId: string;
  subscription: Record<string, unknown>;
  planIdToTier?: ReadonlyMap<string, PlanTier>;
}): BillingCustomerStatusSnapshot {
  const { organizationId, subscription: sub } = args;

  const planId = typeof sub.plan_id === "string" ? sub.plan_id : null;
  const planTier =
    (planId ? (args.planIdToTier?.get(planId) ?? null) : null) ??
    planTierFromPaypalPlanId(planId) ??
    "free";

  // Map PayPal statuses to our internal status strings
  const paypalStatus = typeof sub.status === "string" ? sub.status : "UNKNOWN";
  const internalStatus = mapPaypalStatus(paypalStatus);

  // next_billing_time is ISO-8601
  const currentPeriodEnd =
    typeof sub.next_billing_time === "string" ? sub.next_billing_time : null;

  return {
    organizationId,
    isPaying: paypalStatus === "ACTIVE",
    paidPlanId: planId,
    paidPlanStatus: internalStatus,
    planTier,
    paypalSubscriptionId: typeof sub.id === "string" ? sub.id : null,
    currentPeriodEnd,
    customerJson: JSON.stringify(sub),
    syncedAt: new Date().toISOString(),
  };
}

/** Map PayPal subscription status to our internal status string. */
function mapPaypalStatus(paypalStatus: string): string {
  switch (paypalStatus) {
    case "ACTIVE":
      return "active";
    case "CANCELLED":
      return "canceled";
    case "EXPIRED":
      return "canceled";
    case "SUSPENDED":
      return "past_due";
    case "APPROVAL_PENDING":
    case "APPROVED":
      return "active";
    default:
      return "active";
  }
}
