import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/db";
import { gmbGridConfigs, gmbGridRuns, gmbGridSnapshots } from "@/db/schema";
import { CreateGmbGridSchema } from "@/server/features/gmb-grid/gmb-grid.schema";
import { generateGridNodes } from "@/server/utils/geo-grid";
import { GmbGridService } from "@/server/services/gmb-grid.service";
import { eq, desc } from "drizzle-orm";
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
      
    return configs;
  });

export const getGmbGridSnapshots = createServerFn({ method: "GET" })
  .validator((runId: string) => runId)
  .handler(async ({ data: runId }) => {
    const snapshots = await db
      .select()
      .from(gmbGridSnapshots)
      .where(eq(gmbGridSnapshots.runId, runId));
      
    return snapshots;
  });

export const createGmbGridRun = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(CreateGmbGridSchema)
  .handler(async ({ data, context }) => {
    const nodesCount = data.gridSize * data.gridSize;
    
    await assertQuotaAvailable(context.organizationId, "rank_tracking", nodesCount);

    const configId = crypto.randomUUID();
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

    const runId = crypto.randomUUID();
    await db.insert(gmbGridRuns).values({
      id: runId,
      configId: configId,
      status: "running",
    });

    const nodes = generateGridNodes(data.centerLat, data.centerLng, data.gridSize, data.radiusMeters);
    
    const snapshotsToInsert = nodes.map(node => ({
      id: crypto.randomUUID(),
      runId,
      lat: node.lat,
      lng: node.lng,
      gridRow: node.gridRow,
      gridCol: node.gridCol,
      status: "pending" as const,
    }));
    
    await db.insert(gmbGridSnapshots).values(snapshotsToInsert);

    try {
      const gmbService = new GmbGridService(process.env);
      const dfNodes = snapshotsToInsert.map(s => ({ lat: s.lat, lng: s.lng, id: s.id }));
      
      const dfTasks = await gmbService.postGridTasks(data.keyword, dfNodes);
      
    } catch (e) {
      console.error("DataForSEO GMB Grid trigger failed", e);
      await db.update(gmbGridRuns).set({ status: "failed" }).where(eq(gmbGridRuns.id, runId));
    }

    return { runId, configId };
  });
