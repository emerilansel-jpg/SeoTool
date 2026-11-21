import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { aiBotDailyStats, aiBotHits, aiBotSites } from "@/db/schema";

export type AiBotSite = typeof aiBotSites.$inferSelect;
export type AiBotHit = typeof aiBotHits.$inferSelect;
export type AiBotDailyStat = typeof aiBotDailyStats.$inferSelect;

export type NewAiBotHit = Omit<AiBotHit, "id" | "createdAt">;

async function getByProjectId(projectId: string): Promise<AiBotSite | null> {
  const rows = await db
    .select()
    .from(aiBotSites)
    .where(eq(aiBotSites.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

async function getByIngestToken(token: string): Promise<AiBotSite | null> {
  const rows = await db
    .select()
    .from(aiBotSites)
    .where(eq(aiBotSites.ingestToken, token))
    .limit(1);
  return rows[0] ?? null;
}

async function upsertSite(input: {
  projectId: string;
  organizationId: string;
  domain: string;
  ingestToken: string;
}): Promise<AiBotSite> {
  const [row] = await db
    .insert(aiBotSites)
    .values({ id: crypto.randomUUID(), ...input })
    .onConflictDoUpdate({
      target: aiBotSites.projectId,
      set: {
        domain: input.domain,
        organizationId: input.organizationId,
        ingestToken: input.ingestToken,
        updatedAt: sql`(current_timestamp)`,
      },
    })
    .returning();
  if (!row) throw new Error("Failed to upsert ai_bot_sites");
  return row;
}

async function deleteSite(projectId: string): Promise<void> {
  await db.delete(aiBotSites).where(eq(aiBotSites.projectId, projectId));
}

async function insertHits(hits: NewAiBotHit[]): Promise<number> {
  if (hits.length === 0) return 0;
  // Chunked inserts keep placeholders within driver limits.
  const CHUNK = 200;
  let inserted = 0;
  for (let i = 0; i < hits.length; i += CHUNK) {
    const chunk = hits.slice(i, i + CHUNK).map((hit) => ({
      ...hit,
      id: crypto.randomUUID(),
    }));
    await db.insert(aiBotHits).values(chunk);
    inserted += chunk.length;
  }
  return inserted;
}

async function updateRobotsCompliance(
  projectId: string,
  robotsCompliance: string | null,
  robotsCheckedAt: string | null,
): Promise<void> {
  await db
    .update(aiBotSites)
    .set({
      robotsCompliance,
      robotsCheckedAt,
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(aiBotSites.projectId, projectId));
}

async function touchLastHit(
  projectId: string,
  lastHitAt: string,
): Promise<void> {
  await db
    .update(aiBotSites)
    .set({ lastHitAt, updatedAt: sql`(current_timestamp)` })
    .where(eq(aiBotSites.projectId, projectId));
}

export type BotDailySummary = {
  bot: string;
  hits: number;
  uniqueUrls: number;
};

async function summarizeSince(
  projectId: string,
  sinceIso: string,
): Promise<BotDailySummary[]> {
  const rows = await db
    .select({
      bot: aiBotHits.bot,
      hits: sql<number>`count(*)`,
      uniqueUrls: sql<number>`count(distinct ${aiBotHits.url})`,
    })
    .from(aiBotHits)
    .where(
      and(eq(aiBotHits.projectId, projectId), gte(aiBotHits.hitAt, sinceIso)),
    )
    .groupBy(aiBotHits.bot);
  return rows.map((r) => ({
    bot: r.bot,
    hits: Number(r.hits),
    uniqueUrls: Number(r.uniqueUrls),
  }));
}

export type UrlHitSummary = {
  url: string;
  hits: number;
  lastSeenAt: string;
};

async function topUrlsSince(
  projectId: string,
  sinceIso: string,
  limit: number,
): Promise<UrlHitSummary[]> {
  const rows = await db
    .select({
      url: aiBotHits.url,
      hits: sql<number>`count(*)`,
      lastSeenAt: sql<string>`max(${aiBotHits.hitAt})`,
    })
    .from(aiBotHits)
    .where(
      and(eq(aiBotHits.projectId, projectId), gte(aiBotHits.hitAt, sinceIso)),
    )
    .groupBy(aiBotHits.url)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
  return rows.map((r) => ({
    url: r.url,
    hits: Number(r.hits),
    lastSeenAt: r.lastSeenAt,
  }));
}

export type DaySeriesPoint = { day: string; bot: string; hits: number };

async function dailySeriesSince(
  projectId: string,
  sinceDay: string,
): Promise<DaySeriesPoint[]> {
  const rows = await db
    .select({
      day: aiBotDailyStats.day,
      bot: aiBotDailyStats.bot,
      hits: aiBotDailyStats.hits,
    })
    .from(aiBotDailyStats)
    .where(
      and(
        eq(aiBotDailyStats.projectId, projectId),
        gte(aiBotDailyStats.day, sinceDay),
      ),
    )
    .orderBy(aiBotDailyStats.day);
  return rows;
}

async function urlsCrawledByBotsSince(
  projectId: string,
  botKeys: string[],
  sinceIso: string,
): Promise<Set<string>> {
  if (botKeys.length === 0) return new Set();
  const rows = await db
    .selectDistinct({ url: aiBotHits.url })
    .from(aiBotHits)
    .where(
      and(
        eq(aiBotHits.projectId, projectId),
        gte(aiBotHits.hitAt, sinceIso),
        inArray(aiBotHits.bot, botKeys),
      ),
    );
  return new Set(rows.map((r) => r.url));
}

export type RollupTarget = {
  projectId: string;
  organizationId: string;
  day: string;
};

/** Aggregate raw hits of `day` (UTC, "YYYY-MM-DD") into the daily rollup. */
async function rollupDay(target: RollupTarget): Promise<number> {
  const dayStart = `${target.day}T00:00:00.000Z`;
  const dayEnd = `${target.day}T23:59:59.999Z`;

  const rows = await db
    .select({
      bot: aiBotHits.bot,
      hits: sql<number>`count(*)`,
      uniqueUrls: sql<number>`count(distinct ${aiBotHits.url})`,
    })
    .from(aiBotHits)
    .where(
      and(
        eq(aiBotHits.projectId, target.projectId),
        gte(aiBotHits.hitAt, dayStart),
        lte(aiBotHits.hitAt, dayEnd),
      ),
    )
    .groupBy(aiBotHits.bot);

  if (rows.length === 0) return 0;

  for (const row of rows) {
    await db
      .insert(aiBotDailyStats)
      .values({
        id: crypto.randomUUID(),
        projectId: target.projectId,
        organizationId: target.organizationId,
        day: target.day,
        bot: row.bot,
        hits: Number(row.hits),
        uniqueUrls: Number(row.uniqueUrls),
      })
      .onConflictDoUpdate({
        target: [
          aiBotDailyStats.projectId,
          aiBotDailyStats.day,
          aiBotDailyStats.bot,
        ],
        set: {
          hits: Number(row.hits),
          uniqueUrls: Number(row.uniqueUrls),
          updatedAt: sql`(current_timestamp)`,
        },
      });
  }
  return rows.length;
}

/** Distinct projects that received hits on `day` — the rollup scheduler's work list. */
async function projectsWithHitsOnDay(day: string): Promise<RollupTarget[]> {
  const dayStart = `${day}T00:00:00.000Z`;
  const dayEnd = `${day}T23:59:59.999Z`;
  const rows = await db
    .selectDistinct({
      projectId: aiBotHits.projectId,
      organizationId: aiBotHits.organizationId,
    })
    .from(aiBotHits)
    .where(and(gte(aiBotHits.hitAt, dayStart), lte(aiBotHits.hitAt, dayEnd)));
  return rows.map((r) => ({ ...r, day }));
}

export const AiBotRepository = {
  getByProjectId,
  getByIngestToken,
  upsertSite,
  deleteSite,
  insertHits,
  updateRobotsCompliance,
  touchLastHit,
  summarizeSince,
  topUrlsSince,
  dailySeriesSince,
  urlsCrawledByBotsSince,
  rollupDay,
  projectsWithHitsOnDay,
};
