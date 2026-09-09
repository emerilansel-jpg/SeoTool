import { z } from "zod";
import { GmbGridRepository } from "@/server/features/gmb-grid/repositories/GmbGridRepository";
import { GmbGridService } from "@/server/features/gmb-grid/services/GmbGridService";
import { mcpResponse } from "@/server/mcp/formatters";
import { buildProjectMeta } from "@/server/mcp/context";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { projectIdSchema } from "@/server/mcp/schemas";

// ─── get_gmb_grid_configs ────────────────────────────────────────────────────

const configsInputSchema = {
  projectId: projectIdSchema,
} as const;

type ConfigsArgs = z.infer<z.ZodObject<typeof configsInputSchema>>;

export const getGmbGridConfigsTool = {
  name: "get_gmb_grid_configs",
  config: {
    title: "Get GMB grid configurations",
    description:
      "List local map / GMB geo-grid ranking tracking configurations and their latest scan results (Share of Local Voice, average rank, keyword, coordinates, grid size). Free — reads saved scan history.",
    inputSchema: configsInputSchema,
    outputSchema: z
      .object({
        configs: z.array(looseObjectOutputSchema),
        ...optionalMetaOutputSchema,
      })
      .passthrough(),
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: ConfigsArgs, context) => {
    // ponytail: returns all active configs; paginate when project exceeds 100 tracked locations
    const configs = await GmbGridRepository.listConfigsForProject(args.projectId);

    if (configs.length === 0) {
      return mcpResponse({
        text: "No GMB grid scan configurations found for this project.",
        meta: buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/gmb-grid`,
        ),
        structuredContent: { configs: [] },
      });
    }

    const lines = configs.map((c) => {
      const run = c.latestRun;
      const metrics = run
        ? `SoLV: ${run.solv != null ? `${run.solv.toFixed(1)}%` : "N/A"}, avg rank: ${run.averageRank != null ? run.averageRank.toFixed(1) : "N/A"} (${run.status}, ${run.completedAt ?? run.startedAt ?? ""})`
        : "no scans run yet";
      return `- Config ${c.id}: "${c.keyword}" for ${c.businessName} (${c.gridSize}x${c.gridSize}, ${c.radiusMeters}m) — ${metrics}`;
    });

    return mcpResponse({
      text: `GMB grid configurations (${configs.length}):\n${lines.join("\n")}\nUse get_gmb_grid_run with a runId for the full geo-grid ranking matrix.`,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/gmb-grid`,
      ),
      structuredContent: { configs },
    });
  }),
};

// ─── get_gmb_grid_run ────────────────────────────────────────────────────────

const runInputSchema = {
  projectId: projectIdSchema,
  runId: z.string().describe("GMB grid run ID to inspect."),
} as const;

type RunArgs = z.infer<z.ZodObject<typeof runInputSchema>>;

export const getGmbGridRunTool = {
  name: "get_gmb_grid_run",
  config: {
    title: "Get GMB grid scan run",
    description:
      "Get detailed geo-grid ranking results for a specific scan run, including SoLV, average rank, and rank per grid coordinate point. Free — reads saved scan history.",
    inputSchema: runInputSchema,
    outputSchema: z
      .object({
        config: looseObjectOutputSchema,
        run: looseObjectOutputSchema,
        snapshots: z.array(looseObjectOutputSchema),
        ...optionalMetaOutputSchema,
      })
      .passthrough(),
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: RunArgs, context) => {
    // ponytail: omit raw itemsJson per point to keep LLM context token-lean
    const result = await GmbGridService.getRun(args.projectId, args.runId);
    const { config, run, snapshots } = result;

    const summarySnapshots = snapshots.map((s) => ({
      gridRow: s.gridRow,
      gridCol: s.gridCol,
      lat: s.lat,
      lng: s.lng,
      rank: s.rank,
      status: s.status,
    }));

    const text = [
      `GMB Grid Run ${run.id} (${config.businessName} - "${config.keyword}"):`,
      `Status: ${run.status}, Grid: ${config.gridSize}x${config.gridSize}, Radius: ${config.radiusMeters}m`,
      `SoLV: ${run.solv != null ? `${run.solv.toFixed(1)}%` : "N/A"}, Average Rank: ${run.averageRank != null ? run.averageRank.toFixed(1) : "N/A"}`,
      `Points: ${run.completedPoints}/${run.totalPoints} completed (${run.foundPoints ?? 0} ranked)`,
    ].join("\n");

    return mcpResponse({
      text,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/gmb-grid?runId=${run.id}`,
      ),
      structuredContent: {
        config,
        run,
        snapshots: summarySnapshots,
      },
    });
  }),
};
