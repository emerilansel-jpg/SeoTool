import { z } from "zod";
import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";
import { getLatestResults } from "@/server/features/rank-tracking/services/rankTrackingResults";
import { mcpResponse } from "@/server/mcp/formatters";
import { buildProjectMeta } from "@/server/mcp/context";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import {
  formatMcpTable,
  readPath,
  type McpTableColumn,
} from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";

const RANK_RESULT_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "keyword", value: (row) => readPath(row, "keyword") },
  { header: "desktop", value: (row) => readPath(row, "desktop", "position") },
  {
    header: "prev (desktop)",
    value: (row) => readPath(row, "desktop", "previousPosition"),
  },
  { header: "mobile", value: (row) => readPath(row, "mobile", "position") },
  {
    header: "prev (mobile)",
    value: (row) => readPath(row, "mobile", "previousPosition"),
  },
];

const inputSchema = {
  projectId: projectIdSchema,
  trackerId: z
    .string()
    .optional()
    .describe(
      "Rank tracker config ID. If omitted, lists all rank trackers in the project.",
    ),
} as const;

type Args = z.infer<z.ZodObject<typeof inputSchema>>;

export const getRankTrackerTool = {
  name: "get_rank_tracker",
  config: {
    title: "Get rank tracker",
    description:
      "Read-only access to rank tracker configs and their latest results. With `trackerId`, returns config + latest snapshot per keyword. Without it, lists all trackers in the project. Uses no credits — reads from SeoTool.im state, no DataForSEO call. To trigger a new check, use the dashboard.",
    inputSchema,
    outputSchema: z
      .object({
        configs: z.array(looseObjectOutputSchema).optional(),
        config: looseObjectOutputSchema.optional(),
        results: looseObjectOutputSchema.optional(),
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
    if (!args.trackerId) {
      const configs = await RankTrackingRepository.getConfigsForProject(
        args.projectId,
      );
      const text =
        configs.length === 0
          ? "No rank trackers configured for this project."
          : `Rank trackers (${configs.length}):\n` +
            configs
              .map(
                (c) =>
                  `- ${c.id}  ${c.domain}  loc:${c.locationCode}  schedule:${c.scheduleInterval}`,
              )
              .join("\n");
      return mcpResponse({
        text,
        meta: buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/rank-tracking`,
        ),
        structuredContent: { configs },
      });
    }

    const config = await RankTrackingRepository.getConfigById({
      configId: args.trackerId,
      projectId: args.projectId,
    });
    if (!config) {
      return mcpResponse({
        text: `Rank tracker ${args.trackerId} not found in project ${args.projectId}.`,
        meta: buildProjectMeta(context, args.projectId),
      });
    }
    const results = await getLatestResults(args.trackerId, args.projectId);
    const text = [
      `Tracker ${config.id} (${config.domain}):`,
      `Schedule: ${config.scheduleInterval}, devices: ${config.devices}, depth: ${config.serpDepth}`,
      `Latest run: ${results.run?.lastCheckedAt ?? "never"}`,
      `Keywords (${results.rows.length}):`,
      results.rows.length === 0
        ? "No keywords tracked yet."
        : formatMcpTable(results.rows, RANK_RESULT_COLUMNS),
    ].join("\n");
    return mcpResponse({
      text,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/rank-tracking/${args.trackerId}`,
      ),
      structuredContent: { config, results },
    });
  }),
};

// ─── get_rank_history ────────────────────────────────────────────────────────

const rankHistoryInputSchema = {
  projectId: projectIdSchema,
  trackerId: z
    .string()
    .optional()
    .describe(
      "Rank tracker config ID. If omitted, uses the first tracker in the project.",
    ),
  keywordId: z
    .string()
    .optional()
    .describe(
      "Specific tracking keyword ID. When provided, returns position history for this keyword. When omitted, returns overall project rank trend.",
    ),
  device: z
    .enum(["desktop", "mobile"])
    .optional()
    .describe("Device to filter trend by (default 'desktop')."),
  sinceDays: z
    .number()
    .int()
    .min(1)
    .max(365)
    .optional()
    .describe("Days of history to fetch (default 30)."),
} as const;

type RankHistoryArgs = z.infer<z.ZodObject<typeof rankHistoryInputSchema>>;

export const getRankHistoryTool = {
  name: "get_rank_history",
  config: {
    title: "Get rank tracking history",
    description:
      "Inspect historical ranking movement over time. With `keywordId`, returns date-by-date position checks for that keyword. Without `keywordId`, returns aggregate rank trends (top 3, top 10, top 20 count over runs). Free — reads saved scan history.",
    inputSchema: rankHistoryInputSchema,
    outputSchema: z
      .object({
        history: z.array(looseObjectOutputSchema).optional(),
        trend: z.array(looseObjectOutputSchema).optional(),
        ...optionalMetaOutputSchema,
      })
      .passthrough(),
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: RankHistoryArgs, context) => {
    // ponytail: fallback to first tracker when trackerId omitted; upgrade to domain match if multi-tracker
    let configId = args.trackerId;
    if (!configId) {
      const configs = await RankTrackingRepository.getConfigsForProject(
        args.projectId,
      );
      if (configs.length === 0) {
        return mcpResponse({
          text: "No rank trackers configured for this project.",
          meta: buildProjectMeta(
            context,
            args.projectId,
            `/p/${args.projectId}/rank-tracking`,
          ),
        });
      }
      configId = configs[0].id;
    }

    const sinceDays = args.sinceDays ?? 30;

    if (args.keywordId) {
      const history = await RankTrackingRepository.getKeywordHistory(
        configId,
        args.keywordId,
        sinceDays,
      );
      const text =
        history.length === 0
          ? `No history recorded for keyword ${args.keywordId} in the last ${sinceDays} days.`
          : `Keyword ranking history (last ${sinceDays} days, ${history.length} checks):\n` +
            history
              .map(
                (h) =>
                  `- ${h.checkedAt.slice(0, 10)} [${h.device}]: ${h.position != null ? `#${h.position}` : "Not in top 100"}`,
              )
              .join("\n");
      return mcpResponse({
        text,
        meta: buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/rank-tracking/${configId}`,
        ),
        structuredContent: { history },
      });
    }

    const device = args.device ?? "desktop";
    const trend = await RankTrackingRepository.getConfigTrend(
      configId,
      device,
      sinceDays,
    );
    const text =
      trend.length === 0
        ? `No rank trend data for tracker ${configId} (${device}) in the last ${sinceDays} days.`
        : `Rank trend for tracker ${configId} (${device}, last ${sinceDays} days):\n` +
          trend
            .map(
              (t) =>
                `- ${t.checkedAt.slice(0, 10)}: Total ${t.total} | Top 3: ${t.top3} | Top 4-10: ${t.top4to10} | Top 11-20: ${t.top11to20}`,
            )
            .join("\n");

    return mcpResponse({
      text,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/rank-tracking/${configId}`,
      ),
      structuredContent: { trend },
    });
  }),
};

