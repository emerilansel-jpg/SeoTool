import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { serpSnapshots } from "@/db/schema";

export interface SerpSnapshotInsertRow {
  id: string;
  runId: string;
  trackingKeywordId: string;
  keyword: string;
  device: string;
  rank: number;
  url: string | null;
  title: string | null;
  description: string | null;
  domain: string | null;
  isTrackedDomain: boolean;
}

export const SerpSnapshotRepository = {
  async insertBatch(rows: SerpSnapshotInsertRow[]) {
    if (rows.length === 0) return;
    await db
      .insert(serpSnapshots)
      .values(rows)
      .onConflictDoNothing({
        target: [
          serpSnapshots.runId,
          serpSnapshots.trackingKeywordId,
          serpSnapshots.device,
          serpSnapshots.rank,
        ],
      });
  },

  async getLatestForKeyword(trackingKeywordId: string, device: string) {
    const rows = await db
      .select()
      .from(serpSnapshots)
      .where(
        and(
          eq(serpSnapshots.trackingKeywordId, trackingKeywordId),
          eq(serpSnapshots.device, device),
        ),
      )
      .orderBy(desc(serpSnapshots.checkedAt))
      .limit(100);

    // Group by checkedAt to get the latest run's full SERP
    if (rows.length === 0) return [];
    const latestCheckedAt = rows[0].checkedAt;
    return rows.filter((r) =>
      r.checkedAt instanceof Date
        ? r.checkedAt.getTime() === latestCheckedAt.getTime()
        : r.checkedAt === latestCheckedAt,
    );
  },

  async getForRun(runId: string, trackingKeywordId: string, device: string) {
    return db
      .select()
      .from(serpSnapshots)
      .where(
        and(
          eq(serpSnapshots.runId, runId),
          eq(serpSnapshots.trackingKeywordId, trackingKeywordId),
          eq(serpSnapshots.device, device),
        ),
      )
      .orderBy(serpSnapshots.rank);
  },

  /**
   * Aggregate SERP competitors for a run: which domains appear most often
   * across the tracked keywords' SERPs, excluding the tracked domain itself.
   */
  async getSerpCompetitorsForRun(
    runId: string,
    device: string,
    limit = 20,
  ): Promise<
    Array<{
      domain: string;
      appearances: number;
      keywordCount: number;
      avgRank: number;
    }>
  > {
    const rows = await db
      .select({
        domain: serpSnapshots.domain,
        appearances: sql<number>`cast(count(*) as int)`.as("appearances"),
        keywordCount:
          sql<number>`cast(count(distinct ${serpSnapshots.trackingKeywordId}) as int)`.as(
            "keywordCount",
          ),
        avgRank:
          sql<number>`cast(round(avg(${serpSnapshots.rank}), 1) as real)`.as(
            "avgRank",
          ),
      })
      .from(serpSnapshots)
      .where(
        and(
          eq(serpSnapshots.runId, runId),
          eq(serpSnapshots.device, device),
          eq(serpSnapshots.isTrackedDomain, false),
          isNotNull(serpSnapshots.domain),
        ),
      )
      .groupBy(serpSnapshots.domain)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return rows.map((r) => ({
      domain: r.domain ?? "",
      appearances: r.appearances ?? 0,
      keywordCount: r.keywordCount ?? 0,
      avgRank: r.avgRank ?? 0,
    }));
  },
};
