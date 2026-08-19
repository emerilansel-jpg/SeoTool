import { z } from "zod";
import { LinkIntersectService } from "@/server/features/link-intersect/services/LinkIntersectService";
import type { IntersectDomain } from "@/server/features/link-intersect/services/linkIntersectTypes";
import { AppError } from "@/server/lib/errors";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { projectIdSchema } from "@/server/mcp/schemas";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";

const competitorsSchema = z
  .array(z.string().min(1))
  .min(1)
  .max(3)
  .describe(
    "Competitor domains to compare against (1-3), without https:// and www.",
  );
const targetSchema = z
  .string()
  .optional()
  .describe(
    "Your own domain. If omitted, the project's configured domain is used.",
  );

const inputSchema = z.object({
  projectId: projectIdSchema,
  competitors: competitorsSchema,
  target: targetSchema,
});
type Args = z.infer<typeof inputSchema>;

type IntersectRow = {
  domain: string;
  rank: number | null;
  backlinks: number | null;
  competitors: number;
};

const INTERSECT_COLUMNS: McpTableColumn<IntersectRow>[] = [
  { header: "rank", value: (r) => r.rank ?? "—" },
  { header: "backlinks", value: (r) => r.backlinks ?? "—" },
  { header: "competitors", value: (r) => r.competitors },
  { header: "domain", value: (r) => r.domain },
];

function toRows(domains: IntersectDomain[], limit: number): IntersectRow[] {
  return domains.slice(0, limit).map((d) => ({
    domain: d.domain,
    rank: d.rank,
    backlinks: d.backlinks,
    competitors: Object.keys(d.competitors).length,
  }));
}

export const getLinkIntersectTool = {
  name: "get_link_intersect",
  config: {
    title: "Find link intersect opportunities",
    description:
      "Find domains that link to one or more competitor domains but NOT to the project's own domain. These are potential link-building opportunities. Uses DataForSEO backlinks domain intersection. Metered — costs backlinks credits. Pass 1-3 competitor domains.",
    inputSchema,
    outputSchema: {
      ok: z.boolean(),
      reason: z.string().optional(),
      target: z.string().optional(),
      competitors: z.array(z.string()).optional(),
      rowCount: z.number().optional(),
      totalCount: z.number().nullable().optional(),
      summary: z
        .object({
          totalDomains: z.number(),
          avgRank: z.number().nullable(),
          avgBacklinks: z.number().nullable(),
          medianBacklinks: z.number().nullable(),
        })
        .optional(),
      domains: z
        .array(
          z
            .object({
              domain: z.string(),
              rank: z.number().nullable(),
              backlinks: z.number().nullable(),
              competitors: z.number(),
            })
            .passthrough(),
        )
        .optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: Args, context) => {
    const meta = buildProjectMeta(context, args.projectId);

    const target = args.target?.trim() || context.project.domain;
    if (!target) {
      return mcpResponse({
        text: "This project has no domain. Set one in project settings or pass a target domain.",
        meta,
        structuredContent: { ok: false, reason: "no_domain" },
      });
    }

    let result;
    try {
      result = await LinkIntersectService.getIntersect(
        {
          projectId: args.projectId,
          target,
          competitors: args.competitors,
        },
        context.billing,
      );
    } catch (error) {
      const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
      return mcpResponse({
        text:
          error instanceof Error
            ? error.message
            : "Could not compute link intersection.",
        meta,
        structuredContent: { ok: false, reason: code.toLowerCase() },
      });
    }

    const rows = toRows(result.domains, 20);
    const text =
      result.domains.length > 0
        ? `${result.summary.totalDomains} linking domain(s) that don't link to ${result.target}. Avg rank: ${result.summary.avgRank ?? "—"}. Sorted by rank.\n${formatMcpTable(rows, INTERSECT_COLUMNS)}`
        : `No link intersect opportunities found for ${result.target} vs these competitors.`;

    return mcpResponse({
      text,
      meta,
      structuredContent: {
        ok: true,
        target: result.target,
        competitors: result.competitors,
        rowCount: result.domains.length,
        totalCount: result.totalCount,
        summary: result.summary,
        domains: result.domains.slice(0, 20).map((d) => ({
          domain: d.domain,
          rank: d.rank,
          backlinks: d.backlinks,
          competitors: Object.keys(d.competitors).length,
        })),
      },
    });
  }),
};
