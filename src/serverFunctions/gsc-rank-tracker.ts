import { createServerFn } from "@tanstack/react-start";
import { GscRankTrackerService } from "@/server/features/gsc-rank-tracker/services/GscRankTrackerService";
import {
  gscBackfillChunkInputSchema,
  gscExplainMoveInputSchema,
  gscKeywordHistoryInputSchema,
  gscKeywordStatusInputSchema,
  gscRankTrackerKeywordsInputSchema,
  gscRankTrackerStatusInputSchema,
  gscSyncNowInputSchema,
} from "@/types/schemas/gsc-rank-tracker";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const getGscRankTrackerStatus = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gscRankTrackerStatusInputSchema)
  .handler(async ({ context }) => {
    const [summary, grant] = await Promise.all([
      GscRankTrackerService.summarize(context.projectId),
      GscRankTrackerService.verifyGrant(context.projectId),
    ]);
    return { summary, grant };
  });

export const getGscRankTrackerKeywords = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gscRankTrackerKeywordsInputSchema)
  .handler(async ({ data, context }) => {
    return GscRankTrackerService.listKeywords({
      projectId: context.projectId,
      search: data.search || undefined,
      limit: data.pageSize,
      offset: (data.page - 1) * data.pageSize,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
    });
  });

export const getGscKeywordHistory = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gscKeywordHistoryInputSchema)
  .handler(async ({ data, context }) => {
    return GscRankTrackerService.getKeywordWithHistory({
      projectId: context.projectId,
      keyword: data.keyword,
      days: data.days,
    });
  });

export const syncGscRankTracker = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gscSyncNowInputSchema)
  .handler(async ({ context }) => {
    return GscRankTrackerService.syncProject(context.projectId);
  });

export const backfillGscRankTracker = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gscBackfillChunkInputSchema)
  .handler(async ({ data, context }) => {
    return GscRankTrackerService.backfillChunk({
      projectId: context.projectId,
      fromDate: data.fromDate,
      toDate: data.toDate,
    });
  });

export const explainGscKeywordMove = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gscExplainMoveInputSchema)
  .handler(async ({ data, context }) => {
    return GscRankTrackerService.explainMove({
      projectId: context.projectId,
      keyword: data.keyword,
      endDate: data.endDate,
    });
  });

export const setGscKeywordStatus = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(gscKeywordStatusInputSchema)
  .handler(async ({ data, context }) => {
    await GscRankTrackerService.setKeywordStatus(
      context.projectId,
      data.keyword,
      data.status,
    );
    return { ok: true };
  });
