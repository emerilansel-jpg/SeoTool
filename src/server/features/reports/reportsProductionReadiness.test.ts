import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {}, waitUntil: vi.fn() }));

import { parseSnapshotData } from "@/client/features/reports/reportDataCore";
import {
  calculateVolatilityScore,
  identifyTopMovers,
  type KeywordPositionChange,
} from "../serp-volatility/services/volatilityCalculation";
import { reportPdf } from "@/client/lib/reportPdf";
import type { ReportWithSections } from "./services/ReportService";

describe("GATE 2: Chaos & Resilience Testing", () => {
  it("safely handles corrupted snapshot JSON without crashing or throwing", () => {
    expect(parseSnapshotData("")).toBeNull();
    expect(parseSnapshotData("{ corrupted json")).toBeNull();
    expect(parseSnapshotData("[]")).toBeNull();
    expect(parseSnapshotData("{\"sections\": null}")).toBeNull();
    expect(parseSnapshotData("{\"sections\": \"invalid\"}")).toBeNull();
  });

  it("handles empty and malformed section objects inside snapshot JSON", () => {
    const raw = JSON.stringify({
      generatedAt: "2026-06-01T00:00:00Z",
      range: { startDate: "2026-05-01", endDate: "2026-05-31" },
      sections: {
        gmb_grid: null,
        brand_lookup: {},
        ai_tracking: { status: "unknown_status", data: null },
      },
    });

    const parsed = parseSnapshotData(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.sections.gmb_grid?.status).toBe("ok");
    expect(parsed?.sections.brand_lookup?.status).toBe("ok");
  });

  it("handles massive report payload (100+ items) in PDF export with multi-page pagination", () => {
    const report: ReportWithSections = {
      id: "rep_large",
      projectId: "proj_1",
      organizationId: "org_1",
      createdByUserId: "user_1",
      nextRunAt: null,
      name: "Massive Enterprise Audit",
      clientName: "Enterprise Client",
      reportPeriod: "yearly",
      schedule: "yearly",
      dayOfWeek: null,
      dayOfMonth: 1,
      monthOfYear: 1,
      logoUrl: null,
      brandColor: "#2563eb",
      accentColor: "#10b981",
      recipients: "enterprise@client.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      sections: [
        { id: "sec_1", reportId: "rep_large", type: "gmb_grid", sortOrder: 0, config: null },
        { id: "sec_2", reportId: "rep_large", type: "brand_lookup", sortOrder: 1, config: null },
        { id: "sec_3", reportId: "rep_large", type: "ai_tracking", sortOrder: 2, config: null },
      ],
    };

    const runs = Array.from({ length: 40 }, (_, i) => ({
      runId: `run_${i}`,
      configId: `cfg_${i % 5}`,
      businessName: `Branch Location #${i + 1}`,
      keyword: `keyword ${i + 1}`,
      gridSize: 5,
      radiusMeters: 5000,
      status: "completed",
      startedAt: "2026-05-01T10:00:00.000Z",
      completedAt: "2026-05-01T10:05:00.000Z",
      totalPoints: 25,
      completedPoints: 25,
      failedPoints: 0,
      foundPoints: 20,
      top3: 5,
      top10: 15,
      top20: 20,
      foundCoveragePct: 80,
      solv: 25,
      averageRank: 3.5,
      costUsd: 0.05,
    }));

    const competitors = Array.from({ length: 30 }, (_, i) => ({
      domain: `competitor${i}.com`,
      brandName: `Competitor ${i}`,
      isTargetBrand: i === 0,
      mentionsCount: 50 - i,
      avgPosition: 1.5 + i * 0.2,
    }));

    const topCitedPages = Array.from({ length: 30 }, (_, i) => ({
      url: `https://example.com/page-${i}`,
      domain: "example.com",
      isTargetBrand: true,
      frequency: 20 - (i % 10),
    }));

    const snapshotData = {
      generatedAt: "2026-06-01T00:00:00.000Z",
      range: { startDate: "2026-01-01", endDate: "2026-05-31" },
      sections: {
        gmb_grid: {
          status: "ok" as const,
          data: {
            hasData: true,
            current: {
              runsCount: runs.length,
              completedRunsCount: runs.length,
              avgSolv: 25,
              avgRank: 3.5,
              totalCostUsd: 2.0,
              dataCompletenessPct: 100,
            },
            previous: {
              runsCount: runs.length,
              completedRunsCount: runs.length,
              avgSolv: 20,
              avgRank: 4.0,
              totalCostUsd: 2.0,
              dataCompletenessPct: 100,
            },
            comparison: { solvDelta: 5, rankDelta: -0.5, costDelta: 0, runsDelta: 0 },
            runs,
          },
        },
        brand_lookup: {
          status: "ok" as const,
          data: {
            hasData: true,
            latestTarget: { query: "BigBrand", targetType: "brand", targetValue: "bigbrand", locationCode: 2840, languageCode: "en", fetchedAt: "2026-05-30" },
            dataFreshness: { lastFetchedAt: "2026-05-30", daysSinceLastFetch: 1 },
            current: {
              snapshotsCount: 10,
              avgTotalMentions: 500,
              avgTotalAiSearchVolume: 50000,
              platformTrends: [
                { platform: "chat_gpt" as const, latestMentions: 300, avgMentions: 300, points: [] },
                { platform: "google" as const, latestMentions: 200, avgMentions: 200, points: [] },
              ],
              sovEntries: [
                { label: "BigBrand", isTarget: true, mentions: 500, sharePct: 65 },
                { label: "Competitor A", isTarget: false, mentions: 150, sharePct: 20 },
                { label: "Competitor B", isTarget: false, mentions: 120, sharePct: 15 },
              ],
            },
            previous: { snapshotsCount: 10, avgTotalMentions: 400, avgTotalAiSearchVolume: 40000 },
            comparison: { mentionsDelta: 100, volumeDelta: 10000 },
            snapshots: [],
          },
        },
        ai_tracking: {
          status: "ok" as const,
          data: {
            hasData: true,
            config: { brandName: "BigBrand", domain: "example.com", platforms: ["chat_gpt", "google"] },
            current: { avgVisibilityScore: 82, avgMentionRate: 75, avgCitationRate: 60, avgShareOfVoice: 65, snapshotsCount: 10 },
            previous: { avgVisibilityScore: 75, avgMentionRate: 70, avgCitationRate: 55, avgShareOfVoice: 60, snapshotsCount: 10 },
            comparison: { visibilityDelta: 7, mentionRateDelta: 5, citationRateDelta: 5, shareOfVoiceDelta: 5 },
            sentiment: { positive: 80, mixed: 10, neutral: 8, negative: 2, positivePct: 80 },
            perPlatform: [
              { platform: "chat_gpt", responsesCount: 100, mentionsCount: 75, mentionRatePct: 75 },
              { platform: "google", responsesCount: 100, mentionsCount: 75, mentionRatePct: 75 },
            ],
            competitors,
            topCitedPages,
            promptMovers: [],
            dataCompleteness: { totalObservations: 200, successfulObservations: 200, completenessPct: 100 },
          },
        },
      },
    };

    const startTime = performance.now();
    expect(() => reportPdf(report, snapshotData)).not.toThrow();
    const duration = performance.now() - startTime;

    // Performance: Generating PDF with 100+ items should take < 500ms
    expect(duration).toBeLessThan(500);
  });
});

describe("GATE 2: Performance Benchmarking", () => {
  it("computes SERP volatility over 500 keyword changes in < 10ms", () => {
    const changes: KeywordPositionChange[] = Array.from({ length: 500 }, (_, i) => ({
      keyword: `keyword_${i}`,
      currentPosition: (i % 20) + 1,
      previousPosition: ((i + 3) % 25) + 1,
      unrankedPosition: 50,
    }));

    const start = performance.now();
    const score = calculateVolatilityScore(changes);
    const movers = identifyTopMovers(changes);
    const elapsed = performance.now() - start;

    expect(score).toBeGreaterThan(0);
    expect(movers).toHaveLength(5);
    expect(elapsed).toBeLessThan(10);
  });
});
