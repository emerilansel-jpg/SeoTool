import { and, asc, desc, eq, gte, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { gscRankHistory, gscTrackedKeywords } from "@/db/schema";

export type GscTrackedKeyword = typeof gscTrackedKeywords.$inferSelect;
export type GscRankHistoryRow = typeof gscRankHistory.$inferSelect;

export type SyncKeywordRow = {
  keyword: string;
  day: string;
  position: number | null;
  impressions: number;
  clicks: number;
  url: string | null;
};

export type SyncResult = {
  keywordsTouched: number;
  historyRows: number;
  syncedFromDay: string;
  syncedToDay: string;
};

/** Upsert one day-batch of (keyword, metrics) pairs and write history rows.
 *  Ignored keywords keep their status but still receive history. */
async function syncKeywordDays(
  projectId: string,
  organizationId: string,
  rows: SyncKeywordRow[],
): Promise<SyncResult> {
  if (rows.length === 0) {
    return {
      keywordsTouched: 0,
      historyRows: 0,
      syncedFromDay: "",
      syncedToDay: "",
    };
  }

  // Merge per (keyword, day): the GSC date+query query can repeat a query on
  // overlapping ranges; keep the higher-impression row per day.
  const byKeywordDay = new Map<string, SyncKeywordRow>();
  for (const row of rows) {
    const key = `${row.keyword}\n${row.day}`;
    const existing = byKeywordDay.get(key);
    if (!existing || row.impressions > existing.impressions) {
      byKeywordDay.set(key, row);
    }
  }

  const days = [
    ...new Set([...byKeywordDay.values()].map((r) => r.day)),
  ].toSorted();
  const syncedFromDay = days[0];
  const syncedToDay = days[days.length - 1];

  const keywords = [
    ...new Set([...byKeywordDay.values()].map((r) => r.keyword)),
  ];

  // Upsert keyword rows, then fetch ids for the history writes.
  const idRows = await db
    .insert(gscTrackedKeywords)
    .values(
      keywords.map((keyword) => ({
        id: crypto.randomUUID(),
        projectId,
        organizationId,
        keyword,
      })),
    )
    .onConflictDoUpdate({
      target: [gscTrackedKeywords.projectId, gscTrackedKeywords.keyword],
      set: { lastSyncedAt: sql`(current_timestamp)` },
    })
    .returning({
      id: gscTrackedKeywords.id,
      keyword: gscTrackedKeywords.keyword,
    });

  const idByKeyword = new Map(idRows.map((r) => [r.keyword, r.id]));
  const nowIso = new Date().toISOString();

  // Latest-day metrics onto the keyword row (denormalized list columns).
  for (const keyword of keywords) {
    const latest = [...byKeywordDay.values()]
      .filter((r) => r.keyword === keyword)
      .toSorted((a, b) => (a.day < b.day ? 1 : -1))[0];
    const keywordId = idByKeyword.get(keyword);
    if (!keywordId) continue;
    await db
      .update(gscTrackedKeywords)
      .set({
        lastPosition: latest.position,
        lastImpressions: latest.impressions,
        lastClicks: latest.clicks,
        lastUrl: latest.url,
        lastDay: latest.day,
        lastSyncedAt: nowIso,
      })
      .where(eq(gscTrackedKeywords.id, keywordId));
  }

  const historyValues = [...byKeywordDay.values()].map((row) => ({
    id: crypto.randomUUID(),
    projectId,
    keywordId: idByKeyword.get(row.keyword)!,
    day: row.day,
    position: row.position,
    impressions: row.impressions,
    clicks: row.clicks,
    url: row.url,
  }));

  // Chunk to stay within driver placeholder limits.
  const CHUNK = 200;
  let historyRows = 0;
  for (let i = 0; i < historyValues.length; i += CHUNK) {
    const chunk = historyValues.slice(i, i + CHUNK);
    await db
      .insert(gscRankHistory)
      .values(chunk)
      .onConflictDoUpdate({
        target: [gscRankHistory.keywordId, gscRankHistory.day],
        set: {
          position: sql`excluded.position`,
          impressions: sql`excluded.impressions`,
          clicks: sql`excluded.clicks`,
          url: sql`excluded.url`,
          updatedAt: sql`(current_timestamp)`,
        },
      });
    historyRows += chunk.length;
  }

  return {
    keywordsTouched: keywords.length,
    historyRows,
    syncedFromDay,
    syncedToDay,
  };
}

export type KeywordListOptions = {
  projectId: string;
  search?: string;
  limit: number;
  offset: number;
  sortBy: "position" | "impressions" | "keyword";
  sortDir: "asc" | "desc";
};

async function listKeywords(options: KeywordListOptions): Promise<{
  rows: GscTrackedKeyword[];
  total: number;
}> {
  const conditions = [eq(gscTrackedKeywords.projectId, options.projectId)];
  if (options.search) {
    conditions.push(like(gscTrackedKeywords.keyword, `%${options.search}%`));
  }
  const where = and(...conditions);

  // Portable NULL ordering: NULLs always last regardless of dialect sort order.
  const positionNullLast = sql`case when ${gscTrackedKeywords.lastPosition} is null then 1 else 0 end`;
  const orderBy = [
    options.sortBy === "position"
      ? options.sortDir === "asc"
        ? [asc(positionNullLast), asc(gscTrackedKeywords.lastPosition)]
        : [desc(gscTrackedKeywords.lastPosition), desc(positionNullLast)]
      : options.sortBy === "impressions"
        ? options.sortDir === "asc"
          ? asc(gscTrackedKeywords.lastImpressions)
          : desc(gscTrackedKeywords.lastImpressions)
        : options.sortDir === "asc"
          ? asc(gscTrackedKeywords.keyword)
          : desc(gscTrackedKeywords.keyword),
  ].flat();

  const rows = await db
    .select()
    .from(gscTrackedKeywords)
    .where(where)
    .orderBy(...orderBy)
    .limit(options.limit)
    .offset(options.offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gscTrackedKeywords)
    .where(where);

  return { rows, total: Number(count) };
}

const nullsLast = (a: number | null, b: number | null) =>
  (a === null ? 1 : 0) - (b === null ? 1 : 0);

const average = (values: number[]) =>
  values.length === 0
    ? undefined
    : values.reduce((sum, value) => sum + value, 0) / values.length;

/** Client-side fallback sort used by tests and small result sets. */
export function sortKeywordsClientSafe(
  rows: GscTrackedKeyword[],
  sortBy: KeywordListOptions["sortBy"],
  sortDir: "asc" | "desc",
): GscTrackedKeyword[] {
  const sorted = rows.toSorted((a, b) => {
    if (sortBy === "keyword") {
      return a.keyword.localeCompare(b.keyword);
    }
    if (sortBy === "impressions") {
      return b.lastImpressions - a.lastImpressions;
    }
    return (
      nullsLast(a.lastPosition, b.lastPosition) ||
      (a.lastPosition ?? 0) - (b.lastPosition ?? 0)
    );
  });
  return sortDir === "desc" ? sorted.toReversed() : sorted;
}

async function getKeywordWithHistory(input: {
  projectId: string;
  keyword: string;
  days: number;
}): Promise<{
  keyword: GscTrackedKeyword;
  history: GscRankHistoryRow[];
} | null> {
  const keywordRows = await db
    .select()
    .from(gscTrackedKeywords)
    .where(
      and(
        eq(gscTrackedKeywords.projectId, input.projectId),
        eq(gscTrackedKeywords.keyword, input.keyword),
      ),
    )
    .limit(1);
  const keyword = keywordRows[0];
  if (!keyword) return null;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - input.days);
  const sinceDay = since.toISOString().slice(0, 10);

  const history = await db
    .select()
    .from(gscRankHistory)
    .where(
      and(
        eq(gscRankHistory.keywordId, keyword.id),
        gte(gscRankHistory.day, sinceDay),
      ),
    )
    .orderBy(asc(gscRankHistory.day));

  return { keyword, history };
}

