import { describe, expect, it } from "vitest";
import {
  createKeywordProMarker,
  hasMembershipAccess,
  parseKeywordProMarker,
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
