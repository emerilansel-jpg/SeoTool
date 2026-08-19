import { z } from "zod";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { checkOnPageSeo } from "@/server/features/on-page-checker/services/OnPageCheckerService";
import { AppError } from "@/server/lib/errors";

const inputSchema = z.object({
  projectId: projectIdSchema,
  url: z.string().url().describe("Full URL of the page to analyze"),
});

const outputSchema = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
  overallScore: z.number().optional(),
  grade: z.string().optional(),
  title: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  wordCount: z.number().nullable().optional(),
  categories: z
    .array(
      z.object({
        category: z.string(),
        score: z.number(),
        grade: z.string(),
        issueCount: z.number(),
      }),
    )
    .optional(),
  issues: z
    .array(
      z.object({
        severity: z.string(),
        category: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
  ...optionalMetaOutputSchema,
});

type CategoryRow = {
  category: string;
  score: number;
  grade: string;
  issueCount: number;
};
const CATEGORY_COLUMNS: McpTableColumn<CategoryRow>[] = [
  { header: "Category", value: (row) => row.category },
  { header: "Score", value: (row) => row.score },
  { header: "Grade", value: (row) => row.grade },
  { header: "Issues", value: (row) => row.issueCount },
];

type IssueRow = { severity: string; category: string; message: string };
const ISSUE_COLUMNS: McpTableColumn<IssueRow>[] = [
  { header: "Severity", value: (row) => row.severity },
  { header: "Category", value: (row) => row.category },
  { header: "Message", value: (row) => row.message },
];

export const checkOnPageSeoTool = {
  name: "check_onpage_seo",
  config: {
    title: "Check On-Page SEO",
    description:
      "Analyzes a URL for on-page SEO factors: title tag, meta description, headings, images, links, content depth, and technical signals. Returns an overall score (0-100) with category breakdowns and actionable issues.",
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
        report = await checkOnPageSeo(args.url, meta.organizationId);
      } catch (error) {
        const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
        return mcpResponse({
          text: error instanceof Error ? error.message : "Analysis failed.",
          meta,
          structuredContent: { ok: false, reason: code.toLowerCase() },
        });
      }

      const categoryRows: CategoryRow[] = report.categories.map((c) => ({
        category: c.category,
        score: c.score,
        grade: c.grade,
        issueCount: c.issues.length,
      }));

      const issueRows: IssueRow[] = report.issues.map((i) => ({
        severity: i.severity,
        category: i.category,
        message: i.message,
      }));

      const categoryTable = formatMcpTable(categoryRows, CATEGORY_COLUMNS);
      const issueTable =
        issueRows.length > 0
          ? `\n\nIssues:\n${formatMcpTable(issueRows, ISSUE_COLUMNS)}`
          : "";

      const text = `Score: ${report.overallScore}/100 (${report.grade})${report.title ? `\nTitle: ${report.title}` : ""}${report.metaDescription ? `\nMeta: ${report.metaDescription}` : ""}\n\n${categoryTable}${issueTable}`;

      return mcpResponse({
        text,
        meta,
        structuredContent: {
          ok: report.overallScore >= 70,
          overallScore: report.overallScore,
          grade: report.grade,
          title: report.title,
          metaDescription: report.metaDescription,
          wordCount: report.wordCount,
          categories: categoryRows,
          issues: issueRows,
        },
      });
    },
  ),
};
