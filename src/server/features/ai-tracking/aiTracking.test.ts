// oxlint-disable max-lines, max-lines-per-function
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
  platformOrOverrides:
    | "chat_gpt"
    | "gemini"
    | "perplexity"
    | "claude"
    | Partial<ObservationRow> = "chat_gpt",
): ObservationRow {
  const overrides =
    typeof platformOrOverrides === "string"
      ? { platform: platformOrOverrides }
      : platformOrOverrides;
  return {
    id,
    runId: "run-1",
    configId: "cfg-1",
    promptId: "p-1",
    prompt: "best crm for small business",
    platform: "chat_gpt",
    status: "success",
    responseText: "Zoho is a CRM platform.",
    errorMessage: null,
    observedAt: `2026-09-09T08:0${id.slice(-1)}:00Z`,
    ...overrides,
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

  describe("Profound LLM Intelligence aggregation", () => {
    it("computes per-LLM citation rates and mention rates", () => {
      const obs1 = makeObservation("obs-1", { platform: "chat_gpt" });
      const obs2 = makeObservation("obs-2", { platform: "chat_gpt" });
      const obs3 = makeObservation("obs-3", { platform: "perplexity" });

      const mentions = [
        makeMention({ id: "m-1", observationId: "obs-1", isTargetBrand: true }),
        makeMention({ id: "m-2", observationId: "obs-2", isTargetBrand: true }),
        makeMention({
          id: "m-3",
          observationId: "obs-3",
          isTargetBrand: false,
        }),
      ];

      const citations = [
        {
          id: "c-1",
          observationId: "obs-1",
          runId: "run-1",
          url: "https://zoho.com/crm",
          domain: "zoho.com",
          title: "Zoho CRM",
          isTargetBrand: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const result = aggregateDashboardMetrics({
        config: { ...baseConfig, platforms: ["chat_gpt", "perplexity"] },
        promptsList: [],
        observations: [obs1, obs2, obs3],
        mentions,
        citations,
        latestRun: null,
      });

      expect(result.llmMetrics).toBeDefined();
      const chatGpt = result.llmMetrics.find((m) => m.platform === "chat_gpt");
      expect(chatGpt).toBeDefined();
      expect(chatGpt?.totalResponses).toBe(2);
      expect(chatGpt?.mentionsCount).toBe(2);
      expect(chatGpt?.citationsCount).toBe(1);
      expect(chatGpt?.mentionRatePercent).toBe(100);
      expect(chatGpt?.citationRatePercent).toBe(50);

      const perplexity = result.llmMetrics.find(
        (m) => m.platform === "perplexity",
      );
      expect(perplexity).toBeDefined();
      expect(perplexity?.totalResponses).toBe(1);
      expect(perplexity?.mentionsCount).toBe(0);
      expect(perplexity?.citationsCount).toBe(0);
      expect(perplexity?.mentionRatePercent).toBe(0);
      expect(perplexity?.citationRatePercent).toBe(0);
    });

    it("evaluates winning vs gap prompts and co-cited competitors", () => {
      const prompt1 = {
        id: "p-1",
        configId: "cfg-1",
        prompt: "Best CRM for startups",
        active: true,
        createdAt: new Date().toISOString(),
      };
      const prompt2 = {
        id: "p-2",
        configId: "cfg-1",
        prompt: "Enterprise sales tools",
        active: true,
        createdAt: new Date().toISOString(),
      };

      const obs1 = makeObservation("obs-1", {
        promptId: "p-1",
        prompt: "Best CRM for startups",
        platform: "chat_gpt",
      });
      const obs2 = makeObservation("obs-2", {
        promptId: "p-2",
        prompt: "Enterprise sales tools",
        platform: "claude",
      });

      const mentions = [
        // obs1 has target brand Zoho and competitor Salesforce
        makeMention({
          id: "m-1",
          observationId: "obs-1",
          brandName: "Zoho",
          domain: "zoho.com",
          isTargetBrand: true,
          position: 1,
        }),
        makeMention({
          id: "m-2",
          observationId: "obs-1",
          brandName: "Salesforce",
          domain: "salesforce.com",
          isTargetBrand: false,
          position: 2,
        }),
        // obs2 only has competitor Salesforce
        makeMention({
          id: "m-3",
          observationId: "obs-2",
          brandName: "Salesforce",
          domain: "salesforce.com",
          isTargetBrand: false,
          position: 1,
        }),
      ];

      const result = aggregateDashboardMetrics({
        config: baseConfig,
        promptsList: [prompt1, prompt2],
        observations: [obs1, obs2],
        mentions,
        citations: [],
        latestRun: null,
      });

      // Win vs Gap Prompt Diagnostics
      expect(result.promptDiagnostics.winning).toHaveLength(1);
      expect(result.promptDiagnostics.winning[0].prompt).toBe(
        "Best CRM for startups",
      );
      expect(result.promptDiagnostics.winning[0].position).toBe(1);
      expect(result.promptDiagnostics.winning[0].modelsSurfaced).toContain(
        "chat_gpt",
      );

      expect(result.promptDiagnostics.gaps).toHaveLength(1);
      expect(result.promptDiagnostics.gaps[0].prompt).toBe(
        "Enterprise sales tools",
      );
      expect(result.promptDiagnostics.gaps[0].competitorsCited).toContain(
        "Salesforce",
      );

      // Co-cited Competitors
      expect(result.coCitedCompetitors).toHaveLength(1);
      const salesforce = result.coCitedCompetitors[0];
      expect(salesforce.domain).toBe("salesforce.com");
      expect(salesforce.coCitationCount).toBe(1); // appeared in obs1 alongside Zoho
      expect(salesforce.standaloneWins).toBe(1); // appeared in obs2 without Zoho
      expect(salesforce.coCitationRate).toBe(100); // 1 co-citation / 1 winning obs = 100%
    });

    it("generates a passage citability opportunity alert when brand is mentioned without citations", () => {
      const obs1 = makeObservation("obs-1", { platform: "chat_gpt" });
      const mentions = [
        makeMention({ id: "m-1", observationId: "obs-1", isTargetBrand: true }),
      ];

      const result = aggregateDashboardMetrics({
        config: baseConfig,
        promptsList: [],
        observations: [obs1],
        mentions,
        citations: [],
        latestRun: null,
      });

      const citabilityAlert = result.profoundAlerts.find(
        (a) => a.type === "opportunity",
      );
      expect(citabilityAlert).toBeDefined();
      expect(citabilityAlert?.title).toContain("Passage Citability");
    });
  });
});
