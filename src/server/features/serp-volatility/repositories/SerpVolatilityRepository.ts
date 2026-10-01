import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  rankCheckRuns,
  rankSnapshots,
  serpVolatilitySnapshots,
} from "@/db/schema";

type VolatilitySnapshot = typeof serpVolatilitySnapshots.$inferSelect;

type UpsertData = {
  volatilityScore: number;
  keywordsSampled: number;
  avgPositionChange: number;
  topMoversJson: string | null;
};

async function getLatestForProject(
  projectId: string,
  limit = 30,
): Promise<VolatilitySnapshot[]> {
  return db
    .select()
    .from(serpVolatilitySnapshots)
    .where(eq(serpVolatilitySnapshots.projectId, projectId))
    .orderBy(desc(serpVolatilitySnapshots.date))
    .limit(limit);
}

async function upsertForProjectDate(
  projectId: string,
  date: string,
  data: UpsertData,
): Promise<void> {
  const existing = await db
    .select({ id: serpVolatilitySnapshots.id })
    .from(serpVolatilitySnapshots)
    .where(
      and(
        eq(serpVolatilitySnapshots.projectId, projectId),
        eq(serpVolatilitySnapshots.date, date),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(serpVolatilitySnapshots)
      .set(data)
      .where(eq(serpVolatilitySnapshots.id, existing[0].id));
  } else {
    await db.insert(serpVolatilitySnapshots).values({
      id: crypto.randomUUID(),
      projectId,
      date,
      ...data,
    });
  }
}

async function getForProjectDateRange(
  projectId: string,
  dateFrom: string,
  dateTo: string,
): Promise<VolatilitySnapshot[]> {
  return db
    .select()
    .from(serpVolatilitySnapshots)
    .where(
      and(
        eq(serpVolatilitySnapshots.projectId, projectId),
        gte(serpVolatilitySnapshots.date, dateFrom),
        lte(serpVolatilitySnapshots.date, dateTo),
      ),
    )
    .orderBy(serpVolatilitySnapshots.date);
}

async function getCompletedFullRuns(projectId: string, since?: string) {
  return db
    .select({
      id: rankCheckRuns.id,
      configId: rankCheckRuns.configId,
      startedAt: rankCheckRuns.startedAt,
    })
    .from(rankCheckRuns)
    .where(
      and(
        eq(rankCheckRuns.projectId, projectId),
        eq(rankCheckRuns.status, "completed"),
        eq(rankCheckRuns.isSubsetRun, false),
        since ? gte(rankCheckRuns.startedAt, since) : undefined,
      ),
    )
    .orderBy(asc(rankCheckRuns.configId), desc(rankCheckRuns.startedAt));
}

async function getSnapshotsForRuns(runIds: string[]) {
  if (runIds.length === 0) return [];
  return db
    .select()
    .from(rankSnapshots)
    .where(inArray(rankSnapshots.runId, runIds));
}

export const SerpVolatilityRepository = {
  getLatestForProject,
  upsertForProjectDate,
  getForProjectDateRange,
  getCompletedFullRuns,
  getSnapshotsForRuns,
};
