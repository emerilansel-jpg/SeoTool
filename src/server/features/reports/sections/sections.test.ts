import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { buildGmbSection } from "./gmbSection";
import { buildBrandLookupSection } from "./brandLookupSection";
import { buildAiTrackingSection } from "./aiTrackingSection";

const RANGE = {
  startDate: "2024-05-13",
  endDate: "2024-06-11",
  prevStartDate: "2024-04-13",
  prevEndDate: "2024-05-12",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildGmbSection", () => {
  it("returns skipped when no configs exist", async () => {
    gmbRepoMock.listConfigsForProject.mockResolvedValueOnce([]);
    const res = await buildGmbSection("proj_1", RANGE);
    expect(res.status).toBe("skipped");
  });

  it("calculates metrics, coverage, and comparison deltas from historical runs", async () => {
    gmbRepoMock.listConfigsForProject.mockResolvedValueOnce([{ id: "cfg_1" }]);
    gmbRepoMock.listRunsForDateRange.mockImplementation(
      async (_proj: string, start: string) => {
        if (start.includes("2024-05-13")) {
          return [
            {
              run: {
                id: "run_cur_1",
                configId: "cfg_1",
                status: "completed",
                totalPoints: 25,
                completedPoints: 25,
                failedPoints: 0,
                foundPoints: 15,
                solv: 24,
                averageRank: 3.5,
                costUsd: 0.05,
                startedAt: "2024-06-01T10:00:00.000Z",
                completedAt: "2024-06-01T10:05:00.000Z",
              },
              config: {
                id: "cfg_1",
                businessName: "Acme Dental",
                keyword: "dentist",
                gridSize: 5,
                radiusMeters: 5000,
              },
            },
          ];
        }
        return [
          {
            run: {
              id: "run_prev_1",
              configId: "cfg_1",
              status: "completed",
              totalPoints: 25,
              completedPoints: 25,
              failedPoints: 0,
              foundPoints: 10,
              solv: 16,
              averageRank: 5.0,
              costUsd: 0.05,
              startedAt: "2024-05-01T10:00:00.000Z",
              completedAt: "2024-05-01T10:05:00.000Z",
            },
            config: {
              id: "cfg_1",
              businessName: "Acme Dental",
              keyword: "dentist",
              gridSize: 5,
              radiusMeters: 5000,
            },
          },
        ];
      },
    );

    gmbRepoMock.getCompletedSnapshotsForRuns.mockResolvedValueOnce([
      { runId: "run_cur_1", rank: 1, status: "completed" },
      { runId: "run_cur_1", rank: 2, status: "completed" },
      { runId: "run_cur_1", rank: 3, status: "completed" },
      { runId: "run_cur_1", rank: 5, status: "completed" },
      { runId: "run_cur_1", rank: 12, status: "completed" },
    ]);

    const res = await buildGmbSection("proj_1", RANGE);
    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.data.hasData).toBe(true);
    expect(res.data.current.runsCount).toBe(1);
    expect(res.data.comparison.runsDelta).toBe(0);
    expect(res.data.runs[0].top3).toBe(3);
    expect(res.data.runs[0].top10).toBe(4);
    expect(res.data.runs[0].top20).toBe(5);
    expect(res.data.runs[0].foundCoveragePct).toBe(20);
  });
});

