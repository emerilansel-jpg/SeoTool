import { describe, expect, it } from "vitest";
import {
  createKeywordProMarker,
  parseKeywordProMarker,
} from "./keyword-pro-membership";

describe("Keyword Research Pro PayPal marker", () => {
  it("round-trips organization and cohort without confusing main plans", () => {
    const marker = createKeywordProMarker("org-123", "krp_founder_10");
    expect(parseKeywordProMarker(marker)).toEqual({
      organizationId: "org-123",
      cohortKey: "krp_founder_10",
    });
    expect(parseKeywordProMarker("org-123")).toBeNull();
    expect(parseKeywordProMarker("topup:org-123:123")).toBeNull();
  });
});
