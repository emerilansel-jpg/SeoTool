import { z } from "zod";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { analyzeFromLogs } from "@/server/features/crawl-budget/services/CrawlBudgetService";
import { AppError } from "@/server/lib/errors";

const inputSchema = z.object({
  projectId: projectIdSchema,
  logText: z
    .string()
    .min(1)
    .describe("Access log content (Apache Combined or Nginx format)"),
});

const outputSchema = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
  totalRequests: z.number().optional(),
  totalBotRequests: z.number().optional(),
  botRatio: z.number().optional(),
  botTypes: z
    .array(
      z.object({
        name: z.string(),
        requests: z.number(),
        percentage: z.number(),
      }),
    )
    .optional(),
  topCrawledUrls: z
    .array(z.object({ url: z.string(), requests: z.number() }))
    .optional(),
  wasted4xx: z.number().optional(),
  wasted5xx: z.number().optional(),
  ...optionalMetaOutputSchema,
});

type BotRow = { name: string; requests: number; percentage: number };
const BOT_COLUMNS: McpTableColumn<BotRow>[] = [
  { header: "Bot", value: (row) => row.name },
  { header: "Requests", value: (row) => row.requests },
  { header: "%", value: (row) => `${row.percentage}%` },
];

export const analyzeCrawlBudgetTool = {
  name: "analyze_crawl_budget",
  config: {
    title: "Analyze Crawl Budget",
    description:
      "Analyzes server access logs to identify how search engine bots crawl a site. Returns bot type breakdown, most crawled URLs, status code distribution, and wasted crawl budget (4xx/5xx hits). Supports Apache Combined and Nginx default log formats.",
    inputSchema,
    outputSchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(
    async (
      args: z.infer<typeof inputSchema>,
      context: Parameters<typeof buildProjectMeta>[0],
    ) => {
      const meta = buildProjectMeta(context, args.projectId);

      let report;
      try {
        report = analyzeFromLogs(args.logText);
      } catch (error) {
        const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
        return mcpResponse({
          text: error instanceof Error ? error.message : "Analysis failed.",
          meta,
          structuredContent: { ok: false, reason: code.toLowerCase() },
        });
      }

      const botRows: BotRow[] = report.botTypes.map((b) => ({
        name: b.name,
        requests: b.requests,
        percentage: b.percentage,
      }));

      const wasted =
        report.wastedCrawlBudget.total4xx + report.wastedCrawlBudget.total5xx;

      const text = `Total: ${report.totalRequests} requests, ${report.totalBotRequests} bot (${report.botRatio}%)\nWasted crawl: ${wasted} (4xx: ${report.wastedCrawlBudget.total4xx}, 5xx: ${report.wastedCrawlBudget.total5xx})\n\n${formatMcpTable(botRows, BOT_COLUMNS)}`;

      return mcpResponse({
        text,
        meta,
        structuredContent: {
          ok: true,
          totalRequests: report.totalRequests,
          totalBotRequests: report.totalBotRequests,
          botRatio: report.botRatio,
          botTypes: botRows,
          topCrawledUrls: report.topCrawledUrls.map((u) => ({
            url: u.url,
            requests: u.requests,
          })),
          wasted4xx: report.wastedCrawlBudget.total4xx,
          wasted5xx: report.wastedCrawlBudget.total5xx,
        },
      });
    },
  ),
};