describe("buildBrandLookupSection", () => {
  it("returns skipped when no brand lookup data has ever been recorded", async () => {
    brandLookupRepoMock.listSnapshotsForDateRange.mockResolvedValue([]);
    brandLookupRepoMock.getLatestSnapshot.mockResolvedValueOnce(null);

    const res = await buildBrandLookupSection("proj_1", RANGE);
    expect(res.status).toBe("skipped");
  });

  it("aggregates trends, SOV, and freshness from persisted snapshots", async () => {
    const mockSnap = {
      id: "snap_1",
      projectId: "proj_1",
      snapshotDate: "2024-06-01",
      query: "Acme",
      targetType: "brand",
      targetValue: "acme",
      locationCode: 2840,
      languageCode: "en",
      fetchedAt: "2024-06-01T12:00:00.000Z",
      hasData: true,
      totalMentions: 50,
      totalAiSearchVolume: 10000,
      platforms: [
        {
          platform: "chat_gpt",
          mentions: 30,
          aiSearchVolume: 6000,
          status: "success",
        },
        {
          platform: "google",
          mentions: 20,
          aiSearchVolume: 4000,
          status: "success",
        },
      ],
      sovEntries: [
        { label: "Acme", isTarget: true, mentions: 50, sharePct: 55 },
        { label: "Competitor", isTarget: false, mentions: 40, sharePct: 45 },
      ],
    };

    brandLookupRepoMock.listSnapshotsForDateRange.mockImplementation(
      async (_proj: string, start: string) => {
        if (start === RANGE.startDate) return [mockSnap];
        return [];
      },
    );
    brandLookupRepoMock.getLatestSnapshot.mockResolvedValueOnce(mockSnap);

    const res = await buildBrandLookupSection("proj_1", RANGE);
    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.data.hasData).toBe(true);
    expect(res.data.latestTarget?.query).toBe("Acme");
    expect(res.data.current.avgTotalMentions).toBe(50);
    expect(res.data.current.sovEntries).toHaveLength(2);
    expect(res.data.current.platformTrends).toHaveLength(2);
  });
});

describe("buildAiTrackingSection", () => {
  it("returns skipped when project has no AI tracking config", async () => {
    aiTrackingRepoMock.getConfig.mockResolvedValueOnce(null);
    const res = await buildAiTrackingSection("proj_1", RANGE);
    expect(res.status).toBe("skipped");
  });

  it("aggregates visibility, sentiment, competitors, and top cited pages", async () => {
    aiTrackingRepoMock.getConfig.mockResolvedValueOnce({
      id: "cfg_ai_1",
      brandName: "Acme",
      domain: "acme.com",
      platforms: ["chat_gpt", "gemini"],
    });

    aiTrackingRepoMock.listVisibilitySnapshotsForDateRange.mockResolvedValue([
      {
        platform: "all",
        visibilityScore: 75,
        mentionRate: 80,
        citationRate: 50,
        shareOfVoice: 60,
      },
    ]);

    aiTrackingRepoMock.getObservationsForDateRange.mockImplementation(
      async (_cfg: string, start: string) => {
        if (start.startsWith(RANGE.startDate)) {
          return [
            {
              id: "obs_1",
              platform: "chat_gpt",
              prompt: "best dentist software",
              status: "success",
            },
          ];
        }
        return [];
      },
    );

    aiTrackingRepoMock.getMentionsForObservations.mockImplementation(
      async (_cfg: string, ids: string[]) => {
        if (ids.includes("obs_1")) {
          return [
            {
              observationId: "obs_1",
              brandName: "Acme",
              domain: "acme.com",
              isTargetBrand: true,
              sentiment: "positive",
              position: 1,
            },
          ];
        }
        return [];
      },
    );

    aiTrackingRepoMock.getCitationsForObservations.mockResolvedValue([
      {
        url: "https://acme.com/features",
        domain: "acme.com",
        isTargetBrand: true,
      },
    ]);

    const res = await buildAiTrackingSection("proj_1", RANGE);
    expect(res.status).toBe("ok");
    if (res.status !== "ok") return;

    expect(res.data.hasData).toBe(true);
    expect(res.data.current.avgVisibilityScore).toBe(75);
    expect(res.data.sentiment.positive).toBe(1);
    expect(res.data.sentiment.positivePct).toBe(100);
    expect(res.data.competitors[0].brandName).toBe("Acme");
    expect(res.data.topCitedPages[0].url).toBe("https://acme.com/features");
    expect(res.data.dataCompleteness.completenessPct).toBe(100);
  });
});
