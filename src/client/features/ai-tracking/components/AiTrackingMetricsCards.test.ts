import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AiTrackingKpiCards } from "./AiTrackingKpiCards";
import { AiTrackingPositionCard } from "./AiTrackingPositionCard";
import { AiTrackingSentimentCard } from "./AiTrackingSentimentCard";

describe("AI tracking overview cards", () => {
  it("renders clear KPI denominators", () => {
    const markup = renderToStaticMarkup(
      createElement(AiTrackingKpiCards, {
        kpi: {
          mentionCoveragePercent: 75,
          positiveMentions: 2,
          positiveMentionPercent: 50,
          averageListPosition: null,
          listPositionSamples: 0,
          totalResponses: 4,
          brandMentions: 3,
        },
        selectedPlatform: "all",
        onSelectPlatform: vi.fn(),
        availablePlatforms: ["chat_gpt"],
      }),
    );

    expect(markup).toContain("Mention Coverage");
    expect(markup).toContain("3 of 4");
    expect(markup).toContain("Positive Mentions");
    expect(markup).toContain("2 of 3");
    expect(markup).not.toContain("Brand Reputation");
  });

  it("renders neutral-only sentiment truthfully", () => {
    const markup = renderToStaticMarkup(
      createElement(AiTrackingSentimentCard, {
        sentiment: {
          positive: 0,
          mixed: 0,
          neutral: 2,
          negative: 0,
          total: 2,
          positivePercent: 0,
          mixedPercent: 0,
          neutralPercent: 100,
          negativePercent: 0,
          topInsights: [
            {
              text: "Zoho is a CRM platform.",
              count: 2,
              sentiment: "neutral",
            },
          ],
        },
      }),
    );

    expect(markup).toContain("100%");
    expect(markup).toContain("Neutral (2 · 100%)");
    expect(markup).toContain("Positive (0 · 0%)");
    expect(markup).toContain("Mention Evidence");
  });

  it("renders an empty sentiment state without a green segment", () => {
    const markup = renderToStaticMarkup(
      createElement(AiTrackingSentimentCard, {
        sentiment: {
          positive: 0,
          mixed: 0,
          neutral: 0,
          negative: 0,
          total: 0,
          positivePercent: 0,
          mixedPercent: 0,
          neutralPercent: 0,
          negativePercent: 0,
          topInsights: [],
        },
      }),
    );

    expect(markup).toContain("No tracked brand mentions yet.");
    expect(markup).not.toContain("bg-emerald-500 transition-all");
  });

  it("explains mentions that have no numbered-list position", () => {
    const markup = renderToStaticMarkup(
      createElement(AiTrackingPositionCard, {
        brandName: "Zoho",
        domain: "zoho.com",
        averageListPosition: null,
        listPositionSamples: 0,
        brandMentions: 8,
        positionTrend: [],
        competitors: [
          {
            domain: "salesforce.com",
            brandName: "Salesforce",
            isTargetBrand: false,
            avgPosition: 0,
            mentionsCount: 10,
            visibilityPct: 83,
          },
          {
            domain: "zoho.com",
            brandName: "Zoho",
            isTargetBrand: true,
            avgPosition: 0,
            mentionsCount: 8,
            visibilityPct: 67,
          },
        ],
      }),
    );

    expect(markup).toContain("Detected List Position");
    expect(markup).toContain(
      "8 tracked mentions found, but 0 ranked-list samples were available.",
    );
    expect(markup).toContain("Tracked Mention Rank");
    expect(markup).toContain("#2");
    expect(markup).toContain("Derived from tracked AI responses");
  });
});
