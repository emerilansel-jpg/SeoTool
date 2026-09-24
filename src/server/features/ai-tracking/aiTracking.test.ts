import { describe, expect, it } from "vitest";
import { aggregateDashboardMetrics } from "./dashboardAggregation";
import type {
  aiTrackingObservations,
  aiTrackingMentions,
  aiTrackingCitations,
  aiTrackingPrompts,
} from "@/db/schema";

type ObservationRow = typeof aiTrackingObservations.$inferSelect;
type MentionRow = typeof aiTrackingMentions.$inferSelect;
type CitationRow = typeof aiTrackingCitations.$inferSelect;
type PromptRow = typeof aiTrackingPrompts.$inferSelect;
type DashboardConfig = Parameters<
  typeof aggregateDashboardMetrics
>[0]["config"];

const baseConfig: DashboardConfig = {
  id: "cfg-1",
  projectId: "proj-1",
  brandName: "Zoho",
  domain: "zoho.com",
  brandAliases: ["Zoho CRM"],
  platforms: ["chat_gpt", "gemini"],
  schedule: "manual",
  scheduleStatus: "idle",
  lastRunAt: "2026-09-09T10:00:00Z",
};

function makeObservation(
  id: string,
  platform: "chat_gpt" | "gemini" = "chat_gpt",
): ObservationRow {
  return {
    id,
    runId: "run-1",
    configId: "cfg-1",
    promptId: "p-1",
    prompt: "best crm for small business",
    platform,
    status: "success",
    responseText: "Zoho is a CRM platform.",
    errorMessage: null,
    observedAt: `2026-09-09T08:0${id.slice(-1)}:00Z`,
  };
}

function makeMention(input: {
  id: string;
  observationId: string;
  brandName?: string;
  domain?: string;
  isTargetBrand?: boolean;
  position?: number | null;
  sentiment?: MentionRow["sentiment"];
}): MentionRow {
  const brandName = input.brandName ?? "Zoho";
  return {
    id: input.id,
    observationId: input.observationId,
    runId: "run-1",
    configId: "cfg-1",
    brandName,
    domain: input.domain ?? "zoho.com",
    isTargetBrand: input.isTargetBrand ?? true,
    position: input.position ?? null,
    sentiment: input.sentiment ?? "neutral",
    evidence: `${brandName} mention evidence`,
    createdAt: "2026-09-09T08:00:00Z",
  };
}

