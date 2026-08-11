import { describe, expect, it } from "vitest";
import { deriveBillingCustomerStatusSnapshot } from "./customer-status-model";
import { AUTUMN_PLAN_IDS } from "@/shared/plans";

describe("deriveBillingCustomerStatusSnapshot", () => {
  it("marks customers with an active lite subscription as paying + tier=lite", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_123",
      subscriptions: [
        { id: "sub_1", planId: AUTUMN_PLAN_IDS.lite, status: "active" },
      ],
    });

    expect(snapshot).toMatchObject({
      organizationId: "org_123",
      isPaying: true,
      paidPlanId: AUTUMN_PLAN_IDS.lite,
      paidPlanStatus: "active",
      planTier: "lite",
      autumnSubscriptionId: "sub_1",
    });
  });

  it("preserves the full customer payload in customerJson", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_123",
      email: "alice@example.com",
      stripeId: "cus_123",
      subscriptions: [{ planId: AUTUMN_PLAN_IDS.pro, status: "active" }],
    });

    expect(JSON.parse(snapshot.customerJson)).toMatchObject({
      id: "org_123",
      email: "alice@example.com",
      stripeId: "cus_123",
    });
  });

  it("defaults to free tier when no tiered subscription exists", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_123",
      subscriptions: [{ planId: "free", status: "active" }],
    });

    expect(snapshot.isPaying).toBe(false);
    expect(snapshot.paidPlanId).toBeNull();
    expect(snapshot.paidPlanStatus).toBeNull();
    expect(snapshot.planTier).toBe("free");
    expect(snapshot.autumnSubscriptionId).toBeNull();
  });

  it("defaults to free tier when no subscriptions exist", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_123",
      subscriptions: [],
    });

    expect(snapshot.planTier).toBe("free");
    expect(snapshot.isPaying).toBe(false);
  });

  it("records a scheduled (not-yet-active) plan as not paying", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_456",
      subscriptions: [{ planId: AUTUMN_PLAN_IDS.lite, status: "scheduled" }],
    });

    expect(snapshot).toMatchObject({
      organizationId: "org_456",
      isPaying: false,
      paidPlanId: AUTUMN_PLAN_IDS.lite,
      paidPlanStatus: "scheduled",
      planTier: "lite",
    });
  });

  it("prefers an active subscription when multiple tiers exist", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_789",
      subscriptions: [
        { planId: AUTUMN_PLAN_IDS.lite, status: "scheduled" },
        { planId: AUTUMN_PLAN_IDS.pro, status: "active" },
      ],
    });

    expect(snapshot.isPaying).toBe(true);
    expect(snapshot.paidPlanId).toBe(AUTUMN_PLAN_IDS.pro);
    expect(snapshot.paidPlanStatus).toBe("active");
    expect(snapshot.planTier).toBe("pro");
  });

  it("extracts currentPeriodEnd from the subscription", () => {
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_period",
      subscriptions: [
        {
          planId: AUTUMN_PLAN_IDS.agency,
          status: "active",
          currentPeriodEnd: "2026-09-01T00:00:00Z",
        },
      ],
    });

    expect(snapshot.planTier).toBe("agency");
    expect(snapshot.currentPeriodEnd).toBe("2026-09-01T00:00:00Z");
  });

  it("throws when customer has no id", () => {
    expect(() =>
      deriveBillingCustomerStatusSnapshot({ subscriptions: [] }),
    ).toThrow("missing an id");
  });

  it("handles unknown / malformed customer payload gracefully", () => {
    // Defensive: the SDK payload could be anything; the model must not crash.
    const snapshot = deriveBillingCustomerStatusSnapshot({
      id: "org_safe",
    });
    expect(snapshot.planTier).toBe("free");
    expect(snapshot.isPaying).toBe(false);
  });
});
