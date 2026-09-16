import type { BillingCustomerContext } from "@/server/billing/subscription";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";
import { ProjectCompetitorRepository } from "@/server/features/projects/repositories/ProjectCompetitorRepository";
import {
  GscService,
  GscNotConnectedError,
} from "@/server/features/gsc/services/GscService";
import { AiTrackingRepository } from "../repositories/AiTrackingRepository";
import { extractMentions, type TrackingEntity } from "../extraction";
import {
  aggregateDashboardMetrics,
  extractCitations,
  extractText,
} from "../dashboardAggregation";
import type {
  AiTrackingDashboardData,
  AiTrackingPlatform,
  GetDiscoveredPromptsInput,
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
    const brandAliases =
      typeof config.brandAliases === "string"
        ? (JSON.parse(config.brandAliases || "[]") as string[])
        : (config.brandAliases as string[]);
    const platforms =
      typeof config.platforms === "string"
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
    const brandAliases =
      typeof config.brandAliases === "string"
        ? (JSON.parse(config.brandAliases || "[]") as string[])
        : (config.brandAliases as string[]);
    const platforms =
      typeof config.platforms === "string"
        ? (JSON.parse(config.platforms || "[]") as AiTrackingPlatform[])
        : (config.platforms as AiTrackingPlatform[]);

    // If config has no prompts yet, auto-seed default high-intent brand prompts
    const existingPrompts = await AiTrackingRepository.listPrompts(config.id);
    if (existingPrompts.length === 0) {
      const defaultPrompts = [
        `What is ${input.brandName}?`,
        `What services and products does ${input.brandName} offer?`,
        `Reviews and reputation of ${input.brandName}`,
        `Top alternatives and competitors to ${input.brandName}`,
      ];
      await AiTrackingRepository.addPrompts(config.id, defaultPrompts);
      await AiTrackingRepository.upsertDiscoveredPrompts(
        config.id,
        defaultPrompts.map((p) => ({
          prompt: p,
          platform: "all",
          aiSearchVolume: 10,
          hasMention: true,
          hasCitation: false,
          brandEntities: [input.brandName],
          isTracked: true,
        })),
      );
    }

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

    let activePrompts = await AiTrackingRepository.getActivePrompts(
      config.id,
    );
    if (activePrompts.length === 0) {
      const defaultPrompts = [
        `What is ${config.brandName}?`,
        `What services and products does ${config.brandName} offer?`,
        `Reviews and reputation of ${config.brandName}`,
        `Top alternatives and competitors to ${config.brandName}`,
      ];
      await AiTrackingRepository.addPrompts(config.id, defaultPrompts);
      activePrompts = await AiTrackingRepository.getActivePrompts(config.id);
    }

    const competitors =
      await ProjectCompetitorRepository.listForProject(projectId);
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

    const platforms =
      config.platforms.length > 0
        ? config.platforms
        : (["chat_gpt", "gemini", "perplexity"] as AiTrackingPlatform[]);
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
            const cleanConfigDomain = config.domain
              .toLowerCase()
              .replace(/^https?:\/\//, "")
              .replace(/^www\./, "")
              .replace(/\/.*$/, "");

            await AiTrackingRepository.recordCitations(
              citations.map((c) => {
                const cleanCitDomain = c.domain
                  .toLowerCase()
                  .replace(/^https?:\/\//, "")
                  .replace(/^www\./, "")
                  .replace(/\/.*$/, "");
                const isTarget =
                  cleanCitDomain.includes(cleanConfigDomain) ||
                  cleanConfigDomain.includes(cleanCitDomain) ||
                  c.url.toLowerCase().includes(cleanConfigDomain);

                return {
                  id: crypto.randomUUID(),
                  observationId,
                  runId,
                  url: c.url,
                  domain: c.domain,
                  title: c.title,
                  isTargetBrand: isTarget,
                  createdAt: now,
                };
              }),
            );
          }

          anySuccess = true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
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

    // Record historical visibility snapshot for today
    if (anySuccess) {
      try {
        const todayStr = completedAt.slice(0, 10);
        const obs = await AiTrackingRepository.getObservationsForDashboard(
          config.id,
          {
            sinceDate: `${todayStr}T00:00:00.000Z`,
          },
        );
        const obsIds = obs.map((o) => o.id);
        const [mList, cList] = await Promise.all([
          AiTrackingRepository.getMentionsForObservations(obsIds),
          AiTrackingRepository.getCitationsForObservations(obsIds),
        ]);
        const targetMentions = mList.filter((m) => m.isTargetBrand).length;
        const targetCitations = cList.filter((c) => c.isTargetBrand).length;
        const totalResp = obs.filter((o) => o.status === "success").length;
        const totalAllMentions = mList.length;

        const mentionRate =
          totalResp > 0 ? Math.round((targetMentions / totalResp) * 100) : 0;
        const citationRate =
          totalResp > 0 ? Math.round((targetCitations / totalResp) * 100) : 0;
        const shareOfVoice =
          totalAllMentions > 0
            ? Math.round((targetMentions / totalAllMentions) * 100)
            : 0;
        const visibilityScore = Math.min(
          100,
          Math.round(
            0.35 * mentionRate +
              0.3 * citationRate +
              0.2 * Math.min(100, mentionRate * 1.2) +
              0.15 * shareOfVoice,
          ),
        );

        await AiTrackingRepository.recordVisibilitySnapshot(config.id, {
          snapshotDate: todayStr,
          platform: "all",
          visibilityScore,
          mentionRate,
          citationRate,
          shareOfVoice,
          promptsTracked: activePrompts.length,
          promptsMentioned: targetMentions,
          promptsCited: targetCitations,
        });
      } catch (snapshotErr) {
        console.error("Failed to record visibility snapshot:", snapshotErr);
      }
    }

    return {
      runId,
      status: finalStatus,
      promptsTotal,
      promptsCompleted: completedCount,
    };
  },

  async getDashboard(
    projectId: string,
    options: { platform?: string; days?: number } = {},
  ): Promise<AiTrackingDashboardData> {
    const config = await this.getConfig(projectId);
    const promptsList = config
      ? await AiTrackingRepository.listPrompts(config.id)
      : [];
    const latestRun = config
      ? await AiTrackingRepository.getLatestRun(config.id)
      : null;

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
    const sinceDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [observations, discoveryStats, snapshots] = await Promise.all([
      AiTrackingRepository.getObservationsForDashboard(config.id, {
        platform: options.platform,
        sinceDate,
      }),
      AiTrackingRepository.getDiscoveryStats(config.id),
      AiTrackingRepository.listVisibilitySnapshots(config.id, days),
    ]);

    const observationIds = observations.map((o) => o.id);
    const [mentions, citations] = await Promise.all([
      AiTrackingRepository.getMentionsForObservations(observationIds),
      AiTrackingRepository.getCitationsForObservations(observationIds),
    ]);

    const dashboard = aggregateDashboardMetrics({
      config,
      promptsList,
      observations,
      mentions,
      citations,
      latestRun,
    });

    // If historical snapshots exist, enrich visibilityTrend and deltas
    if (snapshots.length > 0) {
      dashboard.visibilityTrend = snapshots.map((s) => ({
        date: s.snapshotDate,
        visibility: s.visibilityScore,
      }));
      if (snapshots.length > 1) {
        const latest = snapshots[snapshots.length - 1];
        const prev = snapshots[0];
        dashboard.kpi.visibilityDelta =
          latest.visibilityScore - prev.visibilityScore;
      }
    }

    dashboard.discoveryStats = {
      ...discoveryStats,
      lastDiscoveryAt: config.lastDiscoveryAt ?? null,
    };

    return dashboard;
  },

  async listDiscoveredPrompts(
    projectId: string,
    options: GetDiscoveredPromptsInput,
  ) {
    const config = await this.getConfig(projectId);
    if (!config)
      return { items: [], page: 1, pageSize: 20, hasNextPage: false };
    return AiTrackingRepository.listDiscoveredPrompts(config.id, options);
  },

  async promoteDiscoveredPrompt(projectId: string, promptId: string) {
    const config = await this.getConfig(projectId);
    if (!config) return null;
    return AiTrackingRepository.promoteDiscoveredPrompt(config.id, promptId);
  },

  async getPages(projectId: string) {
    const config = await this.getConfig(projectId);
    if (!config) return [];
    return AiTrackingRepository.listTopPages(config.id);
  },

  async getCitations(projectId: string) {
    const config = await this.getConfig(projectId);
    if (!config) return { sources: [], opportunities: [] };
    const allSources = await AiTrackingRepository.listCitationSources(
      config.id,
    );
    const sources = allSources.filter((s) => s.isTargetBrand);
    const opportunities = allSources
      .filter((s) => !s.isTargetBrand)
      .slice(0, 30);
    return { sources, opportunities };
  },

  async getCompetitors(projectId: string) {
    const config = await this.getConfig(projectId);
    if (!config) {
      return { competitors: [], promptGaps: [], shareOfVoice: [] };
    }

    const projectCompetitors =
      await ProjectCompetitorRepository.listForProject(projectId);

    const observations = await AiTrackingRepository.getObservationsForDashboard(
      config.id,
      {},
    );
    const obsIds = observations.map((o) => o.id);
    const mentions =
      await AiTrackingRepository.getMentionsForObservations(obsIds);

    // Group mentions by domain
    const mentionCounts = new Map<
      string,
      { brandName: string; count: number; positions: number[] }
    >();
    for (const m of mentions) {
      const key = m.domain.toLowerCase();
      const entry = mentionCounts.get(key) ?? {
        brandName: m.brandName,
        count: 0,
        positions: [],
      };
      entry.count++;
      if (m.position != null) entry.positions.push(m.position);
      mentionCounts.set(key, entry);
    }

    const totalMentions = mentions.length;
    const shareOfVoice = Array.from(mentionCounts.entries())
      .map(([domain, data]) => ({
        domain,
        brandName: data.brandName,
        isTargetBrand: domain === config.domain.toLowerCase(),
        mentionsCount: data.count,
        shareOfVoice:
          totalMentions > 0
            ? Math.round((data.count / totalMentions) * 100)
            : 0,
        avgPosition:
          data.positions.length > 0
            ? Number(
                (
                  data.positions.reduce((a, b) => a + b, 0) /
                  data.positions.length
                ).toFixed(1),
              )
            : null,
      }))
      .sort((a, b) => b.mentionsCount - a.mentionsCount);

    // AI Prompt Gap: prompts where competitors appear, but our brand is NOT mentioned
    const promptMentionsMap = new Map<
      string,
      {
        ourMention: boolean;
        ourCitation: boolean;
        competitors: Set<string>;
      }
    >();
    const obsPromptMap = new Map(observations.map((o) => [o.id, o.prompt]));

    for (const m of mentions) {
      const prompt = obsPromptMap.get(m.observationId);
      if (!prompt) continue;
      const entry = promptMentionsMap.get(prompt) ?? {
        ourMention: false,
        ourCitation: false,
        competitors: new Set<string>(),
      };
      if (m.isTargetBrand) {
        entry.ourMention = true;
      } else {
        entry.competitors.add(m.brandName || m.domain);
      }
      promptMentionsMap.set(prompt, entry);
    }

    // Also factor in discovered prompts
    const discovered = await AiTrackingRepository.listDiscoveredPrompts(
      config.id,
      { pageSize: 100 },
    );
    const promptGaps: Array<{
      prompt: string;
      aiSearchVolume: number;
      ourMention: boolean;
      ourCitation: boolean;
      competitorsMentioned: string[];
    }> = [];

    for (const [prompt, data] of promptMentionsMap.entries()) {
      if (!data.ourMention && data.competitors.size > 0) {
        const discMatch = discovered.items.find(
          (d) => d.prompt.toLowerCase() === prompt.toLowerCase(),
        );
        promptGaps.push({
          prompt,
          aiSearchVolume: discMatch?.aiSearchVolume ?? 0,
          ourMention: false,
          ourCitation: false,
          competitorsMentioned: Array.from(data.competitors),
        });
      }
    }

    for (const d of discovered.items) {
      if (!d.hasMention && d.brandEntities.length > 0) {
        if (
          !promptGaps.some(
            (g) => g.prompt.toLowerCase() === d.prompt.toLowerCase(),
          )
        ) {
          promptGaps.push({
            prompt: d.prompt,
            aiSearchVolume: d.aiSearchVolume,
            ourMention: false,
            ourCitation: d.hasCitation,
            competitorsMentioned: d.brandEntities,
          });
        }
      }
    }

    promptGaps.sort((a, b) => b.aiSearchVolume - a.aiSearchVolume);

    return {
      competitors: projectCompetitors,
      shareOfVoice,
      promptGaps,
    };
  },

  async getGscCorrelation(
    projectId: string,
    _options: { dateRange?: string } = {},
  ) {
    const config = await this.getConfig(projectId);
    if (!config) {
      return { connected: false, items: [] };
    }

    // 1. Get Discovered Prompts & Tracked Prompts
    const [discovered, tracked] = await Promise.all([
      AiTrackingRepository.listDiscoveredPrompts(config.id, { pageSize: 100 }),
      AiTrackingRepository.getActivePrompts(config.id),
    ]);

    const allPromptsMap = new Map<
      string,
      {
        prompt: string;
        hasMention: boolean;
        hasCitation: boolean;
        isTracked: boolean;
      }
    >();

    for (const d of discovered.items) {
      allPromptsMap.set(d.prompt.toLowerCase().trim(), {
        prompt: d.prompt,
        hasMention: d.hasMention,
        hasCitation: d.hasCitation,
        isTracked: d.isTracked,
      });
    }

    for (const t of tracked) {
      const key = t.prompt.toLowerCase().trim();
      const existing = allPromptsMap.get(key);
      allPromptsMap.set(key, {
        prompt: t.prompt,
        hasMention: existing ? existing.hasMention : true,
        hasCitation: existing ? existing.hasCitation : false,
        isTracked: true,
      });
    }

    // 2. Fetch GSC Queries
    try {
      const gscResult = await GscService.getPerformance({
        projectId,
        dimensions: ["query"],
        rowLimit: 500,
      });

      const gscRows = gscResult.rows ?? [];
      const gscMap = new Map<
        string,
        {
          query: string;
          clicks: number;
          impressions: number;
          ctr: number;
          position: number;
        }
      >();

      for (const row of gscRows) {
        const queryStr = row.keys?.[0];
        if (!queryStr) continue;
        gscMap.set(queryStr.toLowerCase().trim(), {
          query: queryStr,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: Number((row.ctr * 100).toFixed(1)),
          position: Number(row.position.toFixed(1)),
        });
      }

      const items: Array<{
        aiPrompt: string;
        aiPresence: boolean;
        aiCitation: boolean;
        gscQuery: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
        sourceBadge: "GSC" | "DataForSEO" | "Tracked" | "Calculated";
      }> = [];

      for (const item of allPromptsMap.values()) {
        const key = item.prompt.toLowerCase().trim();
        // Exact match or contains match
        let gscMatch = gscMap.get(key);
        if (!gscMatch) {
          for (const [gscKey, val] of gscMap.entries()) {
            if (key.includes(gscKey) || gscKey.includes(key)) {
              gscMatch = val;
              break;
            }
          }
        }

        items.push({
          aiPrompt: item.prompt,
          aiPresence: item.hasMention,
          aiCitation: item.hasCitation,
          gscQuery: gscMatch ? gscMatch.query : "-",
          clicks: gscMatch ? gscMatch.clicks : 0,
          impressions: gscMatch ? gscMatch.impressions : 0,
          ctr: gscMatch ? gscMatch.ctr : 0,
          position: gscMatch ? gscMatch.position : 0,
          sourceBadge: gscMatch
            ? "GSC"
            : item.isTracked
              ? "Tracked"
              : "DataForSEO",
        });
      }

      // Sort by impressions descending, then clicks
      items.sort(
        (a, b) => b.impressions - a.impressions || b.clicks - a.clicks,
      );

      return {
        connected: true,
        items,
      };
    } catch (err) {
      if (err instanceof GscNotConnectedError) {
        return {
          connected: false,
          items: Array.from(allPromptsMap.values()).map((item) => ({
            aiPrompt: item.prompt,
            aiPresence: item.hasMention,
            aiCitation: item.hasCitation,
            gscQuery: "-",
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: 0,
            sourceBadge: item.isTracked ? "Tracked" : "DataForSEO",
          })),
        };
      }
      throw err;
    }
  },
};
