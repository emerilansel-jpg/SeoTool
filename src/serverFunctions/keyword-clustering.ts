import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { getKeywordClusters } from "@/server/features/keyword-clustering/services/KeywordClusteringService";

const clusterInputSchema = z.object({
  projectId: z.string().min(1),
  keywords: z.array(z.string().min(1)).min(2).max(20),
  locationCode: z.number().int().positive().optional().default(2840),
  languageCode: z.string().max(10).optional().default("en"),
  threshold: z.number().min(0).max(1).optional().default(0.3),
});

export const getKeywordClustersFn = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(clusterInputSchema)
  .handler(async ({ data, context }) => {
    return getKeywordClusters(
      data.keywords,
      data.locationCode,
      data.languageCode,
      context,
      data.threshold,
    );
  });
