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

describe("aggregateDashboardMetrics", () => {
  it("calculates visibility, average position, and competitor rankings accurately", () => {
    const config = {
      id: "cfg-1",
      projectId: "proj-1",
      brandName: "Zoho",
      domain: "zoho.com",
      brandAliases: ["Zoho CRM"],
      platforms: ["chat_gpt" as const, "gemini" as const],
      schedule: "manual" as const,
      scheduleStatus: "idle" as const,
      lastRunAt: "2026-09-09T10:00:00Z",
    };

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
    expect(result.kpi.visibilityScore).toBe(100);
    expect(result.kpi.brandMentions).toBe(2);
    expect(result.kpi.totalResponses).toBe(2);

    // Average position: (1 + 2) / 2 = 1.5
    expect(result.kpi.averagePosition).toBe(1.5);

    // 100% positive sentiment
    expect(result.sentiment.positivePercent).toBe(100);

    // Competitor rankings
    expect(result.competitorRankings).toHaveLength(2);
    const targetBrand = result.competitorRankings.find((c) => c.isTargetBrand);
    expect(targetBrand?.domain).toBe("zoho.com");
    expect(targetBrand?.avgPosition).toBe(1.5);
  });
});
