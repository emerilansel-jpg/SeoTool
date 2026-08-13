import { describe, expect, it } from "vitest";
import { deriveBillingCustomerStatusSnapshot } from "./customer-status-model";
import { PAYPAL_PLAN_IDS } from "@/shared/plans";

describe("deriveBillingCustomerStatusSnapshot", () => {
  it("marks customers with an active lite subscription as paying + tier=lite", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      organizationId: "org_123",
      subscription: {
        id: "sub_1",
        plan_id: PAYPAL_PLAN_IDS.lite,
        status: "ACTIVE",
      },
    });

    expect(snapshot).toMatchObject({
      organizationId: "org_123",
      isPaying: true,
      paidPlanId: PAYPAL_PLAN_IDS.lite,
      paidPlanStatus: "active",
      planTier: "lite",
      paypalSubscriptionId: "sub_1",
    });
  });

  it("preserves the full subscription payload in customerJson", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      organizationId: "org_123",
      subscription: {
        id: "sub_2",
        plan_id: PAYPAL_PLAN_IDS.pro,
        status: "ACTIVE",
        custom_id: "org_123",
      },
    });

    expect(JSON.parse(snapshot.customerJson)).toMatchObject({
      id: "sub_2",
      plan_id: PAYPAL_PLAN_IDS.pro,
      status: "ACTIVE",
    });
  });

  it("defaults to free tier when no tiered subscription exists", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      organizationId: "org_123",
      subscription: { plan_id: "unknown-plan", status: "ACTIVE" },
    });

    expect(snapshot.isPaying).toBe(false);
    expect(snapshot.paidPlanId).toBe("unknown-plan");
    expect(snapshot.planTier).toBe("free");
  });

  it("defaults to free tier when subscription has no plan_id", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      organizationId: "org_123",
      subscription: { status: "ACTIVE" },
    });

    expect(snapshot.planTier).toBe("free");
    expect(snapshot.isPaying).toBe(false);
  });

  it("maps CANCELLED status to canceled", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      organizationId: "org_456",
      subscription: {
        plan_id: PAYPAL_PLAN_IDS.lite,
        status: "CANCELLED",
      },
    });

    expect(snapshot).toMatchObject({
      organizationId: "org_456",
      isPaying: false,
      paidPlanStatus: "canceled",
      planTier: "lite",
    });
  });

  it("maps SUSPENDED status to past_due", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      organizationId: "org_456",
      subscription: {
        plan_id: PAYPAL_PLAN_IDS.lite,
        status: "SUSPENDED",
      },
    });

    expect(snapshot.paidPlanStatus).toBe("past_due");
  });

  it("extracts next_billing_time as currentPeriodEnd", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      organizationId: "org_period",
      subscription: {
        plan_id: PAYPAL_PLAN_IDS.agency,
        status: "ACTIVE",
        next_billing_time: "2026-09-01T00:00:00Z",
      },
    });

    expect(snapshot.planTier).toBe("agency");
    expect(snapshot.currentPeriodEnd).toBe("2026-09-01T00:00:00Z");
  });
});
