import { z } from "zod";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { validateSitemap } from "@/server/features/sitemap-validation/services/SitemapValidationService";
import { AppError } from "@/server/lib/errors";

const inputSchema = z.object({
  projectId: projectIdSchema,
  url: z
    .string()
    .url()
    .describe(
      "Full URL of the sitemap to validate (e.g. https://example.com/sitemap.xml)",
    ),
});

const outputSchema = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
  totalUrls: z.number().optional(),
  validUrls: z.number().optional(),
  errorCount: z.number().optional(),
  warningCount: z.number().optional(),
  issues: z
    .array(
      z.object({
        severity: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
  ...optionalMetaOutputSchema,
});

type IssueRow = { severity: string; message: string };
const COLUMNS: McpTableColumn<IssueRow>[] = [
  { header: "Severity", value: (row) => row.severity },
  { header: "Message", value: (row) => row.message },
];

export const validateSitemapTool = {
  name: "validate_sitemap",
  config: {
    title: "Validate Sitemap",
    description:
      "Fetches and validates an XML sitemap. Reports errors (invalid URLs, HTTP failures), warnings (duplicates, size limits), and info (stale URLs, low priority). Useful for checking sitemap health before submitting to search engines.",
    inputSchema,
    outputSchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
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
        report = await validateSitemap(args.url, meta.organizationId);
      } catch (error) {
        const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
        return mcpResponse({
          text: error instanceof Error ? error.message : "Validation failed.",
          meta,
          structuredContent: { ok: false, reason: code.toLowerCase() },
        });
      }

      const issueRows = report.issues.map((i) => ({
        severity: i.severity,
        message: i.message,
      }));

      const text =
        issueRows.length > 0
          ? `${report.totalUrls} URLs found, ${report.errorCount} errors, ${report.warningCount} warnings.\n${formatMcpTable(issueRows, COLUMNS)}`
          : `${report.totalUrls} URLs found. No issues detected.`;

      return mcpResponse({
        text,
        meta,
        structuredContent: {
          ok: report.errorCount === 0,
          totalUrls: report.totalUrls,
          validUrls: report.validUrls,
          errorCount: report.errorCount,
          warningCount: report.warningCount,
          issues: report.issues.map((i) => ({
            severity: i.severity,
            message: i.message,
          })),
        },
      });
    },
  ),
};
