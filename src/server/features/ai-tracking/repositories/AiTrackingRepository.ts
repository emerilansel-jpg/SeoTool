import { and, desc, eq, inArray, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  aiTrackingConfigs,
  aiTrackingPrompts,
  aiTrackingRuns,
  aiTrackingObservations,
  aiTrackingMentions,
  aiTrackingCitations,
} from "@/db/schema";
import { executeInBatches } from "@/db/runBatch";
import type {
  AiTrackingPlatform,
  SaveAiTrackingConfigInput,
} from "@/types/schemas/ai-tracking";

export const AiTrackingRepository = {
  async getConfig(projectId: string) {
    const rows = await db
      .select()
      .from(aiTrackingConfigs)
      .where(eq(aiTrackingConfigs.projectId, projectId))
      .limit(1);
    return rows[0] ?? null;
  },

  async upsertConfig(projectId: string, input: SaveAiTrackingConfigInput) {
    const existing = await this.getConfig(projectId);
    const now = new Date().toISOString();
    const platformsJson = JSON.stringify(input.platforms);
    const aliasesJson = JSON.stringify(input.brandAliases);

    if (existing) {
      await db
        .update(aiTrackingConfigs)
        .set({
          brandName: input.brandName,
          domain: input.domain,
          brandAliases: aliasesJson,
          platforms: platformsJson,
          schedule: input.schedule,
          scheduleStatus: input.scheduleStatus,
          updatedAt: now,
        })
        .where(eq(aiTrackingConfigs.id, existing.id));
      return { ...existing, ...input, updatedAt: now };
    }

    const newConfig = {
      id: crypto.randomUUID(),
      projectId,
      brandName: input.brandName,
      domain: input.domain,
      brandAliases: aliasesJson,
      platforms: platformsJson,
      schedule: input.schedule,
      scheduleStatus: input.scheduleStatus,
      nextRunAt: null,
      lastRunAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(aiTrackingConfigs).values(newConfig);
    return newConfig;
  },

  async listPrompts(configId: string) {
    return db
      .select()
      .from(aiTrackingPrompts)
      .where(eq(aiTrackingPrompts.configId, configId))
      .orderBy(desc(aiTrackingPrompts.createdAt));
  },

  async getActivePrompts(configId: string) {
    return db
      .select()
      .from(aiTrackingPrompts)
      .where(
        and(
          eq(aiTrackingPrompts.configId, configId),
          eq(aiTrackingPrompts.active, true),
        ),
      )
      .orderBy(desc(aiTrackingPrompts.createdAt));
  },

  async addPrompts(configId: string, prompts: string[]) {
    const now = new Date().toISOString();
    for (const p of prompts) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      await db
        .insert(aiTrackingPrompts)
        .values({
          id: crypto.randomUUID(),
          configId,
          prompt: trimmed,
          active: true,
          createdAt: now,
        })
        .onConflictDoNothing();
    }
  },

  async togglePrompt(configId: string, promptId: string, active: boolean) {
    await db
      .update(aiTrackingPrompts)
      .set({ active })
      .where(
        and(
          eq(aiTrackingPrompts.configId, configId),
          eq(aiTrackingPrompts.id, promptId),
        ),
      );
  },

  async removePrompt(configId: string, promptId: string) {
    await db
      .delete(aiTrackingPrompts)
      .where(
        and(
          eq(aiTrackingPrompts.configId, configId),
          eq(aiTrackingPrompts.id, promptId),
        ),
      );
  },

  async getActiveRun(configId: string) {
    const rows = await db
      .select()
      .from(aiTrackingRuns)
      .where(
        and(
          eq(aiTrackingRuns.configId, configId),
          inArray(aiTrackingRuns.status, ["pending", "running"]),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async getLatestRun(configId: string) {
    const rows = await db
      .select()
      .from(aiTrackingRuns)
      .where(eq(aiTrackingRuns.configId, configId))
      .orderBy(desc(aiTrackingRuns.startedAt))
      .limit(1);
    return rows[0] ?? null;
  },

  async createRun(data: {
    id: string;
    configId: string;
    projectId: string;
    trigger: "manual" | "scheduled";
    promptsTotal: number;
  }) {
    const now = new Date().toISOString();
    await db.insert(aiTrackingRuns).values({
      id: data.id,
      configId: data.configId,
      projectId: data.projectId,
      trigger: data.trigger,
      status: "running",
      promptsTotal: data.promptsTotal,
      promptsCompleted: 0,
      errorMessage: null,
      startedAt: now,
      completedAt: null,
    });
  },

  async updateRun(
    runId: string,
    data: {
      status: "pending" | "running" | "completed" | "failed";
      promptsCompleted?: number;
      errorMessage?: string | null;
      completedAt?: string | null;
    },
  ) {
    await db.update(aiTrackingRuns).set(data).where(eq(aiTrackingRuns.id, runId));
  },

  async updateConfigLastRun(configId: string, lastRunAt: string) {
    await db
      .update(aiTrackingConfigs)
      .set({ lastRunAt, updatedAt: lastRunAt })
      .where(eq(aiTrackingConfigs.id, configId));
  },

  async recordObservations(
    observations: Array<{
      id: string;
      runId: string;
      configId: string;
      promptId: string;
      prompt: string;
      platform: AiTrackingPlatform;
      status: "success" | "failed";
      responseText: string | null;
      errorMessage: string | null;
      observedAt: string;
    }>,
  ) {
    if (observations.length === 0) return;
    await executeInBatches(observations, (tx, obs) =>
      tx
        .insert(aiTrackingObservations)
        .values(obs)
        .onConflictDoNothing(),
    );
  },

  async recordMentions(
    mentions: Array<{
      id: string;
      observationId: string;
      runId: string;
      configId: string;
      brandName: string;
      domain: string;
      isTargetBrand: boolean;
      position: number | null;
      sentiment: "positive" | "mixed" | "neutral" | "negative";
      evidence: string | null;
      createdAt: string;
    }>,
  ) {
    if (mentions.length === 0) return;
    await executeInBatches(mentions, (tx, m) =>
      tx.insert(aiTrackingMentions).values(m),
    );
  },

  async recordCitations(
    citations: Array<{
      id: string;
      observationId: string;
      runId: string;
      url: string;
      domain: string;
      title: string | null;
      isTargetBrand: boolean;
      createdAt: string;
    }>,
  ) {
    if (citations.length === 0) return;
    await executeInBatches(citations, (tx, c) =>
      tx.insert(aiTrackingCitations).values(c),
    );
  },

  async getObservationsForDashboard(
    configId: string,
    options: { platform?: string; sinceDate?: string },
  ) {
    const conditions = [eq(aiTrackingObservations.configId, configId)];
    if (options.sinceDate) {
      conditions.push(gte(aiTrackingObservations.observedAt, options.sinceDate));
    }
    if (options.platform && options.platform !== "all") {
      conditions.push(
        eq(
          aiTrackingObservations.platform,
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion
          options.platform as AiTrackingPlatform,
        ),
      );
    }

    return db
      .select()
      .from(aiTrackingObservations)
      .where(and(...conditions))
      .orderBy(desc(aiTrackingObservations.observedAt));
  },

  async getMentionsForObservations(observationIds: string[]) {
    if (observationIds.length === 0) return [];
    return db
      .select()
      .from(aiTrackingMentions)
      .where(inArray(aiTrackingMentions.observationId, observationIds));
  },

  async getCitationsForObservations(observationIds: string[]) {
    if (observationIds.length === 0) return [];
    return db
      .select()
      .from(aiTrackingCitations)
      .where(inArray(aiTrackingCitations.observationId, observationIds));
  },
};
