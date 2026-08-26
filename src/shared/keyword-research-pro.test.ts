import { describe, expect, it } from "vitest";
import {
  calculateContentScore,
  calculateKgr,
  calculateLinkScore,
  calculateTotalScore,
  estimateKeywordResearchProCost,
  median,
  opportunityLabel,
  titleContainsKeyword,
} from "./keyword-research-pro";

describe("Keyword Research Pro scoring", () => {
  it("computes classic KGR and handles missing volume", () => {
    expect(calculateKgr(25, 100)).toBe(0.25);
    expect(calculateKgr(10, 0)).toBeNull();
    expect(calculateKgr(null, 100)).toBeNull();
  });

  it("normalizes punctuation and case for title matching", () => {
    expect(
      titleContainsKeyword("The Best SEO-Tools for Agencies", "best seo tools"),
    ).toBe(true);
    expect(titleContainsKeyword("SEO software guide", "best seo tools")).toBe(
      false,
    );
  });

  it("rewards strong content and link opportunities", () => {
    const content = calculateContentScore({
      kgr: 0.2,
      titleMatches: 2,
      weakSerpCount: 7,
      keywordDifficulty: 20,
    });
    const links = calculateLinkScore({
      medianPageRank: 15,
      medianDomainRank: 25,
      medianReferringDomains: 5,
      weakSerpCount: 7,
      medianSpamScore: 10,
    });
    expect(content).toBeGreaterThanOrEqual(75);
    expect(links).toBeGreaterThanOrEqual(70);
    expect(calculateTotalScore(content, links)).toBeGreaterThanOrEqual(70);
  });

  it("uses content score alone in basic mode", () => {
    expect(calculateTotalScore(67, null)).toBe(67);
    expect(opportunityLabel(67)).toBe("Easy");
  });

  it("calculates medians without mutating nulls into zeros", () => {
    expect(median([null, 10, 30, 20])).toBe(20);
    expect(median([10, 20])).toBe(15);
    expect(median([null])).toBeNull();
  });

  it("quotes standard and BYOK estimates with the requested margins", () => {
    const standard = estimateKeywordResearchProCost(10, "full", "standard");
    const byok = estimateKeywordResearchProCost(10, "full", "byok");
    expect(standard.seoToolCharge).toBeCloseTo(standard.raw * 1.3, 5);
    expect(byok.seoToolCharge).toBeCloseTo(byok.raw * 0.1, 5);
    expect(byok.totalOutlay).toBeCloseTo(byok.raw * 1.1, 5);
  });
});
