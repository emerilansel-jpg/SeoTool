import { describe, expect, it } from "vitest";
import {
  buildGmbGridModel,
  buildBrandLookupModel,
  buildAiTrackingModel,
} from "./reportModels";
import type { GmbSectionData } from "@/server/features/reports/sections/gmbSection";
import type { BrandLookupSectionData } from "@/server/features/reports/sections/brandLookupSection";
import type { AiTrackingSectionData } from "@/server/features/reports/sections/aiTrackingSection";

describe("reportModels with actual backend section shapes", () => {
  it("maps real buildGmbSection data", () => {
    const realGmbData: GmbSectionData = {
      hasData: true,
      current: {
        runsCount: 5,
        completedRunsCount: 5,
        avgSolv: 35.5,
        avgRank: 3.2,
        totalCostUsd: 0.25,
        dataCompletenessPct: 100,
      },
      previous: {
        runsCount: 4,
        completedRunsCount: 4,
        avgSolv: 28.0,
        avgRank: 4.1,
        totalCostUsd: 0.2,
        dataCompletenessPct: 100,
      },
      comparison: {
        solvDelta: 7.5,
        rankDelta: -0.9,
        costDelta: 0.05,
        runsDelta: 1,
      },
      runs: [
        {
          runId: "run_1",
          configId: "cfg_1",
          businessName: "Acme Dental",
          keyword: "dentist",
          gridSize: 5,
          radiusMeters: 5000,
          status: "completed",
          startedAt: "2026-06-01T10:00:00.000Z",
          completedAt: "2026-06-01T10:05:00.000Z",
          totalPoints: 25,
          completedPoints: 25,
          failedPoints: 0,
          foundPoints: 20,
          top3: 5,
          top10: 12,
          top20: 18,
          foundCoveragePct: 80,
          solv: 20,
          averageRank: 3.2,
          costUsd: 0.05,
        },
      ],
    };

    const model = buildGmbGridModel(realGmbData);

    console.log("GMB Model:", {
      totalScans: model.totalScans,
      solvCurrent: model.metrics.solv.current,
      solvPrev: model.metrics.solv.previous,
      avgRankCurrent: model.metrics.averageRank.current,
      avgRankPrev: model.metrics.averageRank.previous,
      costCurrent: model.metrics.cost.current,
      costPrev: model.metrics.cost.previous,
      top3Current: model.metrics.top3.current,
      keywordLocationsLength: model.keywordLocations.length,
      trendLength: model.trend.length,
      completeness: model.completeness,
    });

    expect(model.totalScans).toBe(5);
    expect(model.metrics.solv.current).toBe(35.5);
    expect(model.metrics.solv.previous).toBe(28.0);
    expect(model.metrics.averageRank.current).toBe(3.2);
    expect(model.metrics.cost.current).toBe(0.25);
    expect(model.keywordLocations.length).toBeGreaterThan(0);
  });

  it("maps real buildBrandLookupSection data", () => {
    const realBrandData: BrandLookupSectionData = {
      hasData: true,
      latestTarget: {
        query: "Acme Brand",
        targetType: "brand",
        targetValue: "acme",
        locationCode: 2840,
        languageCode: "en",
        fetchedAt: "2026-06-01T12:00:00.000Z",
      },
      dataFreshness: {
        lastFetchedAt: "2026-06-01T12:00:00.000Z",
        daysSinceLastFetch: 0,
      },
      current: {
        snapshotsCount: 1,
        avgTotalMentions: 150,
        avgTotalAiSearchVolume: 8500,
        platformTrends: [
          {
            platform: "chat_gpt",
            latestMentions: 100,
            avgMentions: 100,
            points: [
              {
                date: "2026-06-01",
                mentions: 100,
                aiSearchVolume: 5000,
              },
            ],
          },
        ],
        sovEntries: [
          {
            label: "Acme Brand",
            isTarget: true,
            sharePct: 60,
            mentions: 150,
          },
        ],
      },
      previous: {
        snapshotsCount: 1,
        avgTotalMentions: 120,
        avgTotalAiSearchVolume: 7000,
      },
      comparison: {
        mentionsDelta: 30,
        volumeDelta: 1500,
      },
      snapshots: [
        {
          id: "snap_1",
          snapshotDate: "2026-06-01",
          query: "Acme Brand",
          totalMentions: 150,
          totalAiSearchVolume: 8500,
          fetchedAt: "2026-06-01T12:00:00.000Z",
        },
      ],
    };

    const model = buildBrandLookupModel(realBrandData);

    console.log("Brand Model:", {
      target: model.target,
      totalMentions: model.totalMentions,
      searchVolume: model.searchVolume,
      freshness: model.freshness,
      platformsLength: model.platforms.length,
      sovEntriesLength: model.sovEntries.length,
    });

    expect(model.target).toBe("Acme Brand");
    expect(model.totalMentions).toBe(150);
    expect(model.searchVolume).toBe(8500);
    expect(model.platforms.length).toBeGreaterThan(0);
    expect(model.sovEntries.length).toBeGreaterThan(0);
  });

  it("maps real buildAiTrackingSection data", () => {
    const realAiData: AiTrackingSectionData = {
      hasData: true,
      config: {
        brandName: "Acme",
        domain: "acme.com",
        platforms: ["chat_gpt"],
      },
      current: {
        avgVisibilityScore: 78,
        avgMentionRate: 65,
        avgCitationRate: 45,
        avgShareOfVoice: 55,
        snapshotsCount: 1,
      },
      previous: {
        avgVisibilityScore: 70,
        avgMentionRate: 60,
        avgCitationRate: 40,
        avgShareOfVoice: 50,
        snapshotsCount: 1,
      },
      comparison: {
        visibilityDelta: 8,
        mentionRateDelta: 5,
        citationRateDelta: 5,
        shareOfVoiceDelta: 5,
      },
      sentiment: {
        positive: 10,
        mixed: 2,
        neutral: 3,
        negative: 1,
        positivePct: 62,
      },
      perPlatform: [
        {
          platform: "chat_gpt",
          responsesCount: 20,
          mentionsCount: 13,
          mentionRatePct: 65,
        },
      ],
      competitors: [
        {
          domain: "competitor.com",
          brandName: "Competitor",
          isTargetBrand: false,
          mentionsCount: 8,
          avgPosition: 2.1,
        },
      ],
      topCitedPages: [
        {
          url: "https://acme.com/about",
          domain: "acme.com",
          isTargetBrand: true,
          frequency: 5,
        },
      ],
      promptMovers: [
        {
          prompt: "best dentist tools",
          currentMentioned: true,
          previousMentioned: false,
          change: "gained",
        },
      ],
      dataCompleteness: {
        totalObservations: 20,
        successfulObservations: 20,
        completenessPct: 100,
      },
    };

    const model = buildAiTrackingModel(realAiData);

    console.log("AI Model:", {
      target: model.target,
      visibilityCurrent: model.metrics.visibility.current,
      visibilityPrev: model.metrics.visibility.previous,
      mentionRateCurrent: model.metrics.mentionRate.current,
      citationRateCurrent: model.metrics.citationRate.current,
      sovCurrent: model.metrics.shareOfVoice.current,
      platformVisibility: model.platforms[0]?.visibility,
      platformMentionRate: model.platforms[0]?.mentionRate,
      topCitedCitations: model.topCitedPages[0]?.citations,
      promptMoverChange: model.promptMovers[0]?.change,
      completeness: model.completeness,
    });

    expect(model.metrics.visibility.current).toBe(78);
    expect(model.metrics.visibility.previous).toBe(70);
    expect(model.metrics.mentionRate.current).toBe(65);
    expect(model.metrics.citationRate.current).toBe(45);
    expect(model.metrics.shareOfVoice.current).toBe(55);
    expect(model.platforms[0]?.mentionRate).toBe(65);
    expect(model.topCitedPages[0]?.citations).toBe(5);
  });
});
