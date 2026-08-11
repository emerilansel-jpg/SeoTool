import { and, desc, eq } from "drizzle-orm";
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
};
