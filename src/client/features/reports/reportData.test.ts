import { describe, expect, it } from "vitest";
import {
  formatPlatform,
  getReportSectionLabel,
  isDeliverySchedule,
  isReportPeriod,
  parseSnapshotData,
  readNumber,
  readString,
  readValue,
} from "./reportDataCore";
import {
  buildAiTrackingModel,
  buildBrandLookupModel,
  buildGmbGridModel,
} from "./reportModels";

describe("flexible readers", () => {
  it("resolves nested paths with fallbacks", () => {
    const source = { summary: { totalScans: 12 } };
    expect(
      readValue(source, ["metrics.totalScans", "summary.totalScans"]),
    ).toBe(12);
    expect(readValue(source, ["missing.path"])).toBeUndefined();
  });

  it("matches keys regardless of case and separators", () => {
    expect(readValue({ Total_Scans: 7 }, ["totalScans"])).toBe(7);
    expect(readValue({ "share-of-voice": 4 }, ["shareOfVoice"])).toBe(4);
  });

  it("parses numeric strings with currency and percent symbols", () => {
    expect(readNumber({ value: "$1,234.5" }, ["value"])).toBe(1234.5);
    expect(readNumber({ value: "12.5%" }, ["value"])).toBe(12.5);
    expect(readNumber({ value: "not a number" }, ["value"])).toBeUndefined();
    expect(readNumber({ value: 3 }, ["value"])).toBe(3);
  });

  it("stringifies finite numbers and rejects empties", () => {
    expect(readString({ label: 42 }, ["label"])).toBe("42");
    expect(readString({ label: "   " }, ["label"])).toBeUndefined();
  });
});

describe("labels and guards", () => {
  it("maps section types to human labels", () => {
    expect(getReportSectionLabel("gmb_grid")).toBe("Local Map Rank");
    expect(getReportSectionLabel("brand_lookup")).toBe("Brand Lookup");
    expect(getReportSectionLabel("ai_tracking")).toBe("Generative AI");
    expect(getReportSectionLabel("custom_thing")).toBe("Custom Thing");
  });

  it("validates periods and schedules", () => {
    expect(isReportPeriod("yearly")).toBe(true);
    expect(isReportPeriod("daily")).toBe(false);
    expect(isDeliverySchedule("none")).toBe(true);
    expect(isDeliverySchedule("monthly")).toBe(true);
    expect(isDeliverySchedule("hourly")).toBe(false);
  });

  it("formats AI platform names", () => {
    expect(formatPlatform("chat_gpt")).toBe("ChatGPT");
    expect(formatPlatform("google")).toBe("Google AI Overview");
    expect(formatPlatform(undefined)).toBe("All platforms");
  });
});

describe("parseSnapshotData", () => {
  it("parses ok, skipped and error sections", () => {
    const parsed = parseSnapshotData(
      JSON.stringify({
        generatedAt: "2026-01-01T00:00:00Z",
        range: { startDate: "2026-01-01", endDate: "2026-01-31" },
        sections: {
          rank: { status: "ok", data: { top10: 5 } },
          gsc: { status: "skipped", reason: "not connected" },
          ga4: { status: "error", error: "boom" },
        },
      }),
    );
    expect(parsed?.sections.rank).toEqual({ status: "ok", data: { top10: 5 } });
    expect(parsed?.sections.gsc).toEqual({
      status: "skipped",
      reason: "not connected",
    });
    expect(parsed?.sections.ga4).toEqual({ status: "error", error: "boom" });
  });

  it("wraps bare section payloads without a status envelope", () => {
    const parsed = parseSnapshotData(
      JSON.stringify({
        sections: { rank: { top10: 3 } },
      }),
    );
    expect(parsed?.sections.rank).toEqual({ status: "ok", data: { top10: 3 } });
  });

  it("returns null for invalid JSON or missing sections", () => {
    expect(parseSnapshotData("not json")).toBeNull();
    expect(parseSnapshotData(JSON.stringify({ sections: "nope" }))).toBeNull();
  });
});

