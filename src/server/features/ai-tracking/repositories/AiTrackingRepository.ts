import { and, desc, eq, inArray, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  aiTrackingConfigs,
  aiTrackingPrompts,
  aiTrackingRuns,
  aiTrackingObservations,
  aiTrackingMentions,
  aiTrackingCitations,
  aiDiscoveredPrompts,
  aiTopPages,
  aiVisibilitySnapshots,
} from "@/db/schema";
import { executeInBatches, runBatch } from "@/db/runBatch";
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
        .where(
          and(
            eq(aiTrackingConfigs.id, existing.id),
            eq(aiTrackingConfigs.projectId, projectId),
          ),
        );
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

  async resetIdentityDerivedData(configId: string) {
    const obs = await db
      .select({ id: aiTrackingObservations.id })
      .from(aiTrackingObservations)
      .where(eq(aiTrackingObservations.configId, configId));
    const obsIds = obs.map((o) => o.id);

    if (obsIds.length > 0) {
      await executeInBatches(obsIds, (tx, obsId) =>
        tx
          .delete(aiTrackingCitations)
          .where(eq(aiTrackingCitations.observationId, obsId)),
      );
    }

    await runBatch((tx) => [
      tx
        .delete(aiTrackingMentions)
        .where(eq(aiTrackingMentions.configId, configId)),
      tx
        .delete(aiTrackingObservations)
        .where(eq(aiTrackingObservations.configId, configId)),
      tx.delete(aiTrackingRuns).where(eq(aiTrackingRuns.configId, configId)),
      tx
        .delete(aiTrackingPrompts)
        .where(eq(aiTrackingPrompts.configId, configId)),
      tx
        .delete(aiDiscoveredPrompts)
        .where(eq(aiDiscoveredPrompts.configId, configId)),
      tx.delete(aiTopPages).where(eq(aiTopPages.configId, configId)),
      tx
        .delete(aiVisibilitySnapshots)
        .where(eq(aiVisibilitySnapshots.configId, configId)),
      tx
        .update(aiTrackingConfigs)
        .set({
          lastDiscoveryAt: null,
          lastRunAt: null,
          nextRunAt: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(aiTrackingConfigs.id, configId)),
    ]);
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
    const rows = await db
      .update(aiTrackingPrompts)
      .set({ active })
      .where(
        and(
          eq(aiTrackingPrompts.configId, configId),
          eq(aiTrackingPrompts.id, promptId),
        ),
      )
      .returning({ id: aiTrackingPrompts.id });
    return rows.length > 0;
  },

  async removePrompt(configId: string, promptId: string) {
    const rows = await db
      .delete(aiTrackingPrompts)
      .where(
        and(
          eq(aiTrackingPrompts.configId, configId),
          eq(aiTrackingPrompts.id, promptId),
        ),
      )
      .returning({ id: aiTrackingPrompts.id });
    return rows.length > 0;
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
    configId: string,
    runId: string,
    data: {
      status: "pending" | "running" | "completed" | "failed";
      promptsCompleted?: number;
      errorMessage?: string | null;
      completedAt?: string | null;
    },
  ) {
    await db
      .update(aiTrackingRuns)
      .set(data)
      .where(
        and(
          eq(aiTrackingRuns.id, runId),
          eq(aiTrackingRuns.configId, configId),
        ),
      );
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
      tx.insert(aiTrackingObservations).values(obs).onConflictDoNothing(),
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
      conditions.push(
        gte(aiTrackingObservations.observedAt, options.sinceDate),
      );
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

  async getMentionsForObservations(configId: string, observationIds: string[]) {
    if (observationIds.length === 0) return [];
    return db
      .select()
      .from(aiTrackingMentions)
      .where(
        and(
          eq(aiTrackingMentions.configId, configId),
          inArray(aiTrackingMentions.observationId, observationIds),
        ),
      );
  },

  async getCitationsForObservations(
    configId: string,
    observationIds: string[],
  ) {
    if (observationIds.length === 0) return [];
    return db
      .select({
        id: aiTrackingCitations.id,
        observationId: aiTrackingCitations.observationId,
        runId: aiTrackingCitations.runId,
        url: aiTrackingCitations.url,
        domain: aiTrackingCitations.domain,
        title: aiTrackingCitations.title,
        isTargetBrand: aiTrackingCitations.isTargetBrand,
        createdAt: aiTrackingCitations.createdAt,
      })
      .from(aiTrackingCitations)
      .innerJoin(
        aiTrackingObservations,
        eq(aiTrackingObservations.id, aiTrackingCitations.observationId),
      )
      .where(
        and(
          eq(aiTrackingObservations.configId, configId),
          inArray(aiTrackingCitations.observationId, observationIds),
        ),
      );
  },

  async updateConfigDiscoveryDate(configId: string, timestamp: string) {
    await db
      .update(aiTrackingConfigs)
      .set({ lastDiscoveryAt: timestamp, updatedAt: timestamp })
      .where(eq(aiTrackingConfigs.id, configId));
  },

  async upsertDiscoveredPrompts(
    configId: string,
    items: Array<{
      prompt: string;
      platform?: string;
      aiSearchVolume?: number;
      hasMention?: boolean;
      hasCitation?: boolean;
      citationUrl?: string | null;
      brandEntities?: string[];
      sources?: Array<{
        url?: string | null;
        title?: string | null;
        domain?: string | null;
      }>;
      isTracked?: boolean;
      firstResponseAt?: string | null;
      lastResponseAt?: string | null;
    }>,
  ) {
    if (items.length === 0) return;
    const now = new Date().toISOString();
    const existing = await db
      .select({
        id: aiDiscoveredPrompts.id,
        prompt: aiDiscoveredPrompts.prompt,
      })
      .from(aiDiscoveredPrompts)
      .where(eq(aiDiscoveredPrompts.configId, configId));
    const map = new Map(existing.map((e) => [e.prompt.toLowerCase(), e.id]));

    const toInsert: Array<typeof aiDiscoveredPrompts.$inferInsert> = [];
    for (const item of items) {
      const lower = item.prompt.toLowerCase().trim();
      const existingId = map.get(lower);
      if (existingId) {
        await db
          .update(aiDiscoveredPrompts)
          .set({
            aiSearchVolume: item.aiSearchVolume ?? 0,
            hasMention: item.hasMention ?? false,
            hasCitation: item.hasCitation ?? false,
            citationUrl: item.citationUrl ?? null,
            brandEntities: JSON.stringify(item.brandEntities ?? []),
            sources: JSON.stringify(item.sources ?? []),
            isTracked:
              item.isTracked !== undefined ? item.isTracked : undefined,
            lastResponseAt: item.lastResponseAt ?? null,
          })
          .where(eq(aiDiscoveredPrompts.id, existingId));
      } else {
        toInsert.push({
          id: crypto.randomUUID(),
          configId,
          prompt: item.prompt.trim(),
          platform: item.platform ?? "all",
          aiSearchVolume: item.aiSearchVolume ?? 0,
          hasMention: item.hasMention ?? false,
          hasCitation: item.hasCitation ?? false,
          citationUrl: item.citationUrl ?? null,
          brandEntities: JSON.stringify(item.brandEntities ?? []),
          sources: JSON.stringify(item.sources ?? []),
          isTracked: item.isTracked ?? false,
          firstResponseAt: item.firstResponseAt ?? null,
          lastResponseAt: item.lastResponseAt ?? null,
          discoveredAt: now,
        });
      }
    }

    if (toInsert.length > 0) {
      await executeInBatches(toInsert, (tx, row) =>
        tx.insert(aiDiscoveredPrompts).values(row).onConflictDoNothing(),
      );
    }
  },

  async listDiscoveredPrompts(
    configId: string,
    options: {
      platform?: string;
      filter?: "all" | "mentioned" | "cited" | "untracked";
      search?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(100, Math.max(5, options.pageSize ?? 20));
    const offset = (page - 1) * pageSize;

    const conditions = [eq(aiDiscoveredPrompts.configId, configId)];
    if (options.platform && options.platform !== "all") {
      conditions.push(eq(aiDiscoveredPrompts.platform, options.platform));
    }
    if (options.filter === "mentioned") {
      conditions.push(eq(aiDiscoveredPrompts.hasMention, true));
    } else if (options.filter === "cited") {
      conditions.push(eq(aiDiscoveredPrompts.hasCitation, true));
    } else if (options.filter === "untracked") {
      conditions.push(eq(aiDiscoveredPrompts.isTracked, false));
    }

    const rows = await db
      .select()
      .from(aiDiscoveredPrompts)
      .where(and(...conditions))
      .orderBy(
        desc(aiDiscoveredPrompts.aiSearchVolume),
        desc(aiDiscoveredPrompts.discoveredAt),
      )
      .limit(pageSize + 1)
      .offset(offset);

    const hasNextPage = rows.length > pageSize;
    const items = rows.slice(0, pageSize).map((r) => ({
      ...r,
      brandEntities: JSON.parse(r.brandEntities || "[]") as string[],
      sources: JSON.parse(r.sources || "[]") as Array<{
        url?: string | null;
        title?: string | null;
        domain?: string | null;
      }>,
    }));

    return { items, page, pageSize, hasNextPage };
  },

  async promoteDiscoveredPrompt(configId: string, promptId: string) {
    const rows = await db
      .select()
      .from(aiDiscoveredPrompts)
      .where(
        and(
          eq(aiDiscoveredPrompts.configId, configId),
          eq(aiDiscoveredPrompts.id, promptId),
        ),
      )
      .limit(1);
    const discovered = rows[0];
    if (!discovered) return null;

    await this.addPrompts(configId, [discovered.prompt]);
    await db
      .update(aiDiscoveredPrompts)
      .set({ isTracked: true })
      .where(
        and(
          eq(aiDiscoveredPrompts.id, promptId),
          eq(aiDiscoveredPrompts.configId, configId),
        ),
      );
    return discovered;
  },

  async upsertTopPages(
    configId: string,
    items: Array<{
      url: string;
      platform?: string;
      mentions?: number;
      aiSearchVolume?: number;
    }>,
  ) {
    if (items.length === 0) return;
    const now = new Date().toISOString();
    for (const item of items) {
      const platform = item.platform ?? "all";
      const existing = await db
        .select({ id: aiTopPages.id })
        .from(aiTopPages)
        .where(
          and(
            eq(aiTopPages.configId, configId),
            eq(aiTopPages.url, item.url),
            eq(aiTopPages.platform, platform),
          ),
        )
        .limit(1);

      if (existing[0]) {
        await db
          .update(aiTopPages)
          .set({
            mentions: item.mentions ?? 0,
            aiSearchVolume: item.aiSearchVolume ?? 0,
            updatedAt: now,
          })
          .where(eq(aiTopPages.id, existing[0].id));
      } else {
        await db.insert(aiTopPages).values({
          id: crypto.randomUUID(),
          configId,
          url: item.url,
          platform,
          mentions: item.mentions ?? 0,
          aiSearchVolume: item.aiSearchVolume ?? 0,
          updatedAt: now,
        });
      }
    }
  },

  async listTopPages(configId: string) {
    return db
      .select()
      .from(aiTopPages)
      .where(eq(aiTopPages.configId, configId))
      .orderBy(desc(aiTopPages.mentions), desc(aiTopPages.aiSearchVolume));
  },

  async recordVisibilitySnapshot(
    configId: string,
    snapshot: {
      snapshotDate: string;
      platform?: string;
      visibilityScore: number;
      mentionRate: number;
      citationRate: number;
      shareOfVoice: number;
      promptsTracked: number;
      promptsMentioned: number;
      promptsCited: number;
    },
  ) {
    const platform = snapshot.platform ?? "all";
    const now = new Date().toISOString();
    const existing = await db
      .select({ id: aiVisibilitySnapshots.id })
      .from(aiVisibilitySnapshots)
      .where(
        and(
          eq(aiVisibilitySnapshots.configId, configId),
          eq(aiVisibilitySnapshots.snapshotDate, snapshot.snapshotDate),
          eq(aiVisibilitySnapshots.platform, platform),
        ),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(aiVisibilitySnapshots)
        .set({
          visibilityScore: snapshot.visibilityScore,
          mentionRate: snapshot.mentionRate,
          citationRate: snapshot.citationRate,
          shareOfVoice: snapshot.shareOfVoice,
          promptsTracked: snapshot.promptsTracked,
          promptsMentioned: snapshot.promptsMentioned,
          promptsCited: snapshot.promptsCited,
        })
        .where(eq(aiVisibilitySnapshots.id, existing[0].id));
    } else {
      await db.insert(aiVisibilitySnapshots).values({
        id: crypto.randomUUID(),
        configId,
        snapshotDate: snapshot.snapshotDate,
        platform,
        visibilityScore: snapshot.visibilityScore,
        mentionRate: snapshot.mentionRate,
        citationRate: snapshot.citationRate,
        shareOfVoice: snapshot.shareOfVoice,
        promptsTracked: snapshot.promptsTracked,
        promptsMentioned: snapshot.promptsMentioned,
        promptsCited: snapshot.promptsCited,
        createdAt: now,
      });
    }
  },

  async listVisibilitySnapshots(configId: string, days = 30) {
    const cutoff = new Date(Date.now() - days * 86400000)
      .toISOString()
      .slice(0, 10);
    return db
      .select()
      .from(aiVisibilitySnapshots)
      .where(
        and(
          eq(aiVisibilitySnapshots.configId, configId),
          gte(aiVisibilitySnapshots.snapshotDate, cutoff),
        ),
      )
      .orderBy(aiVisibilitySnapshots.snapshotDate);
  },

  async listCitationSources(configId: string) {
    const citations = await db
      .select({
        domain: aiTrackingCitations.domain,
        url: aiTrackingCitations.url,
        isTargetBrand: aiTrackingCitations.isTargetBrand,
      })
      .from(aiTrackingCitations)
      .innerJoin(
        aiTrackingObservations,
        eq(aiTrackingCitations.observationId, aiTrackingObservations.id),
      )
      .where(eq(aiTrackingObservations.configId, configId));

    const discovered = await db
      .select({ sources: aiDiscoveredPrompts.sources })
      .from(aiDiscoveredPrompts)
      .where(eq(aiDiscoveredPrompts.configId, configId));

    const domainMap = new Map<
      string,
      {
        domain: string;
        frequency: number;
        isTargetBrand: boolean;
        sampleUrls: Set<string>;
      }
    >();

    for (const c of citations) {
      const d = c.domain.toLowerCase();
      const entry = domainMap.get(d) ?? {
        domain: d,
        frequency: 0,
        isTargetBrand: Boolean(c.isTargetBrand),
        sampleUrls: new Set<string>(),
      };
      entry.frequency++;
      if (c.url) entry.sampleUrls.add(c.url);
      domainMap.set(d, entry);
    }

    for (const d of discovered) {
      const sources = JSON.parse(d.sources || "[]") as Array<{
        domain?: string;
        url?: string;
      }>;
      for (const s of sources) {
        if (!s.domain) continue;
        const dom = s.domain.toLowerCase();
        const entry = domainMap.get(dom) ?? {
          domain: dom,
          frequency: 0,
          isTargetBrand: false,
          sampleUrls: new Set<string>(),
        };
        entry.frequency++;
        if (s.url) entry.sampleUrls.add(s.url);
        domainMap.set(dom, entry);
      }
    }

    return Array.from(domainMap.values())
      .map((entry) => ({
        domain: entry.domain,
        frequency: entry.frequency,
        isTargetBrand: entry.isTargetBrand,
        sampleUrls: Array.from(entry.sampleUrls).slice(0, 3),
        promptsCount: entry.frequency,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  },

  async getDiscoveryStats(configId: string) {
    const rows = await db
      .select()
      .from(aiDiscoveredPrompts)
      .where(eq(aiDiscoveredPrompts.configId, configId));

    let totalSearchVolume = 0;
    let totalMentioned = 0;
    let totalCited = 0;

    for (const r of rows) {
      totalSearchVolume += r.aiSearchVolume;
      if (r.hasMention) totalMentioned++;
      if (r.hasCitation) totalCited++;
    }

    return {
      totalDiscovered: rows.length,
      totalMentioned,
      totalCited,
      totalSearchVolume,
    };
  },
};
