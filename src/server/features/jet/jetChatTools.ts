import { tool, type Tool, type ToolSet } from "ai";
import { z, type ZodRawShape } from "zod";
import { withPgClient } from "@/db";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  createWorkersOAuthMcpProps,
  type McpToolAuthContext,
  type ToolExtra,
} from "@/server/mcp/context";
import { getBacklinksOverviewTool } from "@/server/mcp/tools/get-backlinks-overview";
import { getBacklinksProfileTool } from "@/server/mcp/tools/get-backlinks-profile";
import { getDomainKeywordSuggestionsTool } from "@/server/mcp/tools/get-domain-keyword-suggestions";
import { getDomainOverviewTool } from "@/server/mcp/tools/get-domain-overview";
import {
  getRankHistoryTool,
  getRankTrackerTool,
} from "@/server/mcp/tools/get-rank-tracker";
import {
  getGmbGridConfigsTool,
  getGmbGridRunTool,
} from "@/server/mcp/tools/gmb-grid-tools";
import {
  getAuditIssuesTool,
  getAuditPagesTool,
  getAuditStatusTool,
  listSiteAuditsTool,
} from "@/server/mcp/tools/site-audit-tools";
import { getSerpResultsTool } from "@/server/mcp/tools/get-serp-results";
import { listSavedKeywordsTool } from "@/server/mcp/tools/list-saved-keywords";
import {
  findSerpCompetitorsTool,
  getGoogleBusinessQuestionsTool,
  getKeywordMetricsTool,
  getLocalSerpResultsTool,
  getRankedKeywordsTool,
  searchLocalBusinessesTool,
} from "@/server/mcp/tools/dataforseo-research-tools";
import { researchKeywordsTool } from "@/server/mcp/tools/research-keywords";
import { saveKeywordsTool } from "@/server/mcp/tools/save-keywords";
import {
  getSearchConsolePerformanceTool,
  inspectUrlsTool,
} from "@/server/mcp/tools/search-console-tools";
import { whoamiTool } from "@/server/mcp/tools/whoami";
import { discoverSiteUrls, readPages, readSite } from "@/server/lib/scrape";
import seotoolFactSheet from "@/server/features/onboarding/seotool-fact-sheet.md?raw";

const JET_MAX_SCRAPE_PAGES = 10;
const JET_MAX_MAPPED_URLS = 60;

type McpToolDefinition<Shape extends ZodRawShape> = {
  config: { description: string; inputSchema: Shape };
  handler: (
    args: z.infer<z.ZodObject<Shape>>,
    extra: ToolExtra,
  ) => Promise<CallToolResult>;
};

function toModelOutput(result: CallToolResult): unknown {
  const summary = (result.content ?? [])
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("\n");
  return result.structuredContent
    ? { summary, data: result.structuredContent }
    : { summary };
}

