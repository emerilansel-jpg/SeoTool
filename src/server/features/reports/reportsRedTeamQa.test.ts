import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {}, waitUntil: vi.fn() }));

const gmbRepoMock = vi.hoisted(() => ({
  listConfigsForProject: vi.fn(),
  listRunsForDateRange: vi.fn(),
  getCompletedSnapshotsForRuns: vi.fn(),
}));
vi.mock("@/server/features/gmb-grid/repositories/GmbGridRepository", () => ({
  GmbGridRepository: gmbRepoMock,
}));

const brandLookupRepoMock = vi.hoisted(() => ({
  listSnapshotsForDateRange: vi.fn(),
  getLatestSnapshot: vi.fn(),
}));
vi.mock(
  "@/server/features/ai-search/repositories/BrandLookupRepository",
  () => ({
    BrandLookupRepository: brandLookupRepoMock,
  }),
);

const aiTrackingRepoMock = vi.hoisted(() => ({
  getConfig: vi.fn(),
  listVisibilitySnapshotsForDateRange: vi.fn(),
  getObservationsForDateRange: vi.fn(),
  getMentionsForObservations: vi.fn(),
  getCitationsForObservations: vi.fn(),
}));
vi.mock(
  "@/server/features/ai-tracking/repositories/AiTrackingRepository",
  () => ({
    AiTrackingRepository: aiTrackingRepoMock,
  }),
);

const serpVolatilityRepoMock = vi.hoisted(() => ({
  getCompletedFullRuns: vi.fn(),
  getForProjectDateRange: vi.fn(),
  getLatestForProject: vi.fn(),
  upsertForProjectDate: vi.fn(),
  getSnapshotsForRuns: vi.fn(),
}));
vi.mock(
  "@/server/features/serp-volatility/repositories/SerpVolatilityRepository",
  () => ({
    SerpVolatilityRepository: serpVolatilityRepoMock,
  }),
);

import { buildGmbSection } from "./sections/gmbSection";
import { buildBrandLookupSection } from "./sections/brandLookupSection";
import { buildAiTrackingSection } from "./sections/aiTrackingSection";
import { buildSnapshot } from "./services/ReportSnapshotBuilder";
import { SerpVolatilityService } from "../serp-volatility/services/SerpVolatilityService";
import {
  buildGmbGridModel,
  buildBrandLookupModel,
  buildAiTrackingModel,
} from "@/client/features/reports/reportModels";

const RANGE = {
  startDate: "2026-05-01",
  endDate: "2026-05-31",
  prevStartDate: "2026-04-01",
  prevEndDate: "2026-04-30",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Red Team Scenario 1: Local Map Rank edge cases", () => {
  it("handles zero points without NaN or divide-by-zero crashes", async () => {
    gmbRepoMock.listConfigsForProject.mockResolvedValueOnce([{ id: "cfg_zero" }]);
    gmbRepoMock.listRunsForDateRange.mockImplementation(async (_p: string, start: string) => {
      if (start.includes("2026-05-01")) {
        return [
          {
            run: {
              id: "run_zero",
              configId: "cfg_zero",
              status: "completed",
              totalPoints: 0,
              completedPoints: 0,
              failedPoints: 0,
              foundPoints: 0,
              solv: null,
              averageRank: null,
              costUsd: 0,
              startedAt: "2026-05-10T10:00:00.000Z",
              completedAt: "2026-05-10T10:01:00.000Z",
            },
            config: {
              id: "cfg_zero",
              businessName: "Zero Clinic",
              keyword: "doctor",
              gridSize: 0,
              radiusMeters: 1000,
            },
          },
        ];
      }
      return [];
    });
    gmbRepoMock.getCompletedSnapshotsForRuns.mockResolvedValueOnce([]);

    const res = await buildGmbSection("proj_1", RANGE);
    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.data.hasData).toBe(true);
    expect(res.data.current.dataCompletenessPct).toBe(0);
    expect(res.data.current.avgSolv).toBeNull();
    expect(res.data.current.avgRank).toBeNull();

    const model = buildGmbGridModel(res.data);
    expect(model.totalScans).toBe(1);
    expect(model.metrics.solv.current).toBeUndefined();
    expect(model.metrics.averageRank.current).toBeUndefined();
  });
});

