import { z } from "zod";
import { SerpVolatilityService } from "@/server/features/serp-volatility/services/SerpVolatilityService";
import { mcpResponse } from "@/server/mcp/formatters";
import { buildProjectMeta } from "@/server/mcp/context";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";

type TrendRow = {
  date: string;
  volatilityScore: number;
  keywordsSampled: number;
  avgPositionChange: number;
  category: string;
};

const TREND_COLUMNS: McpTableColumn<TrendRow>[] = [
  { header: "date", value: (row) => row.date },
  { header: "score", value: (row) => row.volatilityScore },
  { header: "keywords", value: (row) => row.keywordsSampled },
  { header: "avg change", value: (row) => row.avgPositionChange },
  { header: "category", value: (row) => row.category },
];

const inputSchema = {
  projectId: projectIdSchema,
  days: z
    .number()
    .int()
    .positive()
    .max(365)
    .optional()
    .describe(
      "Number of days of trend data to return. Defaults to 30. Max 365.",
    ),
} as const;

type Args = z.infer<z.ZodObject<typeof inputSchema>>;

export const getSerpVolatilityTool = {
  name: "get_serp_volatility",
  config: {
    title: "Get SERP volatility",
    description:
      "Returns the latest SERP volatility score and 30-day trend for a project. Volatility is computed from day-over-day keyword position changes in rank tracking data. Uses no credits — reads from stored snapshots. To compute a new volatility snapshot, trigger a rank check first.",
    inputSchema,
    outputSchema: z
      .object({
        latest: looseObjectOutputSchema.nullable(),
        trend: z.array(looseObjectOutputSchema),
        ...optionalMetaOutputSchema,
      })
      .passthrough(),
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: Args, context) => {
    const [latest, trend] = await Promise.all([
      SerpVolatilityService.getLatestVolatility(args.projectId),
      SerpVolatilityService.getVolatilityTrend(args.projectId, args.days ?? 30),
    ]);

    const parts: string[] = [];

    if (latest) {
      parts.push(
        `Latest volatility: ${latest.volatilityScore.toFixed(1)} / 100 (${latest.category})`,
        `Date: ${latest.date}  |  Keywords sampled: ${latest.keywordsSampled}  |  Avg position change: ${latest.avgPositionChange.toFixed(1)}`,
      );
      if (latest.topMovers && latest.topMovers.length > 0) {
        parts.push("", "Top movers:");
        for (const m of latest.topMovers) {
          const arrow =
            m.change > 0 ? "up" : m.change < 0 ? "down" : "unchanged";
          parts.push(
            `  ${m.keyword}: ${arrow} ${Math.abs(m.change)} positions`,
          );
        }
      }
    } else {
      parts.push(
        "No volatility data computed yet. Complete at least two rank checks to generate volatility scores.",
      );
    }

    if (trend.length > 0) {
      parts.push(
        "",
        `Trend (${trend.length} days):`,
        formatMcpTable(trend, TREND_COLUMNS),
      );
    }

    return mcpResponse({
      text: parts.join("\n"),
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/serp-volatility`,
      ),
      structuredContent: { latest, trend },
    });
  }),
};
