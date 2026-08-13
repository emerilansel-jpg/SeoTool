import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { SerpSnapshotRepository } from "@/server/features/serp-snapshots/SerpSnapshotRepository";
import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";

const serpSnapshotInputSchema = z.object({
  projectId: z.string(),
  trackingKeywordId: z.string(),
  device: z.enum(["desktop", "mobile"]),
});

/** Get the latest SERP composition for a tracked keyword. Returns organic
 *  results sorted by rank — including competitors and which one is the tracked
 *  domain. */
export const getSerpSnapshot = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(serpSnapshotInputSchema)
  .handler(async ({ data: { trackingKeywordId, device } }) => {
    return SerpSnapshotRepository.getLatestForKeyword(
      trackingKeywordId,
      device,
    );
  });

const serpCompetitorsInputSchema = z.object({
  projectId: z.string(),
  configId: z.string(),
  device: z.enum(["desktop", "mobile"]),
});

/**
 * SERP competitor domains: which domains appear most often in the SERPs for
 * a rank-tracking config's tracked keywords. Aggregated from the latest
 * completed run's SERP snapshots, excluding the tracked domain itself.
 */
export const getSerpCompetitors = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(serpCompetitorsInputSchema)
  .handler(async ({ data: { configId, device } }) => {
    const latestRun =
      await RankTrackingRepository.getLatestRunForConfig(configId);
    if (!latestRun) return [];
    return SerpSnapshotRepository.getSerpCompetitorsForRun(
      latestRun.id,
      device,
    );
  });
