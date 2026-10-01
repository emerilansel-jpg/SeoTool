import { describe, expect, it } from "vitest";
import { buildCsv } from "@/client/lib/csv";
import type { BrandLookupResult } from "@/types/schemas/ai-search";
import {
  buildBrandLookupReportExport,
  getBrandLookupReportMonthlyVolume,
} from "./brandLookupExport";

const result: BrandLookupResult = {
  query: "Acme",
  detectedTargetType: "keyword",
  resolvedTarget: "Acme",
  fetchedAt: "2026-09-30T12:00:00.000Z",
  hasData: true,
  totalMentions: 42,
  totalAiSearchVolume: 900,
  perPlatform: [
    {
      platform: "chat_gpt",
      status: "success",
      mentions: 25,
      aiSearchVolume: 600,
    },
    {
      platform: "google",
      status: "success",
      mentions: 17,
      aiSearchVolume: 300,
    },
  ],
  shareOfVoice: {
    platforms: ["chat_gpt", "google"],
    entries: [
      { label: "Acme", isTarget: true, mentions: 42, sharePct: 60 },
      { label: "=Rival", isTarget: false, mentions: 28, sharePct: 40 },
    ],
  },
  monthlyVolume: Array.from({ length: 12 }, (_, index) => ({
    year: 2025 + Math.floor((index + 10) / 12),
    month: ((index + 10) % 12) + 1,
    volume: 100 + index,
  })),
  topQueries: [
    {
      question: "+best Acme alternative",
      platform: "chat_gpt",
      aiSearchVolume: 75,
      firstSeenAt: "2026-08-01",
      lastSeenAt: "2026-09-01",
      citedSources: [],
      brandsMentioned: ["Acme"],
    },
  ],
  topPages: [
    {
      url: "https://example.com/acme",
      domain: "example.com",
      platform: "google",
      mentions: 5,
      capturedVolume: 80,
      keywords: [{ question: "What is Acme?", aiSearchVolume: 80 }],
    },
  ],
};

describe("buildBrandLookupReportExport", () => {
  it("includes summary, platform, share, volume, query, and page rows", () => {
    const table = buildBrandLookupReportExport(result, 365);

    expect(table.rows).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(["Summary", "Total mentions", "Acme", "", 42]),
        expect.arrayContaining([
          "Platform",
          "Mentions",
          "ChatGPT",
          "ChatGPT",
          25,
        ]),
        expect.arrayContaining([
          "Share of Voice",
          "Mention share",
          "Acme",
          "ChatGPT; Google AI Overview",
          42,
          60,
        ]),
        expect.arrayContaining([
          "Top query",
          "AI search volume",
          "+best Acme alternative",
        ]),
        expect.arrayContaining(["Top page", "Source mentions", "example.com"]),
      ]),
    );
    expect(
      table.rows.filter((row) => row[0] === "Monthly volume"),
    ).toHaveLength(12);
  });

  it("uses only the latest monthly source point for weekly reports", () => {
    expect(getBrandLookupReportMonthlyVolume(result, 7)).toEqual([
      result.monthlyVolume.at(-1),
    ]);
  });

  it("relies on the shared CSV sanitizer for formula-like values", () => {
    const table = buildBrandLookupReportExport(result, 30);
    const csv = buildCsv(table.headers, table.rows);

    expect(csv).toContain('"\'+best Acme alternative"');
    expect(csv).toContain('"\'=Rival"');
  });
});
