import { describe, expect, it } from "vitest";
import {
  createKeywordProMarker,
  hasMembershipAccess,
  parseKeywordProMarker,
  resolveAllAccessFeatureEntitlement,
} from "./keyword-pro-membership";

describe("All Access PayPal marker", () => {
  it("round-trips organization and cohort without confusing main plans", () => {
    const marker = createKeywordProMarker("org-123", "krp_founder_10");
    expect(parseKeywordProMarker(marker)).toEqual({
      organizationId: "org-123",
      cohortKey: "krp_founder_10",
    });
    expect(parseKeywordProMarker("org-123")).toBeNull();
    expect(parseKeywordProMarker("topup:org-123:123")).toBeNull();
  });

  it("keeps legacy KRP subscription markers readable", () => {
    expect(parseKeywordProMarker("krp:org-old:krp_founder_10")).toEqual({
      organizationId: "org-old",
      cohortKey: "krp_founder_10",
    });
    expect(parseKeywordProMarker("krp:org-old:krp_growth_45")).toEqual({
      organizationId: "org-old",
      cohortKey: "krp_growth_45",
    });
    expect(parseKeywordProMarker("krp:org-old:krp_scale_75")).toEqual({
      organizationId: "org-old",
      cohortKey: "krp_scale_75",
    });
  });
});

describe("All Access grace period", () => {
  const now = new Date("2026-08-27T00:00:00.000Z");

  it("allows active and recently suspended memberships", () => {
    expect(hasMembershipAccess("ACTIVE", null, now)).toBe(true);
    expect(
      hasMembershipAccess("SUSPENDED", "2026-08-20T00:00:00.000Z", now),
    ).toBe(true);
  });

  it("ends access after grace or cancellation", () => {
    expect(
      hasMembershipAccess("SUSPENDED", "2026-08-01T00:00:00.000Z", now),
    ).toBe(false);
    expect(hasMembershipAccess("CANCELLED", "2026-09-01", now)).toBe(false);
  });
});

describe("All Access feature entitlement", () => {
  const now = new Date("2026-08-27T00:00:00.000Z");

  it("allows both active All Access members and active legacy paid plans", () => {
    expect(
      resolveAllAccessFeatureEntitlement(
        {
          membershipStatus: "ACTIVE",
          membershipCurrentPeriodEnd: null,
          subscription: null,
        },
        now,
      ),
    ).toEqual({
      hasAccess: true,
      hasLegacyPaidPlan: false,
      hasFeatureAccess: true,
    });

    expect(
      resolveAllAccessFeatureEntitlement(
        {
          membershipStatus: null,
          membershipCurrentPeriodEnd: null,
          subscription: {
            planTier: "pro",
            status: "active",
            currentPeriodEnd: "2026-09-27T00:00:00.000Z",
          },
        },
        now,
      ),
    ).toEqual({
      hasAccess: false,
      hasLegacyPaidPlan: true,
      hasFeatureAccess: true,
    });
  });

  it("denies free and expired legacy subscriptions", () => {
    expect(
      resolveAllAccessFeatureEntitlement(
        {
          membershipStatus: "CANCELLED",
          membershipCurrentPeriodEnd: "2026-09-27T00:00:00.000Z",
          subscription: {
            planTier: "free",
            status: "active",
            currentPeriodEnd: null,
          },
        },
        now,
      ).hasFeatureAccess,
    ).toBe(false);

    expect(
      resolveAllAccessFeatureEntitlement(
        {
          membershipStatus: null,
          membershipCurrentPeriodEnd: null,
          subscription: {
            planTier: "pro",
            status: "past_due",
            currentPeriodEnd: "2026-08-01T00:00:00.000Z",
          },
        },
        now,
      ).hasFeatureAccess,
    ).toBe(false);
  });
});
