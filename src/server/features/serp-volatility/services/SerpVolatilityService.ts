import { AppError } from "@/server/lib/errors";
import { SerpVolatilityRepository } from "../repositories/SerpVolatilityRepository";
import {
  calculateVolatilityScore,
  categorizeVolatility,
  getPositionChange,
  identifyTopMovers,
  type KeywordPositionChange,
} from "./volatilityCalculation";

const DAY_MS = 24 * 60 * 60 * 1000;
const BACKFILL_DAYS = 30;

export type TopMover = {
  keyword: string;
  change: number;
  currentPosition?: number;
  previousPosition?: number;
  status?: "new" | "dropped" | "improved" | "declined" | "unchanged";
};

type CompletedRun = Awaited<
  ReturnType<typeof SerpVolatilityRepository.getCompletedFullRuns>
>[number];
type RankSnapshot = Awaited<
  ReturnType<typeof SerpVolatilityRepository.getSnapshotsForRuns>
>[number];
type RunPair = { latest: CompletedRun; previous: CompletedRun };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseTopMovers(json: string | null): TopMover[] {
  if (!json) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const movers: TopMover[] = [];
  for (const entry of parsed) {
    if (!isRecord(entry)) continue;
    if (typeof entry.keyword !== "string" || typeof entry.change !== "number") {
      continue;
    }
    movers.push({
      keyword: entry.keyword,
      change: entry.change,
      currentPosition:
        typeof entry.currentPosition === "number"
          ? entry.currentPosition
          : undefined,
      previousPosition:
        typeof entry.previousPosition === "number"
          ? entry.previousPosition
          : undefined,
      status:
        entry.status === "new" ||
        entry.status === "dropped" ||
        entry.status === "improved" ||
        entry.status === "declined" ||
        entry.status === "unchanged"
          ? entry.status
          : undefined,
    });
  }
  return movers;
}

/** Grouping after an unbounded project query prevents busy configs starving others. */
export function selectLatestTwoRunsPerConfig(runs: CompletedRun[]): RunPair[] {
  const grouped = new Map<string, CompletedRun[]>();
  for (const run of runs) {
    const configRuns = grouped.get(run.configId) ?? [];
    if (configRuns.length < 2) configRuns.push(run);
    grouped.set(run.configId, configRuns);
  }

  const pairs: RunPair[] = [];
  for (const configRuns of grouped.values()) {
    const latest = configRuns[0];
    const previous = configRuns[1];
    if (latest && previous) pairs.push({ latest, previous });
  }
  return pairs;
}

function snapshotKey(snapshot: RankSnapshot): string {
  return `${snapshot.trackingKeywordId}:${snapshot.device}`;
}

/** Compare the union so disappeared keywords remain part of the sample. */
export function buildKeywordChanges(
  latestSnapshots: RankSnapshot[],
  previousSnapshots: RankSnapshot[],
  unrankedPosition: number,
): KeywordPositionChange[] {
  const latest = new Map(latestSnapshots.map((row) => [snapshotKey(row), row]));
  const previous = new Map(
    previousSnapshots.map((row) => [snapshotKey(row), row]),
  );
  const keys = new Set([...latest.keys(), ...previous.keys()]);

  return [...keys].map((key) => {
    const current = latest.get(key);
    const prior = previous.get(key);
    return {
      keyword: current?.keyword ?? prior?.keyword ?? "Unknown keyword",
      currentPosition: current?.position ?? null,
      previousPosition: prior?.position ?? null,
      unrankedPosition,
    };
  });
}

function groupSnapshotsByRun(snapshots: RankSnapshot[]) {
  const grouped = new Map<string, RankSnapshot[]>();
  for (const snapshot of snapshots) {
    const rows = grouped.get(snapshot.runId) ?? [];
    rows.push(snapshot);
    grouped.set(snapshot.runId, rows);
  }
  return grouped;
}

function buildSnapshotData(
  pairs: RunPair[],
  snapshotsByRun: Map<string, RankSnapshot[]>,
) {
  const changes = pairs.flatMap(({ latest, previous }) => {
    const latestSnapshots = snapshotsByRun.get(latest.id) ?? [];
    const previousSnapshots = snapshotsByRun.get(previous.id) ?? [];
    const maxObservedPosition = Math.max(
      0,
      ...latestSnapshots.map((row) => row.position ?? 0),
      ...previousSnapshots.map((row) => row.position ?? 0),
    );
    return buildKeywordChanges(
      latestSnapshots,
      previousSnapshots,
      maxObservedPosition + 1,
    );
  });

  if (changes.length === 0) return null;
  const absoluteMovement = changes.reduce(
    (sum, change) => sum + Math.abs(getPositionChange(change)),
    0,
  );
  const topMovers = identifyTopMovers(changes);

  return {
    volatilityScore: calculateVolatilityScore(changes),
    keywordsSampled: changes.length,
    avgPositionChange:
      Math.round((absoluteMovement / changes.length) * 100) / 100,
    topMoversJson: JSON.stringify(topMovers),
    topMovers,
  };
}

