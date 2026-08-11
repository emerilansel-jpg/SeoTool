import { z } from "zod";
import { ContentGapService } from "@/server/features/content-intelligence/services/ContentGapService";
import type { GapKeyword } from "@/server/features/content-intelligence/contentGap";
import { resolveLabsMarket } from "@/shared/keyword-locations";
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
const domainSchema = z
  .string()
  .optional()
  .describe(
    "Your own domain. If omitted, the project's configured domain is used.",
  );
const locationCodeSchema = z
  .number()
  .int()
  .optional()
  .describe("DataForSEO location code. Defaults to the project's market.");
const languageCodeSchema = z
  .string()
  .optional()
  .describe("DataForSEO language code. Defaults to the project's market.");

const inputSchema = z.object({
  projectId: projectIdSchema,
  competitors: competitorsSchema,
  domain: domainSchema,
  locationCode: locationCodeSchema,
  languageCode: languageCodeSchema,
});
type Args = z.infer<typeof inputSchema>;

type GapRow = {
  keyword: string;
  volume: number | null;
  difficulty: number | null;
  competitors: number;
};

const GAP_COLUMNS: McpTableColumn<GapRow>[] = [
  { header: "volume", value: (r) => r.volume ?? "—" },
  { header: "difficulty", value: (r) => r.difficulty ?? "—" },
  { header: "competitors", value: (r) => r.competitors },
  { header: "keyword", value: (r) => r.keyword },
];

function toRows(keywords: GapKeyword[], limit: number): GapRow[] {
  return keywords.slice(0, limit).map((kw) => ({
    keyword: kw.keyword,
    volume: kw.searchVolume,
    difficulty: kw.keywordDifficulty,
    competitors: kw.competitors.length,
  }));
}

export const getContentGapTool = {
  name: "get_content_gap",
  config: {
    title: "Find content gaps vs competitors",
    description:
      "Find keywords one or more competitor domains rank for that the project's own domain does not (DataForSEO Labs domain intersection). Returns gap keywords with search volume, difficulty and competitor coverage, plus topic clusters. Metered — each competitor costs credits. Pass 1-3 competitor domains.",
    inputSchema,
    outputSchema: {
      ok: z.boolean(),
      reason: z.string().optional(),
      domain: z.string().optional(),
      competitors: z.array(z.string()).optional(),
      rowCount: z.number().optional(),
      summary: z
        .object({
          totalKeywords: z.number(),
          totalVolume: z.number(),
          averageDifficulty: z.number().nullable(),
          averageCompetitorOverlap: z.number(),
          topTopic: z.string().nullable(),
        })
        .optional(),
      topics: z
        .array(
          z
            .object({
              topic: z.string(),
              keywordCount: z.number(),
              totalVolume: z.number(),
            })
            .passthrough(),
        )
        .optional(),
      keywords: z
        .array(
          z
            .object({
              keyword: z.string(),
              searchVolume: z.number().nullable(),
              keywordDifficulty: z.number().nullable(),
              cpc: z.number().nullable(),
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

    const domain = args.domain?.trim() || context.project.domain;
    if (!domain) {
      return mcpResponse({
        text: "This project has no domain. Set one in project settings or pass a domain.",
        meta,
        structuredContent: { ok: false, reason: "no_domain" },
      });
    }

    const market = resolveLabsMarket(
      { locationCode: args.locationCode, languageCode: args.languageCode },
      context.project,
    );

    let result;
    try {
      result = await ContentGapService.getGap(
        {
          projectId: args.projectId,
          domain,
          competitors: args.competitors,
          locationCode: market.locationCode,
          languageCode: market.languageCode,
        },
        context.billing,
      );
    } catch (error) {
      const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
      return mcpResponse({
        text:
          error instanceof Error
            ? error.message
            : "Could not compute the content gap.",
        meta,
        structuredContent: { ok: false, reason: code.toLowerCase() },
      });
    }

    const rows = toRows(result.keywords, 20);
    const topicLine =
      result.summary.topTopic != null
        ? `Top topic: ${result.summary.topTopic}.`
        : "";
    const text =
      result.keywords.length > 0
        ? `${result.summary.totalKeywords} gap keyword(s), ${result.summary.totalVolume} addressable searches/mo. ${topicLine} Highest volume first.\n${formatMcpTable(rows, GAP_COLUMNS)}`
        : "No gap keywords — the project domain already covers what these competitors rank for.";

    return mcpResponse({
      text,
      meta,
      structuredContent: {
        ok: true,
        domain: result.domain,
        competitors: result.competitors,
        rowCount: result.keywords.length,
        summary: result.summary,
        topics: result.topics,
        keywords: result.keywords.map((kw) => ({
          keyword: kw.keyword,
          searchVolume: kw.searchVolume,
          keywordDifficulty: kw.keywordDifficulty,
          cpc: kw.cpc,
          competitors: kw.competitors.length,
        })),
      },
    });
  }),
};
