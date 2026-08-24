import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "@/db";
import { executeInBatches } from "@/db/runBatch";
import {
  gmbGridConfigs,
  gmbGridRuns,
  gmbGridSnapshots,
  projects,
} from "@/db/schema";

type ConfigInsert = InferInsertModel<typeof gmbGridConfigs>;
type RunInsert = InferInsertModel<typeof gmbGridRuns>;
type SnapshotInsert = InferInsertModel<typeof gmbGridSnapshots>;

async function listConfigsForProject(projectId: string) {
  const configs = await db
    .select()
    .from(gmbGridConfigs)
    .where(
      and(
        eq(gmbGridConfigs.projectId, projectId),
        eq(gmbGridConfigs.isActive, true),
      ),
    )
    .orderBy(desc(gmbGridConfigs.createdAt));

  if (configs.length === 0) return [];
  const runs = await db
    .select()
    .from(gmbGridRuns)
    .where(
      inArray(
        gmbGridRuns.configId,
        configs.map((config) => config.id),
      ),
    )
    .orderBy(desc(gmbGridRuns.startedAt));
  const latestByConfig = new Map<string, (typeof runs)[number]>();
  for (const run of runs) {
    if (!latestByConfig.has(run.configId))
      latestByConfig.set(run.configId, run);
  }

  return configs.map((config) => ({
    ...config,
    latestRun: latestByConfig.get(config.id) ?? null,
  }));
}

async function getConfigById(configId: string, projectId?: string) {
  const rows = await db
    .select()
    .from(gmbGridConfigs)
    .where(
      projectId
        ? and(
            eq(gmbGridConfigs.id, configId),
            eq(gmbGridConfigs.projectId, projectId),
          )
        : eq(gmbGridConfigs.id, configId),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function findMatchingConfig(input: {
  projectId: string;
  placeId: string;
  keyword: string;
  gridSize: number;
  radiusMeters: number;
  languageCode: string;
  device: "desktop" | "mobile";
  mapZoom: number;
}) {
  const rows = await db
    .select()
    .from(gmbGridConfigs)
    .where(
      and(
        eq(gmbGridConfigs.projectId, input.projectId),
        eq(gmbGridConfigs.placeId, input.placeId),
        eq(gmbGridConfigs.keyword, input.keyword),
        eq(gmbGridConfigs.gridSize, input.gridSize),
        eq(gmbGridConfigs.radiusMeters, input.radiusMeters),
        eq(gmbGridConfigs.languageCode, input.languageCode),
        eq(gmbGridConfigs.device, input.device),
        eq(gmbGridConfigs.mapZoom, input.mapZoom),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function createConfig(data: ConfigInsert) {
  await db.insert(gmbGridConfigs).values(data);
}

async function updateConfig(
  configId: string,
  data: Partial<ConfigInsert>,
  projectId?: string,
) {
  await db
    .update(gmbGridConfigs)
    .set(data)
    .where(
      projectId
        ? and(
            eq(gmbGridConfigs.id, configId),
            eq(gmbGridConfigs.projectId, projectId),
          )
        : eq(gmbGridConfigs.id, configId),
    );
}

async function tryCreateRun(data: RunInsert): Promise<boolean> {
  const inserted = await db
    .insert(gmbGridRuns)
    .values(data)
    .onConflictDoNothing()
    .returning({ id: gmbGridRuns.id });
  return inserted.length > 0;
}

async function updateRun(runId: string, data: Partial<RunInsert>) {
  await db.update(gmbGridRuns).set(data).where(eq(gmbGridRuns.id, runId));
}

async function getRunById(runId: string) {
  const rows = await db
    .select()
    .from(gmbGridRuns)
    .where(eq(gmbGridRuns.id, runId))
    .limit(1);
  return rows[0] ?? null;
}

async function getRunForProject(runId: string, projectId: string) {
  const rows = await db
    .select({ run: gmbGridRuns, config: gmbGridConfigs })
    .from(gmbGridRuns)
    .innerJoin(gmbGridConfigs, eq(gmbGridRuns.configId, gmbGridConfigs.id))
    .where(
      and(eq(gmbGridRuns.id, runId), eq(gmbGridConfigs.projectId, projectId)),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function getActiveRunForConfig(configId: string) {
  const rows = await db
    .select()
    .from(gmbGridRuns)
    .where(
      and(
        eq(gmbGridRuns.configId, configId),
        inArray(gmbGridRuns.status, ["pending", "running"]),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function insertSnapshots(rows: SnapshotInsert[]) {
  await executeInBatches(rows, (tx, row) =>
    tx.insert(gmbGridSnapshots).values(row),
  );
}

async function getSnapshotsForRun(runId: string) {
  return db
    .select()
    .from(gmbGridSnapshots)
    .where(eq(gmbGridSnapshots.runId, runId))
    .orderBy(gmbGridSnapshots.gridRow, gmbGridSnapshots.gridCol);
}

async function updateSnapshot(
  snapshotId: string,
  data: Partial<SnapshotInsert>,
) {
  await db
    .update(gmbGridSnapshots)
    .set(data)
    .where(eq(gmbGridSnapshots.id, snapshotId));
}

async function updateSnapshots(
  updates: Array<{ id: string; data: Partial<SnapshotInsert> }>,
) {
  await executeInBatches(updates, (tx, update) =>
    tx
      .update(gmbGridSnapshots)
      .set(update.data)
      .where(eq(gmbGridSnapshots.id, update.id)),
  );
}

async function getProjectMarket(projectId: string) {
  const rows = await db
    .select({
      locationCode: projects.locationCode,
      languageCode: projects.languageCode,
    })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.archivedAt)))
    .limit(1);
  return rows[0] ?? null;
}

async function getDueConfigsWithOrganization(nowIso: string) {
  return db
    .select({
      config: gmbGridConfigs,
      organizationId: projects.organizationId,
    })
    .from(gmbGridConfigs)
    .innerJoin(projects, eq(gmbGridConfigs.projectId, projects.id))
    .where(
      and(
        eq(gmbGridConfigs.isActive, true),
        lte(gmbGridConfigs.nextCheckAt, nowIso),
        isNull(projects.archivedAt),
      ),
    )
    .limit(50);
}

export const GmbGridRepository = {
  listConfigsForProject,
  getConfigById,
  findMatchingConfig,
  createConfig,
  updateConfig,
  tryCreateRun,
  updateRun,
  getRunById,
  getRunForProject,
  getActiveRunForConfig,
  insertSnapshots,
  getSnapshotsForRun,
  updateSnapshot,
  updateSnapshots,
  getProjectMarket,
  getDueConfigsWithOrganization,
};
