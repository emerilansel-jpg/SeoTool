import { z } from "zod";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { getKeywordClusters } from "@/server/features/keyword-clustering/services/KeywordClusteringService";
import { AppError } from "@/server/lib/errors";

const inputSchema = {
  projectId: projectIdSchema,
  keywords: z
    .array(z.string().min(1))
    .min(2)
    .max(20)
    .describe("List of 2-20 keywords to cluster by SERP similarity"),
  locationCode: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("DataForSEO location code (default: 2840 = US)"),
  languageCode: z.string().optional().describe("Language code (default: 'en')"),
  threshold: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Similarity threshold 0-1 (default: 0.3)"),
} as const;

type Args = z.infer<z.ZodObject<typeof inputSchema>>;

type ClusterRow = {
  label: string;
  keywords: number;
  similarity: string;
};

const COLUMNS: McpTableColumn<ClusterRow>[] = [
  { header: "Cluster", value: (row) => row.label },
  { header: "Keywords", value: (row) => row.keywords },
  { header: "Similarity", value: (row) => row.similarity },
];

export const clusterKeywordsTool = {
  name: "cluster_keywords",
  config: {
    title: "Cluster Keywords",
    description:
      "Groups keywords by SERP overlap using Jaccard similarity. Fetches live SERPs for each keyword, compares the top-ranking domains, and clusters keywords with similar search results. Useful for content planning and identifying keyword groups that can be targeted with a single page.",
    inputSchema,
    outputSchema: z
      .object({
        ok: z.boolean(),
        reason: z.string().optional(),
        totalKeywords: z.number().optional(),
        clusters: z
          .array(
            z.object({
              label: z.string(),
              keywords: z.array(z.string()),
              avgSimilarity: z.number(),
            }),
          )
          .optional(),
        unclustered: z.array(z.string()).optional(),
        threshold: z.number().optional(),
        ...optionalMetaOutputSchema,
      })
      .passthrough(),
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: Args, context) => {
    const meta = buildProjectMeta(context, args.projectId);

    let result;
    try {
      result = await getKeywordClusters(
        args.keywords,
        args.locationCode ?? 2840,
        args.languageCode ?? "en",
        context.billing,
        args.threshold,
      );
    } catch (error) {
      const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
      return mcpResponse({
        text: error instanceof Error ? error.message : "Clustering failed.",
        meta,
        structuredContent: { ok: false, reason: code.toLowerCase() },
      });
    }

    const rows: ClusterRow[] = result.clusters.map((c) => ({
      label: c.label,
      keywords: c.keywords.length,
      similarity: `${(c.avgSimilarity * 100).toFixed(0)}%`,
    }));

    const clusterTable =
      rows.length > 0 ? formatMcpTable(rows, COLUMNS) : "No clusters found.";
    const unclustered =
      result.unclustered.length > 0
        ? `\nUnclustered: ${result.unclustered.join(", ")}`
        : "";

    return mcpResponse({
      text: `${result.totalKeywords} keywords, ${result.clusters.length} clusters (threshold: ${result.threshold})\n\n${clusterTable}${unclustered}`,
      meta,
      structuredContent: {
        ok: true,
        totalKeywords: result.totalKeywords,
        clusters: result.clusters,
        unclustered: result.unclustered,
        threshold: result.threshold,
      },
    });
  }),
};