describe("buildGmbGridModel", () => {
  it("reads current and previous metrics plus trend rows", () => {
    const model = buildGmbGridModel({
      summary: {
        totalScans: 9,
        current: { solv: 33.3, averageRank: 4.2, top3: 30 },
        previous: { solv: 25.1, averageRank: 5.8 },
      },
      trend: [
        { label: "Jan", solv: 25 },
        { label: "Feb", solv: 33.3 },
      ],
      keywordLocations: [
        {
          keyword: "dentist near me",
          location: "Austin",
          scans: 3,
          solv: 40,
          averageRank: 2.5,
        },
      ],
      completedScans: 8,
      totalScans: 9,
    });
    expect(model.totalScans).toBe(9);
    expect(model.metrics.solv.current).toBe(33.3);
    expect(model.metrics.solv.previous).toBe(25.1);
    expect(model.metrics.top3.current).toBe(30);
    expect(model.trend).toHaveLength(2);
    expect(model.keywordLocations[0]?.keyword).toBe("dentist near me");
    expect(model.completeness?.percent).toBeCloseTo(88.9, 1);
  });

  it("stays safe on empty payloads", () => {
    const model = buildGmbGridModel(undefined);
    expect(model.totalScans).toBeUndefined();
    expect(model.metrics.solv.current).toBeUndefined();
    expect(model.trend).toEqual([]);
    expect(model.completeness).toBeUndefined();
  });
});

describe("buildBrandLookupModel", () => {
  it("reads target, totals, platform breakdown and share of voice", () => {
    const model = buildBrandLookupModel({
      resolvedTarget: "acme.com",
      totalMentions: 120,
      totalAiSearchVolume: 900,
      fetchedAt: "2026-02-01T00:00:00Z",
      perPlatform: [
        {
          platform: "chat_gpt",
          status: "success",
          mentions: 80,
          aiSearchVolume: 500,
        },
        { platform: "google", status: "error" },
      ],
      shareOfVoice: {
        entries: [
          { label: "acme.com", isTarget: true, mentions: 80, sharePct: 57.1 },
          { label: "rival.com", isTarget: false, mentions: 60, sharePct: 42.9 },
        ],
      },
    });
    expect(model.target).toBe("acme.com");
    expect(model.totalMentions).toBe(120);
    expect(model.platforms).toHaveLength(2);
    expect(model.sovEntries[0]?.isTarget).toBe(true);
    expect(model.completeness?.percent).toBe(50);
  });

  it("derives platform coverage completeness", () => {
    const model = buildBrandLookupModel({
      perPlatform: [
        { platform: "chat_gpt", status: "success" },
        { platform: "google", status: "success" },
      ],
    });
    expect(model.completeness?.percent).toBe(100);
  });
});

describe("buildAiTrackingModel", () => {
  it("reads metrics with kpi fallbacks, sentiment record and tables", () => {
    const model = buildAiTrackingModel({
      target: "acme.com",
      visibilityScore: 71.5,
      kpi: { mentionCoveragePercent: 62, visibilityScore: 71.5 },
      sentiment: {
        positive: 6,
        positivePercent: 60,
        negative: 2,
        negativePercent: 20,
      },
      competitors: [
        {
          brandName: "rival.com",
          mentionsCount: 40,
          visibilityPct: 35,
          shareOfVoice: 30,
        },
      ],
      topCitedPages: [
        { url: "https://acme.com/guide", domain: "acme.com", citations: 12 },
      ],
      promptMovers: [
        { prompt: "best crm tools", previous: 8, current: 3, change: -5 },
      ],
      promptsCompleted: 9,
      promptsTotal: 10,
    });
    expect(model.metrics.visibility.current).toBe(71.5);
    expect(model.metrics.mentionRate.current).toBe(62);
    expect(model.sentiment).toEqual([
      { label: "positive", count: 6, percent: 60 },
      { label: "negative", count: 2, percent: 20 },
    ]);
    expect(model.competitors[0]?.label).toBe("rival.com");
    expect(model.topCitedPages[0]?.citations).toBe(12);
    expect(model.promptMovers[0]?.change).toBe(-5);
    expect(model.completeness?.percent).toBe(90);
  });

  it("stays safe on empty payloads", () => {
    const model = buildAiTrackingModel(null);
    expect(model.metrics.visibility.current).toBeUndefined();
    expect(model.sentiment).toEqual([]);
    expect(model.competitors).toEqual([]);
    expect(model.completeness).toBeUndefined();
  });
});
