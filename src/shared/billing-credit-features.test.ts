import { describe, expect, it } from "vitest";
import { mapDataforseoPathToCreditFeature } from "./billing-credit-features";

describe("mapDataforseoPathToCreditFeature", () => {
  it("maps ranked keyword and relevant-page Labs endpoints to domain overview", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "ranked_keywords",
        "live",
      ]),
    ).toBe("domain_overview");
    expect(
      mapDataforseoPathToCreditFeature([
        "dataforseo_labs",
        "google",
        "relevant_pages",
        "live",
      ]),
    ).toBe("domain_overview");
  });

  it("does not charge unknown or empty paths to the site-audit bucket", () => {
    expect(mapDataforseoPathToCreditFeature([])).toBe("keyword_research");
    expect(mapDataforseoPathToCreditFeature(["unknown_module"])).toBe(
      "keyword_research",
    );
  });
});