describe("aggregateDashboardMetrics", () => {
  it("calculates visibility, average position, and competitor rankings accurately", () => {
    const config = baseConfig;

    const promptsList: PromptRow[] = [
      {
        id: "p-1",
        configId: "cfg-1",
        prompt: "best crm for small business",
        active: true,
        createdAt: "2026-09-01T00:00:00Z",
      },
    ];

    const observations: ObservationRow[] = [
      {
        id: "obs-1",
        runId: "run-1",
        configId: "cfg-1",
        promptId: "p-1",
        prompt: "best crm for small business",
        platform: "chat_gpt",
        status: "success",
        responseText: "1. Zoho is affordable. 2. Salesforce is enterprise.",
        errorMessage: null,
        observedAt: "2026-09-09T08:00:00Z",
      },
      {
        id: "obs-2",
        runId: "run-1",
        configId: "cfg-1",
        promptId: "p-1",
        prompt: "best crm for small business",
        platform: "gemini",
        status: "success",
        responseText: "1. Salesforce. 2. Zoho CRM.",
        errorMessage: null,
        observedAt: "2026-09-09T08:05:00Z",
      },
    ];

    const mentions: MentionRow[] = [
      {
        id: "m-1",
        observationId: "obs-1",
        runId: "run-1",
        configId: "cfg-1",
        brandName: "Zoho",
        domain: "zoho.com",
        isTargetBrand: true,
        position: 1,
        sentiment: "positive",
        evidence: "Zoho is affordable",
        createdAt: "2026-09-09T08:00:00Z",
      },
      {
        id: "m-2",
        observationId: "obs-1",
        runId: "run-1",
        configId: "cfg-1",
        brandName: "Salesforce",
        domain: "salesforce.com",
        isTargetBrand: false,
        position: 2,
        sentiment: "neutral",
        evidence: "Salesforce is enterprise",
        createdAt: "2026-09-09T08:00:00Z",
      },
      {
        id: "m-3",
        observationId: "obs-2",
        runId: "run-1",
        configId: "cfg-1",
        brandName: "Zoho",
        domain: "zoho.com",
        isTargetBrand: true,
        position: 2,
        sentiment: "positive",
        evidence: "Zoho CRM",
        createdAt: "2026-09-09T08:05:00Z",
      },
      {
        id: "m-4",
        observationId: "obs-2",
        runId: "run-1",
        configId: "cfg-1",
        brandName: "Salesforce",
        domain: "salesforce.com",
        isTargetBrand: false,
        position: 1,
        sentiment: "neutral",
        evidence: "Salesforce",
        createdAt: "2026-09-09T08:05:00Z",
      },
    ];

    const citations: CitationRow[] = [
      {
        id: "c-1",
        observationId: "obs-1",
        runId: "run-1",
        url: "https://zoho.com",
        domain: "zoho.com",
        title: "Zoho",
        isTargetBrand: true,
        createdAt: "2026-09-09T08:00:00Z",
      },
    ];

    const result = aggregateDashboardMetrics({
      config,
      promptsList,
      observations,
      mentions,
      citations,
      latestRun: null,
    });

    // Both observations had Zoho -> 100% visibility
    expect(result.kpi.mentionCoveragePercent).toBe(100);
    expect(result.kpi.brandMentions).toBe(2);
    expect(result.kpi.totalResponses).toBe(2);

    // Average numbered-list position: (1 + 2) / 2 = 1.5
    expect(result.kpi.averageListPosition).toBe(1.5);
    expect(result.kpi.listPositionSamples).toBe(2);

    // 100% positive sentiment
    expect(result.kpi.positiveMentions).toBe(2);
    expect(result.sentiment.positivePercent).toBe(100);

    // Competitor rankings
    expect(result.competitorRankings).toHaveLength(2);
    const targetBrand = result.competitorRankings.find((c) => c.isTargetBrand);
    expect(targetBrand?.domain).toBe("zoho.com");
    expect(targetBrand?.avgPosition).toBe(1.5);
  });

  it("counts prose mentions without inventing a list position", () => {
    const observations = [makeObservation("obs-1")];
    const mentions = [
      makeMention({
        id: "m-1",
        observationId: "obs-1",
        sentiment: "neutral",
      }),
    ];

    const result = aggregateDashboardMetrics({
      config: baseConfig,
      promptsList: [],
      observations,
      mentions,
      citations: [],
      latestRun: null,
    });

    expect(result.kpi.mentionCoveragePercent).toBe(100);
    expect(result.kpi.brandMentions).toBe(1);
    expect(result.kpi.averageListPosition).toBeNull();
    expect(result.kpi.listPositionSamples).toBe(0);
  });

  it("classifies neutral-only mentions as neutral instead of positive", () => {
    const observations = [makeObservation("obs-1"), makeObservation("obs-2")];
    const mentions = observations.map((observation, index) =>
      makeMention({
        id: `m-${index + 1}`,
        observationId: observation.id,
        sentiment: "neutral",
      }),
    );

    const result = aggregateDashboardMetrics({
      config: baseConfig,
      promptsList: [],
      observations,
      mentions,
      citations: [],
      latestRun: null,
    });

    expect(result.kpi.positiveMentions).toBe(0);
    expect(result.kpi.positiveMentionPercent).toBe(0);
    expect(result.sentiment.total).toBe(2);
    expect(result.sentiment.positivePercent).toBe(0);
    expect(result.sentiment.neutralPercent).toBe(100);
  });

  it("reports complete sentiment counts and percentages", () => {
    const observations = [
      makeObservation("obs-1"),
      makeObservation("obs-2"),
      makeObservation("obs-3"),
      makeObservation("obs-4"),
    ];
    const sentiments: MentionRow["sentiment"][] = [
      "positive",
      "mixed",
      "neutral",
      "negative",
    ];
    const mentions = observations.map((observation, index) =>
      makeMention({
        id: `m-${index + 1}`,
        observationId: observation.id,
        sentiment: sentiments[index],
      }),
    );

    const result = aggregateDashboardMetrics({
      config: baseConfig,
      promptsList: [],
      observations,
      mentions,
      citations: [],
      latestRun: null,
    });

    expect(result.sentiment).toMatchObject({
      positive: 1,
      mixed: 1,
      neutral: 1,
      negative: 1,
      total: 4,
      positivePercent: 25,
      mixedPercent: 25,
      neutralPercent: 25,
      negativePercent: 25,
    });
  });

  it("ranks brands by tracked mentions instead of forcing the target first", () => {
    const observations = [
      makeObservation("obs-1"),
      makeObservation("obs-2"),
      makeObservation("obs-3"),
    ];
    const mentions = [
      makeMention({ id: "target-1", observationId: "obs-1" }),
      makeMention({
        id: "competitor-1",
        observationId: "obs-1",
        brandName: "Salesforce",
        domain: "salesforce.com",
        isTargetBrand: false,
      }),
      makeMention({
        id: "competitor-2",
        observationId: "obs-2",
        brandName: "Salesforce",
        domain: "salesforce.com",
        isTargetBrand: false,
      }),
      makeMention({
        id: "competitor-3",
        observationId: "obs-3",
        brandName: "Salesforce",
        domain: "salesforce.com",
        isTargetBrand: false,
      }),
    ];

    const result = aggregateDashboardMetrics({
      config: baseConfig,
      promptsList: [],
      observations,
      mentions,
      citations: [],
      latestRun: null,
    });

    expect(result.competitorRankings.map((item) => item.domain)).toEqual([
      "salesforce.com",
      "zoho.com",
    ]);
    expect(result.competitorRankings[0].visibilityPct).toBe(100);
    expect(result.competitorRankings[1].visibilityPct).toBe(33);
  });

  it("returns an explicit zero-data sentiment state", () => {
    const result = aggregateDashboardMetrics({
      config: baseConfig,
      promptsList: [],
      observations: [],
      mentions: [],
      citations: [],
      latestRun: null,
    });

    expect(result.kpi.mentionCoveragePercent).toBe(0);
    expect(result.sentiment).toMatchObject({
      total: 0,
      positivePercent: 0,
      mixedPercent: 0,
      neutralPercent: 0,
      negativePercent: 0,
    });
  });
});
