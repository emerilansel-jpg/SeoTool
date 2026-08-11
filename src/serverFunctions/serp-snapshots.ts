import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { SerpSnapshotRepository } from "@/server/features/serp-snapshots/SerpSnapshotRepository";

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
