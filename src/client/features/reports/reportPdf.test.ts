import { describe, expect, it } from "vitest";
import { reportPdf } from "@/client/lib/reportPdf";
import type { ReportWithSections } from "@/server/features/reports/services/ReportService";

describe("reportPdf export", () => {
  it("generates PDF with GMB, Brand Lookup, and AI Tracking sections without crashing", () => {
    const report: ReportWithSections = {
      id: "rep_1",
      projectId: "proj_1",
      organizationId: "org_1",
      createdByUserId: "user_1",
      nextRunAt: null,
      name: "Monthly Executive Report",
      clientName: "Acme Corp",
      reportPeriod: "monthly",
      schedule: "monthly",
      dayOfWeek: null,
      dayOfMonth: 1,
      monthOfYear: null,
      logoUrl: null,
      brandColor: "#7c3aed",
      accentColor: "#f97316",
      recipients: "client@acme.com",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
      sections: [
        { id: "sec_1", reportId: "rep_1", type: "gmb_grid", sortOrder: 0, config: null },
        { id: "sec_2", reportId: "rep_1", type: "brand_lookup", sortOrder: 1, config: null },
        { id: "sec_3", reportId: "rep_1", type: "ai_tracking", sortOrder: 2, config: null },
      ],
    };

    const snapshotData = {
      generatedAt: "2026-06-01T12:00:00.000Z",
      range: { startDate: "2026-05-01", endDate: "2026-05-31" },
      sections: {
        gmb_grid: {
          status: "ok" as const,
          data: {
            hasData: true,
            current: {
              runsCount: 3,
              completedRunsCount: 3,
              avgSolv: 42.5,
              avgRank: 2.8,
              totalCostUsd: 0.15,
              dataCompletenessPct: 100,
            },
            previous: {
              runsCount: 3,
              completedRunsCount: 3,
              avgSolv: 30.0,
              avgRank: 3.5,
              totalCostUsd: 0.15,
              dataCompletenessPct: 100,
            },
            comparison: {
              solvDelta: 12.5,
              rankDelta: -0.7,
              costDelta: 0,
              runsDelta: 0,
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
                startedAt: "2026-05-15T10:00:00.000Z",
                completedAt: "2026-05-15T10:05:00.000Z",
                totalPoints: 25,
                completedPoints: 25,
                failedPoints: 0,
                foundPoints: 22,
                top3: 8,
                top10: 16,
                top20: 20,
                foundCoveragePct: 88,
                solv: 32,
                averageRank: 2.8,
                costUsd: 0.05,
              },
            ],
          },
        },
        brand_lookup: {
          status: "ok" as const,
          data: {
            hasData: true,
            latestTarget: {
              query: "Acme Brand",
              targetType: "brand",
              targetValue: "acme",
              locationCode: 2840,
              languageCode: "en",
              fetchedAt: "2026-05-30T12:00:00.000Z",
            },
            dataFreshness: {
              lastFetchedAt: "2026-05-30T12:00:00.000Z",
              daysSinceLastFetch: 1,
            },
            current: {
              snapshotsCount: 1,
              avgTotalMentions: 150,
              avgTotalAiSearchVolume: 8500,
              platformTrends: [
                {
                  platform: "chat_gpt" as const,
                  latestMentions: 100,
                  avgMentions: 100,
                  points: [{ date: "2026-05-30", mentions: 100, aiSearchVolume: 5000 }],
                },
              ],
              sovEntries: [
                { label: "Acme Brand", isTarget: true, sharePct: 60, mentions: 150 },
              ],
            },
            previous: {
              snapshotsCount: 1,
              avgTotalMentions: 120,
              avgTotalAiSearchVolume: 7000,
            },
            comparison: { mentionsDelta: 30, volumeDelta: 1500 },
            snapshots: [],
          },
        },
        ai_tracking: {
          status: "ok" as const,
          data: {
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
                change: "gained" as const,
              },
            ],
            dataCompleteness: {
              totalObservations: 20,
              successfulObservations: 20,
              completenessPct: 100,
            },
          },
        },
      },
    };

    expect(() => reportPdf(report, snapshotData)).not.toThrow();
  });
});
