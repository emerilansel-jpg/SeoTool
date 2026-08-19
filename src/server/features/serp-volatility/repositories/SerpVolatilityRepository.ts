import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { serpVolatilitySnapshots } from "@/db/schema";

type VolatilitySnapshot = typeof serpVolatilitySnapshots.$inferSelect;

type UpsertData = {
  volatilityScore: number;
  keywordsSampled: number;
  avgPositionChange: number;
  topMoversJson: string | null;
};

/**
 * Get the most recent N volatility snapshots for a project, newest first.
 */
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

/**
 * Insert or update a volatility snapshot for a specific (project, date) pair.
 */
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

/**
 * Get volatility snapshots within a date range, inclusive, ordered by date.
 */
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

export const SerpVolatilityRepository = {
  getLatestForProject,
  upsertForProjectDate,
  getForProjectDateRange,
};
