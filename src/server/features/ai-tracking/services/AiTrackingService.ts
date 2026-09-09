import type { BillingCustomerContext } from "@/server/billing/subscription";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";
import { ProjectCompetitorRepository } from "@/server/features/projects/repositories/ProjectCompetitorRepository";
import { AiTrackingRepository } from "../repositories/AiTrackingRepository";
import {
  extractMentions,
  type TrackingEntity,
} from "../extraction";
import {
  aggregateDashboardMetrics,
  extractCitations,
  extractText,
} from "../dashboardAggregation";
import type {
  AiTrackingDashboardData,
  AiTrackingPlatform,
  SaveAiTrackingConfigInput,
} from "@/types/schemas/ai-tracking";

const MODEL_NAMES: Record<AiTrackingPlatform, string> = {
  chat_gpt: "gpt-5",
  claude: "claude-sonnet-4-5",
  gemini: "gemini-2.5-pro",
  perplexity: "sonar-reasoning-pro",
};

export const AiTrackingService = {
  async getConfig(projectId: string) {
    const config = await AiTrackingRepository.getConfig(projectId);
    if (!config) return null;
    const brandAliases = typeof config.brandAliases === "string"
      ? (JSON.parse(config.brandAliases || "[]") as string[])
      : (config.brandAliases as string[]);
    const platforms = typeof config.platforms === "string"
      ? (JSON.parse(config.platforms || "[]") as AiTrackingPlatform[])
      : (config.platforms as AiTrackingPlatform[]);
    return {
      ...config,
      brandAliases,
      platforms,
    };
  },

  async saveConfig(projectId: string, input: SaveAiTrackingConfigInput) {
    const config = await AiTrackingRepository.upsertConfig(projectId, input);
    const brandAliases = typeof config.brandAliases === "string"
      ? (JSON.parse(config.brandAliases || "[]") as string[])
      : (config.brandAliases as string[]);
    const platforms = typeof config.platforms === "string"
      ? (JSON.parse(config.platforms || "[]") as AiTrackingPlatform[])
      : (config.platforms as AiTrackingPlatform[]);
    return {
      ...config,
      brandAliases,
      platforms,
    };
  },

  async listPrompts(projectId: string) {
    const config = await AiTrackingRepository.getConfig(projectId);
    if (!config) return [];
    return AiTrackingRepository.listPrompts(config.id);
  },

  async addPrompts(projectId: string, prompts: string[]) {
    const config = await AiTrackingRepository.getConfig(projectId);
    if (!config) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Please configure AI tracking settings first.",
      );
    }
    await AiTrackingRepository.addPrompts(config.id, prompts);
  },

  async togglePrompt(projectId: string, promptId: string, active: boolean) {
    const config = await AiTrackingRepository.getConfig(projectId);
    if (!config) return;
    await AiTrackingRepository.togglePrompt(config.id, promptId, active);
  },

  async removePrompt(projectId: string, promptId: string) {
    const config = await AiTrackingRepository.getConfig(projectId);
    if (!config) return;
    await AiTrackingRepository.removePrompt(config.id, promptId);
  },

  async runTracking(
    projectId: string,
    billingCustomer: BillingCustomerContext,
    trigger: "manual" | "scheduled" = "manual",
  ) {
    const config = await this.getConfig(projectId);
    if (!config) {
      throw new AppError(
        "VALIDATION_ERROR",
        "AI Tracking is not configured for this project.",
      );
    }

    const activeRun = await AiTrackingRepository.getActiveRun(config.id);
    if (activeRun) {
      throw new AppError(
        "CONFLICT",
        "An AI Tracking run is already in progress.",
      );
    }

    const activePrompts = await AiTrackingRepository.getActivePrompts(config.id);
    if (activePrompts.length === 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        "No active tracking prompts found. Add prompts first.",
      );
    }

    const competitors = await ProjectCompetitorRepository.listForProject(projectId);
    const entities: TrackingEntity[] = [
      {
        name: config.brandName,
        domain: config.domain,
        aliases: config.brandAliases,
        isTargetBrand: true,
      },
      ...competitors.map((c) => ({
        name: c.domain.split(".")[0] || c.domain,
        domain: c.domain,
        aliases: [],
        isTargetBrand: false,
      })),
    ];

    const platforms = config.platforms.length > 0 ? config.platforms : (["chat_gpt", "gemini", "perplexity"] as AiTrackingPlatform[]);
    const runId = crypto.randomUUID();
    const promptsTotal = activePrompts.length * platforms.length;

    await AiTrackingRepository.createRun({
      id: runId,
      configId: config.id,
      projectId,
      trigger,
      promptsTotal,
    });

    const dataforseo = createDataforseoClient(billingCustomer);
    let completedCount = 0;
    let anySuccess = false;

    for (const promptItem of activePrompts) {
      for (const platform of platforms) {
        const observationId = crypto.randomUUID();
        const now = new Date().toISOString();

        try {
          const response = await dataforseo.aiSearch.llmResponse({
            modelSlug: platform,
            modelName: MODEL_NAMES[platform],
            userPrompt: promptItem.prompt,
            webSearch: true,
            maxOutputTokens: 2048,
          });

          const text = extractText(response);
          const citations = extractCitations(response);

          await AiTrackingRepository.recordObservations([
            {
              id: observationId,
              runId,
              configId: config.id,
              promptId: promptItem.id,
              prompt: promptItem.prompt,
              platform,
              status: "success",
              responseText: text,
              errorMessage: null,
              observedAt: now,
            },
          ]);

          const mentions = extractMentions(text, citations, entities);
          if (mentions.length > 0) {
            await AiTrackingRepository.recordMentions(
              mentions.map((m) => ({
                id: crypto.randomUUID(),
                observationId,
                runId,
                configId: config.id,
                brandName: m.brandName,
                domain: m.domain,
                isTargetBrand: m.isTargetBrand,
                position: m.position,
                sentiment: m.sentiment,
                evidence: m.evidence,
                createdAt: now,
              })),
            );
          }

          if (citations.length > 0) {
            await AiTrackingRepository.recordCitations(
              citations.map((c) => ({
                id: crypto.randomUUID(),
                observationId,
                runId,
                url: c.url,
                domain: c.domain,
                title: c.title,
                isTargetBrand: c.domain.toLowerCase().includes(config.domain.toLowerCase()),
                createdAt: now,
              })),
            );
          }

          anySuccess = true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await AiTrackingRepository.recordObservations([
            {
              id: observationId,
              runId,
              configId: config.id,
              promptId: promptItem.id,
              prompt: promptItem.prompt,
              platform,
              status: "failed",
              responseText: null,
              errorMessage,
              observedAt: now,
            },
          ]);
        }

        completedCount++;
        await AiTrackingRepository.updateRun(runId, {
          status: "running",
          promptsCompleted: completedCount,
        });
      }
    }

    const finalStatus = anySuccess ? "completed" : "failed";
    const completedAt = new Date().toISOString();
    await AiTrackingRepository.updateRun(runId, {
      status: finalStatus,
      promptsCompleted: completedCount,
      completedAt,
    });
    await AiTrackingRepository.updateConfigLastRun(config.id, completedAt);

    return { runId, status: finalStatus, promptsTotal, promptsCompleted: completedCount };
  },

  async getDashboard(
    projectId: string,
    options: { platform?: string; days?: number } = {},
  ): Promise<AiTrackingDashboardData> {
    const config = await this.getConfig(projectId);
    const promptsList = config ? await AiTrackingRepository.listPrompts(config.id) : [];
    const latestRun = config ? await AiTrackingRepository.getLatestRun(config.id) : null;

    if (!config) {
      return {
        config: null,
        prompts: [],
        kpi: {
          visibilityScore: 0,
          visibilityDelta: 0,
          brandReputationScore: 0,
          brandReputationDelta: 0,
          averagePosition: null,
          averagePositionDelta: null,
          totalResponses: 0,
          brandMentions: 0,
        },
        sentiment: {
          positive: 0,
          mixed: 0,
          negative: 0,
          neutral: 0,
          positivePercent: 0,
          topInsights: [],
        },
        positionTrend: [],
        visibilityTrend: [],
        competitorRankings: [],
        recentObservations: [],
        lastRun: null,
      };
    }

    const days = options.days ?? 30;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const observations = await AiTrackingRepository.getObservationsForDashboard(
      config.id,
      {
        platform: options.platform,
        sinceDate,
      },
    );

    const observationIds = observations.map((o) => o.id);
    const [mentions, citations] = await Promise.all([
      AiTrackingRepository.getMentionsForObservations(observationIds),
      AiTrackingRepository.getCitationsForObservations(observationIds),
    ]);

    return aggregateDashboardMetrics({
      config,
      promptsList,
      observations,
      mentions,
      citations,
      latestRun,
    });
  },
};
