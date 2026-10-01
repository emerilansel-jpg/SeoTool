import { describe, expect, it } from "vitest";
import { buildCsv } from "@/client/lib/csv";
import type { AiTrackingDashboardData } from "@/types/schemas/ai-tracking";
import { buildAiTrackingReportExport } from "./aiTrackingReportExport";

const data: AiTrackingDashboardData = {
  config: {
    id: "config-1",
    projectId: "project-1",
    brandName: "Acme",
    domain: "acme.test",
    brandAliases: [],
    platforms: ["chat_gpt", "gemini"],
    schedule: "weekly",
    scheduleStatus: "active",
    lastRunAt: "2026-09-30T12:00:00.000Z",
  },
  prompts: [
    {
      id: "prompt-1",
      prompt: "=best platform",
      active: true,
      createdAt: "2026-09-01T12:00:00.000Z",
      lastPosition: 2,
      lastMentioned: true,
      lastSentiment: "positive",
      lastCheckedAt: "2026-09-30T12:00:00.000Z",
    },
  ],
  kpi: {
    mentionCoveragePercent: 75,
    positiveMentions: 2,
    positiveMentionPercent: 67,
    averageListPosition: 2.5,
    listPositionSamples: 2,
    totalResponses: 4,
    brandMentions: 3,
  },
  sentiment: {
    positive: 2,
    mixed: 0,
    neutral: 1,
    negative: 0,
    total: 3,
    positivePercent: 67,
    mixedPercent: 0,
    neutralPercent: 33,
    negativePercent: 0,
    topInsights: [],
  },
  positionTrend: [{ date: "2026-09-30", position: 2.5 }],
  visibilityTrend: [{ date: "2026-09-30", visibility: 75 }],
  competitorRankings: [
    {
      domain: "+rival.test",
      brandName: "Rival",
      isTargetBrand: false,
      avgPosition: 3,
      mentionsCount: 2,
      visibilityPct: 50,
    },
  ],
  recentObservations: [
    {
      id: "observation-1",
      prompt: "Best platform?",
      platform: "chat_gpt",
      status: "success",
      observedAt: "2026-09-30T12:00:00.000Z",
      brandMentioned: true,
      position: 2,
      sentiment: "positive",
      evidence: "Acme ranks second.",
      responseText: null,
      citations: [],
    },
  ],
  lastRun: null,
};

describe("buildAiTrackingReportExport", () => {
  it("includes summary, trend, competitor, sentiment, prompt, and observation rows", () => {
    const table = buildAiTrackingReportExport(data, 365, "chat_gpt");

    expect(table.rows).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          "Summary",
          "Mention coverage",
          "Acme",
          "ChatGPT",
          75,
        ]),
        expect.arrayContaining([
          "Trend",
          "Visibility",
          "Acme",
          "ChatGPT",
          75,
          "percent",
          "2026-09-30",
        ]),
        expect.arrayContaining([
          "Competitor",
          "Mentions",
          "+rival.test",
          "ChatGPT",
          2,
        ]),
        expect.arrayContaining(["Sentiment", "Positive", "Acme", "ChatGPT", 2]),
        expect.arrayContaining(["Prompt", "Active", "=best platform"]),
        expect.arrayContaining([
          "Observation",
          "success",
          "Best platform?",
          "ChatGPT",
        ]),
      ]),
    );
  });

  it("relies on the shared CSV sanitizer for formula-like values", () => {
    const table = buildAiTrackingReportExport(data, 30, "all");
    const csv = buildCsv(table.headers, table.rows);

    expect(csv).toContain('"\'=best platform"');
    expect(csv).toContain('"\'+rival.test"');
  });
});