describe("Red Team Scenario 2: Brand Lookup edge cases", () => {
  it("gracefully falls back when snapshot has null mentions/volumes", async () => {
    const mockSnap = {
      id: "snap_null",
      projectId: "proj_1",
      snapshotDate: "2026-05-15",
      query: "NullBrand",
      targetType: "brand",
      targetValue: "nullbrand",
      locationCode: 2840,
      languageCode: "en",
      fetchedAt: "2026-05-15T12:00:00.000Z",
      hasData: false,
      totalMentions: null,
      totalAiSearchVolume: null,
      platforms: [],
      sovEntries: [],
    };

    brandLookupRepoMock.listSnapshotsForDateRange.mockResolvedValue([mockSnap]);
    brandLookupRepoMock.getLatestSnapshot.mockResolvedValue(mockSnap);

    const res = await buildBrandLookupSection("proj_1", RANGE);
    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.data.current.avgTotalMentions).toBeNull();
    expect(res.data.current.avgTotalAiSearchVolume).toBeNull();

    const model = buildBrandLookupModel(res.data);
    expect(model.target).toBe("NullBrand");
    expect(model.totalMentions).toBeUndefined();
    expect(model.searchVolume).toBeUndefined();
  });
});

describe("Red Team Scenario 3: AI Tracking observations edge cases", () => {
  it("handles zero observations safely with zero sentiment and completeness", async () => {
    aiTrackingRepoMock.getConfig.mockResolvedValueOnce({
      id: "cfg_empty",
      brandName: "EmptyBrand",
      domain: "empty.com",
      platforms: ["chat_gpt"],
    });
    aiTrackingRepoMock.listVisibilitySnapshotsForDateRange.mockResolvedValue([]);
    aiTrackingRepoMock.getObservationsForDateRange.mockResolvedValue([]);
    aiTrackingRepoMock.getMentionsForObservations.mockResolvedValue([]);
    aiTrackingRepoMock.getCitationsForObservations.mockResolvedValue([]);

    const res = await buildAiTrackingSection("proj_1", RANGE);
    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.data.hasData).toBe(false);
    expect(res.data.current.avgVisibilityScore).toBeNull();
    expect(res.data.sentiment.positivePct).toBe(0);
    expect(res.data.dataCompleteness.completenessPct).toBe(0);

    const model = buildAiTrackingModel(res.data);
    expect(model.target).toBe("EmptyBrand");
    expect(model.metrics.visibility.current).toBeUndefined();
  });
});