async function persistComparison(
  projectId: string,
  date: string,
  pairs: RunPair[],
) {
  const runIds = pairs.flatMap(({ latest, previous }) => [
    latest.id,
    previous.id,
  ]);
  const snapshots = await SerpVolatilityRepository.getSnapshotsForRuns(runIds);
  const snapshotData = buildSnapshotData(pairs, groupSnapshotsByRun(snapshots));
  if (!snapshotData) return null;

  const { topMovers, ...persisted } = snapshotData;
  await SerpVolatilityRepository.upsertForProjectDate(
    projectId,
    date,
    persisted,
  );
  return {
    date,
    ...persisted,
    category: categorizeVolatility(persisted.volatilityScore),
    topMovers,
  };
}

async function computeVolatility(projectId: string) {
  const runs = await SerpVolatilityRepository.getCompletedFullRuns(projectId);
  const pairs = selectLatestTwoRunsPerConfig(runs);
  if (pairs.length === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Not enough rank tracking history. Volatility requires two completed full rank checks for at least one tracked domain.",
    );
  }

  const date = pairs
    .map(({ latest }) => latest.startedAt.slice(0, 10))
    .toSorted()
    .at(-1)!;
  const result = await persistComparison(projectId, date, pairs);
  if (!result) {
    throw new AppError(
      "VALIDATION_ERROR",
      "No keyword position data found in recent rank checks.",
    );
  }
  return result;
}

/** Backfill missing dates from stored rank runs only. No external API calls. */
async function backfillMissingSnapshots(projectId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const sinceDate = new Date(Date.now() - (BACKFILL_DAYS - 1) * DAY_MS)
    .toISOString()
    .slice(0, 10);
  const querySince = new Date(
    Date.now() - BACKFILL_DAYS * DAY_MS,
  ).toISOString();
  const [runs, existing] = await Promise.all([
    SerpVolatilityRepository.getCompletedFullRuns(projectId, querySince),
    SerpVolatilityRepository.getForProjectDateRange(
      projectId,
      sinceDate,
      today,
    ),
  ]);
  if (runs.length < 2) return 0;

  const existingDates = new Set(existing.map((row) => row.date));
  const runsByConfig = new Map<string, CompletedRun[]>();
  for (const run of runs.toReversed()) {
    const configRuns = runsByConfig.get(run.configId) ?? [];
    configRuns.push(run);
    runsByConfig.set(run.configId, configRuns);
  }

  const pairsByDate = new Map<string, RunPair[]>();
  for (const configRuns of runsByConfig.values()) {
    for (let index = 1; index < configRuns.length; index += 1) {
      const latest = configRuns[index];
      const previous = configRuns[index - 1];
      if (!latest || !previous) continue;
      const date = latest.startedAt.slice(0, 10);
      if (date < sinceDate || date > today || existingDates.has(date)) continue;
      const pairs = pairsByDate.get(date) ?? [];
      pairs.push({ latest, previous });
      pairsByDate.set(date, pairs);
    }
  }

  let created = 0;
  for (const [date, pairs] of pairsByDate) {
    if (await persistComparison(projectId, date, pairs)) created += 1;
  }
  return created;
}

async function backfillBestEffort(projectId: string): Promise<void> {
  try {
    await backfillMissingSnapshots(projectId);
  } catch (error) {
    console.warn(
      `[serp-volatility] Backfill failed for project ${projectId}`,
      error,
    );
  }
}

async function getVolatilityTrend(projectId: string, days = 30) {
  const since = new Date(Date.now() - (days - 1) * DAY_MS)
    .toISOString()
    .slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const snapshots = await SerpVolatilityRepository.getForProjectDateRange(
    projectId,
    since,
    today,
  );

  return snapshots.map((snapshot) => ({
    ...snapshot,
    category: categorizeVolatility(snapshot.volatilityScore),
    topMovers: parseTopMovers(snapshot.topMoversJson),
  }));
}

async function getLatestVolatility(projectId: string) {
  const row = (
    await SerpVolatilityRepository.getLatestForProject(projectId, 1)
  )[0];
  return row
    ? {
        ...row,
        category: categorizeVolatility(row.volatilityScore),
        topMovers: parseTopMovers(row.topMoversJson),
      }
    : null;
}

async function checkEligibility(projectId: string): Promise<boolean> {
  const runs = await SerpVolatilityRepository.getCompletedFullRuns(projectId);
  return selectLatestTwoRunsPerConfig(runs).length > 0;
}

export const SerpVolatilityService = {
  computeVolatility,
  backfillMissingSnapshots,
  backfillBestEffort,
  getVolatilityTrend,
  getLatestVolatility,
  checkEligibility,
};