function adaptMcpTool<Shape extends ZodRawShape>(
  def: McpToolDefinition<Shape>,
  extra: ToolExtra,
  projectId: string,
): Tool {
  const { projectId: _projectIdSchema, ...modelShape } = def.config.inputSchema;
  const bindsProject = "projectId" in def.config.inputSchema;

  return tool({
    description: def.config.description,
    inputSchema: z.object(bindsProject ? modelShape : def.config.inputSchema),
    execute: async (args) => {
      const fullArgs = (bindsProject
        ? { ...args, projectId }
        : args) as unknown as z.infer<z.ZodObject<Shape>>;
      try {
        return toModelOutput(
          await withPgClient(() => def.handler(fullArgs, extra)),
        );
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
}

function scrapeTools(projectDomain: string | null): ToolSet {
  return {
    map_links: tool({
      description:
        "List a site's page URLs (homepage plus its sitemap) so you can choose which pages to read with read_pages. Defaults to the project's own site; pass `domain` to map another site (e.g. a competitor). Uses no credits.",
      inputSchema: z.object({
        domain: z
          .string()
          .optional()
          .describe("Domain or URL to map. Omit for the project's own site."),
      }),
      execute: async ({ domain }) => {
        const target = domain ?? projectDomain;
        if (!target) {
          return {
            error:
              "This project has no website set — ask the user for their site first.",
          };
        }
        const result = await discoverSiteUrls(target, JET_MAX_MAPPED_URLS);
        return result.blocked
          ? { blocked: true, urls: [], note: "Could not reach the site." }
          : { blocked: false, urls: result.urls };
      },
    }),
    read_pages: tool({
      description: `Read up to ${JET_MAX_SCRAPE_PAGES} web pages as plain text — the project's own pages or anyone else's (competitors, references). Pass specific \`urls\` (usually picked from map_links); omit to read a representative sample of the project's own site. Uses no credits.`,
      inputSchema: z.object({
        urls: z
          .array(z.string().url())
          .max(JET_MAX_SCRAPE_PAGES)
          .optional()
          .describe(
            `Specific page URLs to read (max ${JET_MAX_SCRAPE_PAGES}). Omit to read the project's own site.`,
          ),
      }),
      execute: async ({ urls }) => {
        const site =
          urls && urls.length > 0
            ? await readPages(urls, JET_MAX_SCRAPE_PAGES)
            : projectDomain
              ? await readSite(projectDomain, JET_MAX_SCRAPE_PAGES)
              : null;
        if (!site) {
          return {
            error:
              "This project has no website set — ask the user for their site, or pass explicit urls.",
          };
        }
        if (site.blocked) {
          return {
            blocked: true,
            pages: [],
            note: "Could not read the requested page(s). Ask the user to describe the site instead, and say you couldn't read it.",
          };
        }
        return { blocked: false, pages: site.pages };
      },
    }),
  };
}

/**
 * Builds Jet's tool surface as an AI SDK ToolSet.
 */
export function buildJetMcpTools(
  authContext: McpToolAuthContext,
  project: { id: string; domain: string | null },
): ToolSet {
  const projectId = project.id;
  const extra: ToolExtra = {
    signal: new AbortController().signal,
    requestId: 0,
    authInfo: {
      token: "jet-session",
      clientId: authContext.clientId ?? "jet",
      scopes: authContext.scopes,
      extra: createWorkersOAuthMcpProps(authContext),
    },
    sendNotification: () => Promise.resolve(),
    sendRequest: () =>
      Promise.reject(new Error("sendRequest is unsupported in the Jet agent")),
  };

  return {
    get_product_info: tool({
      description:
        "The SeoTool.im fact sheet: what the product does, plans/pricing, credit costs, integrations, MCP setup. Call before answering questions about SeoTool.im itself. Uses no credits.",
      inputSchema: z.object({}),
      execute: () => Promise.resolve({ factSheet: seotoolFactSheet }),
    }),
    ...scrapeTools(project.domain),
    whoami: adaptMcpTool(whoamiTool, extra, projectId),
    list_saved_keywords: adaptMcpTool(listSavedKeywordsTool, extra, projectId),
    research_keywords: adaptMcpTool(researchKeywordsTool, extra, projectId),
    save_keywords: adaptMcpTool(saveKeywordsTool, extra, projectId),
    get_domain_overview: adaptMcpTool(getDomainOverviewTool, extra, projectId),
    get_domain_keyword_suggestions: adaptMcpTool(
      getDomainKeywordSuggestionsTool,
      extra,
      projectId,
    ),
    get_backlinks_overview: adaptMcpTool(
      getBacklinksOverviewTool,
      extra,
      projectId,
    ),
    get_backlinks_profile: adaptMcpTool(
      getBacklinksProfileTool,
      extra,
      projectId,
    ),
    get_serp_results: adaptMcpTool(getSerpResultsTool, extra, projectId),
    get_rank_tracker: adaptMcpTool(getRankTrackerTool, extra, projectId),
    get_rank_history: adaptMcpTool(getRankHistoryTool, extra, projectId),
    list_site_audits: adaptMcpTool(listSiteAuditsTool, extra, projectId),
    get_audit_status: adaptMcpTool(getAuditStatusTool, extra, projectId),
    get_audit_issues: adaptMcpTool(getAuditIssuesTool, extra, projectId),
    get_audit_pages: adaptMcpTool(getAuditPagesTool, extra, projectId),
    get_gmb_grid_configs: adaptMcpTool(
      getGmbGridConfigsTool,
      extra,
      projectId,
    ),
    get_gmb_grid_run: adaptMcpTool(getGmbGridRunTool, extra, projectId),
    get_ranked_keywords: adaptMcpTool(getRankedKeywordsTool, extra, projectId),
    find_serp_competitors: adaptMcpTool(
      findSerpCompetitorsTool,
      extra,
      projectId,
    ),
    search_local_businesses: adaptMcpTool(
      searchLocalBusinessesTool,
      extra,
      projectId,
    ),
    get_local_serp_results: adaptMcpTool(
      getLocalSerpResultsTool,
      extra,
      projectId,
    ),
    get_google_business_questions: adaptMcpTool(
      getGoogleBusinessQuestionsTool,
      extra,
      projectId,
    ),
    get_keyword_metrics: adaptMcpTool(getKeywordMetricsTool, extra, projectId),
    get_search_console_performance: adaptMcpTool(
      getSearchConsolePerformanceTool,
      extra,
      projectId,
    ),
    inspect_urls: adaptMcpTool(inspectUrlsTool, extra, projectId),
  };
}

export const buildSamMcpTools = buildJetMcpTools;
