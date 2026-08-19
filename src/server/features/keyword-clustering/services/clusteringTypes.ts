import { z } from "zod";

export const clusterSchema = z.object({
  label: z.string(),
  keywords: z.array(z.string()),
  avgSimilarity: z.number(),
});

export const clusteringResultSchema = z.object({
  clusters: z.array(clusterSchema),
  unclustered: z.array(z.string()),
  totalKeywords: z.number(),
  threshold: z.number(),
  fetchedAt: z.string(),
});

export type ClusterData = z.infer<typeof clusterSchema>;
export type ClusteringViewData = z.infer<typeof clusteringResultSchema>;
