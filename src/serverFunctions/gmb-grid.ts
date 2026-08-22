import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { gmbGridConfigs, gmbGridRuns, gmbGridSnapshots } from "@/db/schema";
import {
  CreateGmbGridSchema,
  AutoScanGmbKeywordsSchema,
} from "@/server/features/gmb-grid/gmb-grid.schema";
import { generateGridNodes } from "@/server/utils/geo-grid";
import { GmbGridService } from "@/server/services/gmb-grid.service";
import { eq, desc, inArray, and } from "drizzle-orm";
import { assertQuotaAvailable } from "@/server/features/billing/services/QuotaService";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getGmbGridConfigs = createServerFn({ method: "GET" })
  .validator((projectId: string) => projectId)
  .handler(async ({ data: projectId }) => {
    const configs = await db
      .select()
      .from(gmbGridConfigs)
      .where(eq(gmbGridConfigs.projectId, projectId))
      .orderBy(desc(gmbGridConfigs.createdAt));

    // Attach the latest run id per config so the client can reopen past scans.
    let lastRunIds: Record<string, string> = {};
    if (configs.length > 0) {
      const runs = await db
        .select({
          id: gmbGridRuns.id,
          configId: gmbGridRuns.configId,
          startedAt: gmbGridRuns.startedAt,
        })
        .from(gmbGridRuns)
        .where(
          inArray(
            gmbGridRuns.configId,
            configs.map((c) => c.id),
          ),
        )
        .orderBy(desc(gmbGridRuns.startedAt));

      for (const run of runs) {
        if (!lastRunIds[run.configId]) lastRunIds[run.configId] = run.id;
      }
    }

    return configs.map((c) => ({ ...c, lastRunId: lastRunIds[c.id] ?? null }));
  });

export const getGmbGridSnapshots = createServerFn({ method: "GET" })
  .validator((runId: string) => runId)
  .handler(async ({ data: runId }) => {
    const [run] = await db
      .select()
      .from(gmbGridRuns)
      .where(eq(gmbGridRuns.id, runId));

    if (!run) {
      // The client can poll with its own run id before this row is inserted
      // by the in-flight create request; treat that as still starting.
      return { status: "running" as const, snapshots: [] };
    }

    const snapshots = await db
      .select()
      .from(gmbGridSnapshots)
      .where(eq(gmbGridSnapshots.runId, runId));

    return { status: run.status, snapshots };
  });

export const createGmbGridRun = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(CreateGmbGridSchema)
  .handler(async ({ data, context }) => {
    const nodesCount = data.gridSize * data.gridSize;

    await assertQuotaAvailable(
      context.organizationId,
      "rank_tracking",
      nodesCount,
    );

    // Reuse an identical config so repeat scans of the same setup group
    // together instead of piling up duplicate rows.
    const [existing] = await db
      .select({ id: gmbGridConfigs.id })
      .from(gmbGridConfigs)
      .where(
        and(
          eq(gmbGridConfigs.projectId, data.projectId),
          eq(gmbGridConfigs.businessName, data.businessName),
          eq(gmbGridConfigs.keyword, data.keyword),
          eq(gmbGridConfigs.gridSize, data.gridSize),
          eq(gmbGridConfigs.radiusMeters, data.radiusMeters),
        ),
      )
      .limit(1);

    const configId = existing?.id ?? crypto.randomUUID();
    if (!existing) {
      await db.insert(gmbGridConfigs).values({
        id: configId,
        projectId: data.projectId,
        businessName: data.businessName,
        keyword: data.keyword,
        centerLat: data.centerLat,
        centerLng: data.centerLng,
        gridSize: data.gridSize,
        radiusMeters: data.radiusMeters,
      });
    }

    // The client may supply the run id so it can poll grid progress while
    // this handler is still scanning.
    const runId = data.runId ?? crypto.randomUUID();
    await db.insert(gmbGridRuns).values({
      id: runId,
      configId,
      status: "running",
    });

    const nodes = generateGridNodes(
      data.centerLat,
      data.centerLng,
      data.gridSize,
      data.radiusMeters,
    );

    const snapshotsToInsert = nodes.map((node) => ({
      id: crypto.randomUUID(),
      runId,
      lat: node.lat,
      lng: node.lng,
      gridRow: node.gridRow,
      gridCol: node.gridCol,
      status: "pending" as const,
    }));

    await db.insert(gmbGridSnapshots).values(snapshotsToInsert);

    // Synchronous live scan. Results are written per node as they arrive so
    // the client's polling query shows incremental progress and partial
    // results survive a dropped connection.
    let completedCount = 0;
    let failedCount = 0;

    try {
      const gmbService = new GmbGridService(process.env);
      const dfNodes = snapshotsToInsert.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        id: s.id,
      }));

      const results = await gmbService.scanGridLive(
        data.keyword,
        data.businessName,
        dfNodes,
        data.radiusMeters,
      );

      for (const result of results) {
        if (result.ok) {
          completedCount++;
          await db
            .update(gmbGridSnapshots)
            .set({ rank: result.rank, status: "completed" })
            .where(eq(gmbGridSnapshots.id, result.nodeId));
        } else {
          failedCount++;
          await db
            .update(gmbGridSnapshots)
            .set({ status: "failed" })
            .where(eq(gmbGridSnapshots.id, result.nodeId));
        }
      }
    } catch (e) {
      console.error("DataForSEO GMB grid scan failed", e);
    }

    const status = completedCount > 0 ? "completed" : "failed";
    await db
      .update(gmbGridRuns)
      .set({ status, completedAt: new Date().toISOString() })
      .where(eq(gmbGridRuns.id, runId));

    return { runId, configId, status, failedCount };
  });

export const scanGmbKeywords = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(AutoScanGmbKeywordsSchema)
  .handler(async ({ data, context }) => {
    // Basic billing/quota check for scanning (can be mapped to rank tracking quota)
    await assertQuotaAvailable(context.organizationId, "rank_tracking", 10);

    const gmbService = new GmbGridService(process.env);

    // 1. Gather seed keywords
    const seeds = new Set<string>();

    // Generic fallback based on name tokens (assuming business name contains category)
    const nameTokens = data.businessName.split(" ").filter((t) => t.length > 3);
    for (const token of nameTokens) {
      seeds.add(`${token.toLowerCase()} near me`);
    }

    if (data.website) {
      const organicKeywords = await gmbService.getRankedKeywordsForDomain(
        data.website,
      );
      organicKeywords.forEach((kw: string) => seeds.add(kw));
    }

    const keywordList = Array.from(seeds).slice(0, 15); // Limit to 15 to save live cost

    // 2. Verify ranks in maps
    const verifiedRankings = await gmbService.verifyMapsRankings(
      keywordList,
      data.placeId,
      data.lat,
      data.lng,
    );

    return verifiedRankings; // Array of { keyword, rank }
  });