describe("Red Team Scenario 4: SERP Volatility calculation and backfill safety", () => {
  it("throws VALIDATION_ERROR when insufficient run history exists", async () => {
    serpVolatilityRepoMock.getCompletedFullRuns.mockResolvedValueOnce([
      { id: "run_only_one", configId: "cfg_1", startedAt: "2026-05-10T10:00:00.000Z" },
    ]);

    await expect(
      SerpVolatilityService.computeVolatility("proj_1"),
    ).rejects.toThrow("Not enough rank tracking history");
  });

  it("computes volatility across two completed full runs with top movers", async () => {
    serpVolatilityRepoMock.getCompletedFullRuns.mockResolvedValueOnce([
      { id: "run_2", configId: "cfg_1", startedAt: "2026-05-20T10:00:00.000Z" },
      { id: "run_1", configId: "cfg_1", startedAt: "2026-05-10T10:00:00.000Z" },
    ]);

    serpVolatilityRepoMock.getSnapshotsForRuns.mockResolvedValueOnce([
      { runId: "run_2", trackingKeywordId: "kw_1", device: "desktop", keyword: "seo", position: 3 },
      { runId: "run_1", trackingKeywordId: "kw_1", device: "desktop", keyword: "seo", position: 10 },
      { runId: "run_2", trackingKeywordId: "kw_2", device: "desktop", keyword: "audit", position: null },
      { runId: "run_1", trackingKeywordId: "kw_2", device: "desktop", keyword: "audit", position: 5 },
    ]);

    const result = await SerpVolatilityService.computeVolatility("proj_1");
    expect(result.volatilityScore).toBeGreaterThan(0);
    expect(result.keywordsSampled).toBe(2);
    expect(result.topMovers.length).toBeGreaterThan(0);
    expect(serpVolatilityRepoMock.upsertForProjectDate).toHaveBeenCalled();
  });

  it("backfills missing dates idempotently without overwriting existing dates", async () => {
    const today = new Date();
    const d1 = new Date(today.getTime() - 10 * 86400000).toISOString();
    const d2 = new Date(today.getTime() - 5 * 86400000).toISOString();
    const d3 = new Date(today.getTime() - 2 * 86400000).toISOString();
    const d2Date = d2.slice(0, 10);

    serpVolatilityRepoMock.getCompletedFullRuns.mockResolvedValueOnce([
      { id: "run_3", configId: "cfg_1", startedAt: d3 },
      { id: "run_2", configId: "cfg_1", startedAt: d2 },
      { id: "run_1", configId: "cfg_1", startedAt: d1 },
    ]);

    // d2 date already exists
    serpVolatilityRepoMock.getForProjectDateRange.mockResolvedValueOnce([
      { date: d2Date, volatilityScore: 40 },
    ]);

    serpVolatilityRepoMock.getSnapshotsForRuns.mockResolvedValue([
      { runId: "run_3", trackingKeywordId: "kw_1", device: "desktop", keyword: "seo", position: 3 },
      { runId: "run_2", trackingKeywordId: "kw_1", device: "desktop", keyword: "seo", position: 4 },
      { runId: "run_1", trackingKeywordId: "kw_1", device: "desktop", keyword: "seo", position: 5 },
    ]);

    const created = await SerpVolatilityService.backfillMissingSnapshots("proj_1");
    // Should backfill for d3 date, skipping existing d2 date
    expect(created).toBe(1);
  });
});

describe("Red Team Scenario 5: Fault-tolerant snapshot generation", () => {
  it("continues building snapshot even when an unknown or failing section is encountered", async () => {
    gmbRepoMock.listConfigsForProject.mockResolvedValueOnce([]); // will return skipped
    brandLookupRepoMock.listSnapshotsForDateRange.mockResolvedValueOnce([]);
    brandLookupRepoMock.getLatestSnapshot.mockResolvedValueOnce(null); // will return skipped
    aiTrackingRepoMock.getConfig.mockResolvedValueOnce(null); // will return skipped

    const payload = await buildSnapshot({
      projectId: "proj_1",
      domain: "example.com",
      sections: [
        { id: "1", reportId: "r1", type: "gmb_grid", sortOrder: 0, config: null },
        { id: "2", reportId: "r1", type: "brand_lookup", sortOrder: 1, config: null },
        { id: "3", reportId: "r1", type: "ai_tracking", sortOrder: 2, config: null },
        { id: "4", reportId: "r1", type: "non_existent_section", sortOrder: 3, config: null },
      ],
      period: "monthly",
    });

    expect(payload.sections.gmb_grid.status).toBe("skipped");
    expect(payload.sections.brand_lookup.status).toBe("skipped");
    expect(payload.sections.ai_tracking.status).toBe("skipped");
    expect(payload.sections.non_existent_section.status).toBe("skipped");
    expect(payload.range.startDate).toBeDefined();
    expect(payload.range.endDate).toBeDefined();
  });
});