/** Max synced day across the project — the incremental sync cursor. */
async function getLastSyncedDay(projectId: string): Promise<string | null> {
  const [row] = await db
    .select({ day: sql<string | null>`max(${gscRankHistory.day})` })
    .from(gscRankHistory)
    .where(eq(gscRankHistory.projectId, projectId));
  return row?.day ?? null;
}

async function setKeywordStatus(
  projectId: string,
  keyword: string,
  status: "active" | "ignored",
): Promise<void> {
  await db
    .update(gscTrackedKeywords)
    .set({ status })
    .where(
      and(
        eq(gscTrackedKeywords.projectId, projectId),
        eq(gscTrackedKeywords.keyword, keyword),
      ),
    );
}

/** 7-day deltas for the summary cards: position/impressions now vs previous week. */
async function summarize(projectId: string): Promise<{
  trackedCount: number;
  avgPosition: number | null;
  improved: number;
  declined: number;
  totalImpressions: number;
  totalClicks: number;
}> {
  const [counts] = await db
    .select({
      trackedCount: sql<number>`count(*)`,
      avgPosition: sql<number | null>`avg(${gscTrackedKeywords.lastPosition})`,
      totalImpressions: sql<number>`coalesce(sum(${gscTrackedKeywords.lastImpressions}), 0)`,
      totalClicks: sql<number>`coalesce(sum(${gscTrackedKeywords.lastClicks}), 0)`,
    })
    .from(gscTrackedKeywords)
    .where(
      and(
        eq(gscTrackedKeywords.projectId, projectId),
        eq(gscTrackedKeywords.status, "active"),
      ),
    );

  const today = new Date();
  const dayAt = (offsetDays: number) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - offsetDays);
    return d.toISOString().slice(0, 10);
  };
  const windowAStart = dayAt(13);
  const windowAEnd = dayAt(7);
  const windowBEnd = dayAt(0);

  // Aggregate the two 7-day windows in JS: a SQL case-expression that appears
  // in both SELECT and GROUP BY binds the window date twice, which Postgres
  // treats as distinct expressions ("column must appear in GROUP BY").
  const historyRows = await db
    .select({
      keywordId: gscRankHistory.keywordId,
      day: gscRankHistory.day,
      position: gscRankHistory.position,
    })
    .from(gscRankHistory)
    .where(
      and(
        eq(gscRankHistory.projectId, projectId),
        gte(gscRankHistory.day, windowAStart),
        sql`${gscRankHistory.day} <= ${windowBEnd}`,
      ),
    );

  const buckets = new Map<string, { a: number[]; b: number[] }>();
  for (const row of historyRows) {
    if (row.position === null) continue;
    const entry = buckets.get(row.keywordId) ?? { a: [], b: [] };
    if (row.day <= windowAEnd) entry.a.push(row.position);
    else entry.b.push(row.position);
    buckets.set(row.keywordId, entry);
  }

  const perKeyword = new Map<string, { a?: number; b?: number }>();
  for (const [keywordId, { a, b }] of buckets) {
    perKeyword.set(keywordId, { a: average(a), b: average(b) });
  }

  let improved = 0;
  let declined = 0;
  for (const { a, b } of perKeyword.values()) {
    if (a === undefined || b === undefined) continue;
    if (b < a - 0.5) improved += 1;
    else if (b > a + 0.5) declined += 1;
  }

  return {
    trackedCount: Number(counts.trackedCount),
    avgPosition:
      counts.avgPosition === null ? null : Number(counts.avgPosition),
    improved,
    declined,
    totalImpressions: Number(counts.totalImpressions),
    totalClicks: Number(counts.totalClicks),
  };
}

export const GscRankTrackerRepository = {
  syncKeywordDays,
  listKeywords,
  sortKeywordsClientSafe,
  getKeywordWithHistory,
  getLastSyncedDay,
  setKeywordStatus,
  summarize,
};
