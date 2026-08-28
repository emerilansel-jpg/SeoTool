import { describe, expect, it } from "vitest";
import { hasSubscriptionAccess } from "./subscription-access";

const now = new Date("2026-08-27T00:00:00.000Z");

describe("hasSubscriptionAccess", () => {
  it("requires both a paid tier and an active billing state", () => {
    expect(
      hasSubscriptionAccess(
        { planTier: "pro", status: "active", currentPeriodEnd: null },
        now,
      ),
    ).toBe(true);
    expect(
      hasSubscriptionAccess(
        { planTier: "free", status: "active", currentPeriodEnd: null },
        now,
      ),
    ).toBe(false);
    expect(
      hasSubscriptionAccess(
        { planTier: "pro", status: "canceled", currentPeriodEnd: null },
        now,
      ),
    ).toBe(false);
  });

  it("allows payment recovery only inside the 14-day grace period", () => {
    expect(
      hasSubscriptionAccess(
        {
          planTier: "pro",
          status: "past_due",
          currentPeriodEnd: "2026-08-20T00:00:00.000Z",
        },
        now,
      ),
    ).toBe(true);
    expect(
      hasSubscriptionAccess(
        {
          planTier: "pro",
          status: "past_due",
          currentPeriodEnd: "2026-08-01T00:00:00.000Z",
        },
        now,
      ),
    ).toBe(false);
  });
});
