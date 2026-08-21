import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { rankCheckRuns, rankSnapshots, rankTrackingConfigs } from "@/db/schema";
import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";
import { SerpVolatilityRepository } from "../repositories/SerpVolatilityRepository";
import {
  calculateVolatilityScore,
  categorizeVolatility,
  identifyTopMovers,
} from "./volatilityCalculation";
import { AppError } from "@/server/lib/errors";

/**
 * Compute a daily SERP volatility snapshot for a project by comparing the
 * two most recent completed rank-check runs and measuring position shifts.
 *
 * Requires at least one completed rank check run for the project. If no data
 * is found, returns null without persisting anything.
 */
async function computeVolatility(projectId: string) {
  // Find all active configs for this project.
  const configs = await RankTrackingRepository.getConfigsForProject(projectId);
  if (configs.length === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "No active rank tracking configurations found for this project.",
    );
  }

  const configIds = configs.map((c) => c.id);

  // Get the two most recent completed runs across all configs in this project.
  // We order by startedAt descending and take enough to cover one per config.
  const recentRuns = await db
    .select({
      id: rankCheckRuns.id,
      configId: rankCheckRuns.configId,
      startedAt: rankCheckRuns.startedAt,
    })
    .from(rankCheckRuns)
    .where(
      and(
        sql`${rankCheckRuns.configId} IN (${sql.join(
          configIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
        eq(rankCheckRuns.status, "completed"),
        eq(rankCheckRuns.isSubsetRun, false),
      ),
    )
    .orderBy(desc(rankCheckRuns.startedAt))
    .limit(configIds.length * 2);

  if (recentRuns.length < 2) return null;

  // Group runs by config, picking the latest and second-latest per config.
  const runsByConfig = new Map<
    string,
    { latest: string; previous: string; date: string }
  >();
  const seen = new Map<string, typeof recentRuns>();
  for (const run of recentRuns) {
    const arr = seen.get(run.configId) ?? [];
    arr.push(run);
    seen.set(run.configId, arr);
  }

  for (const [configId, runs] of seen) {
    if (runs.length < 2) continue;
    runsByConfig.set(configId, {
      latest: runs[0].id,
      previous: runs[1].id,
      date: runs[0].startedAt.slice(0, 10), // YYYY-MM-DD
    });
  }

  if (runsByConfig.size === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Not enough rank tracking history. Volatility calculation requires at least two completed rank checks.",
    );
  }

  // Collect position changes across all configs.
  const positionChanges: number[] = [];
  const keywordChanges: {
    keyword: string;
    currentPosition: number | null;
    previousPosition: number | null;
  }[] = [];

  for (const [configId, { latest, previous }] of runsByConfig) {
    const latestSnapshots =
      await RankTrackingRepository.getSnapshotsForRun(latest);
    const previousSnapshots =
      await RankTrackingRepository.getSnapshotsForRun(previous);

    const prevMap = new Map(
      previousSnapshots.map((s) => [
        `${s.trackingKeywordId}:${s.device}`,
        s.position,
      ]),
    );

    for (const snap of latestSnapshots) {
      const key = `${snap.trackingKeywordId}:${snap.device}`;
      const prevPos = prevMap.get(key) ?? null;
      const currPos = snap.position;

      if (currPos != null && prevPos != null) {
        positionChanges.push(currPos - prevPos);
      } else if (currPos != null || prevPos != null) {
        // One appeared / disappeared — treat as max volatility
        positionChanges.push(currPos != null ? currPos : -(prevPos ?? 0));
      }

      keywordChanges.push({
        keyword: snap.keyword,
        currentPosition: currPos,
        previousPosition: prevPos,
      });
    }
  }

  if (positionChanges.length === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "No keyword position data found in recent rank checks.",
    );
  }

  const volatilityScore = calculateVolatilityScore(positionChanges);
  const avgPositionChange =
    positionChanges.reduce((sum, v) => sum + Math.abs(v), 0) /
    positionChanges.length;
  const topMovers = identifyTopMovers(keywordChanges);

  // Use the most recent date across all configs.
  const dates = [...runsByConfig.values()].map((r) => r.date).sort();
  const date = dates[dates.length - 1];

  const snapshotData = {
    volatilityScore,
    keywordsSampled: positionChanges.length,
    avgPositionChange: Math.round(avgPositionChange * 100) / 100,
    topMoversJson: JSON.stringify(topMovers),
  };

  await SerpVolatilityRepository.upsertForProjectDate(
    projectId,
    date,
    snapshotData,
  );

  return {
    date,
    ...snapshotData,
    category: categorizeVolatility(volatilityScore),
    topMovers,
  };
}

/**
 * Get volatility trend for a project, defaulting to the last 30 days.
 */
async function getVolatilityTrend(projectId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const snapshots = await SerpVolatilityRepository.getForProjectDateRange(
    projectId,
    since,
    today,
  );

  return snapshots.map((s) => ({
    ...s,
    category: categorizeVolatility(s.volatilityScore),
    topMovers: s.topMoversJson ? JSON.parse(s.topMoversJson) : [],
  }));
}

/**
 * Get the single latest volatility snapshot for a project.
 */
async function getLatestVolatility(projectId: string) {
  const rows = await SerpVolatilityRepository.getLatestForProject(projectId, 1);
  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    category: categorizeVolatility(row.volatilityScore),
    topMovers: row.topMoversJson ? JSON.parse(row.topMoversJson) : [],
  };
}

export const SerpVolatilityService = {
  computeVolatility,
  getVolatilityTrend,
  getLatestVolatility,
};
