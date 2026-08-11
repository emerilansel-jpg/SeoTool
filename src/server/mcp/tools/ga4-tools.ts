/* eslint-disable max-lines */
import { z } from "zod";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";
import { buildDashboardUrl } from "@/server/mcp/urls";
import { hasSelfHostedGa4Config } from "@/server/features/ga4/oauth-config";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import {
  Ga4NotConnectedError,
  Ga4Service,
  isExpectedGrantFailure,
} from "@/server/features/ga4/services/Ga4Service";
import {
  GA4_DATE_RANGES,
  GA4_DEFAULT_ROW_LIMIT,
  GA4_DIMENSIONS,
  GA4_MAX_ROW_LIMIT,
  GA4_METRICS,
  type Ga4ReportInput,
} from "@/server/features/ga4/analyticsRequest";
import { readMetrics } from "@/server/features/ga4/analyticsReport";
import { Ga4ApiError, Ga4TokenError } from "@/server/lib/ga4Client";
import { GA4_SELF_HOSTED_SETUP_DOCS_URL } from "@/shared/ga4";

type Ga4PerfRow = {
  key: string;
  sessions: number;
  totalUsers: number;
  newUsers: number;
  engagedSessions: number;
  engagementRate: number;
  averageSessionDuration: number;
  screenPageViews: number;
  conversions: number;
};

const GA4_PERF_COLUMNS: McpTableColumn<Ga4PerfRow>[] = [
  { header: "key", value: (row) => row.key },
  { header: "sessions", value: (row) => row.sessions },
  { header: "users", value: (row) => row.totalUsers },
  {
    header: "engagementRate",
    value: (row) => row.engagementRate,
    format: (value) =>
      typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "—",
  },
  {
    header: "avgSession",
    value: (row) => row.averageSessionDuration,
    format: (value) =>
      typeof value === "number" ? `${value.toFixed(1)}s` : "—",
  },
  { header: "pageviews", value: (row) => row.screenPageViews },
  { header: "conversions", value: (row) => row.conversions },
];

type ProjectAuthContext = {
  auth: { organizationId: string };
  baseUrl: string;
};

function connectGa4Url(baseUrl: string, projectId: string): string {
  // GA4 Insights hosts the connection card and the data the user came for;
  // land there rather than settings.
  return buildDashboardUrl(baseUrl, `/p/${projectId}/ga4-insights`);
}

/** Self-hosted GA4 requires the operator to provide a Google OAuth client and
 *  BETTER_AUTH_SECRET. Hosted mode has both; self-hosted tools return a setup
 *  nudge before attempting a token lookup when either is missing. Mirrors GSC. */
async function missingSelfHostedGoogleClientResponse(
  context: ProjectAuthContext,
  projectId: string,
) {
  const [hosted, configured] = await Promise.all([
    isHostedServerAuthMode(),
    hasSelfHostedGa4Config(),
  ]);
  if (hosted || configured) return null;

  return mcpResponse({
    text: `This self-hosted OpenSEO deployment is not configured for Google Analytics yet. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and BETTER_AUTH_SECRET, enable the Google Analytics Data API and Admin API in your Google Cloud project, then reconnect Google Analytics from the project's settings page. Setup docs: ${GA4_SELF_HOSTED_SETUP_DOCS_URL}`,
    meta: buildProjectMeta(context, projectId),
    structuredContent: {
      ok: false,
      connected: false,
      reason: "ga4_oauth_not_configured",
      setupDocsUrl: GA4_SELF_HOSTED_SETUP_DOCS_URL,
    },
  });
}

function invalidRequest(
  meta: ReturnType<typeof buildProjectMeta>,
  message: string,
) {
  return mcpResponse({
    text: message,
    meta,
    structuredContent: { ok: false, reason: "invalid_request" },
  });
}

function describeGa4Error(error: unknown): string {
  if (error instanceof Ga4NotConnectedError) {
    return "Google Analytics is not connected for this project.";
  }
  if (error instanceof Ga4TokenError) {
    return "The Google Analytics connection expired or was revoked. Reconnect to continue.";
  }
  if (error instanceof Ga4ApiError) {
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

//---------------------------------------------------------------------------
// get_ga4_report
//---------------------------------------------------------------------------

const filterSchema = z.object({
  device: z
    .enum(["DESKTOP", "MOBILE", "TABLET"])
    .optional()
    .describe("Restrict to a device category."),
  country: z
    .string()
    .length(3)
    .optional()
    .describe("ISO-3166-1 alpha-3 country code (e.g. 'usa'), lowercased."),
});

const reportInputSchema = {
  projectId: projectIdSchema,
  dimensions: z
    .array(z.enum(GA4_DIMENSIONS))
    .min(1)
    .max(4)
    .optional()
    .describe(
      "Group rows by dimension. Default ['sessionDefaultChannelGroup'] (channel breakdown incl. Organic Search). Use ['date'] for a daily time series, ['landingPagePlusQueryString'] for top pages, ['deviceCategory'] for devices.",
    ),
  metrics: z
    .array(z.enum(GA4_METRICS))
    .min(1)
    .optional()
    .describe(
      "Metrics to return. Defaults to the full set (sessions, totalUsers, newUsers, engagedSessions, engagementRate, averageSessionDuration, screenPageViews, conversions).",
    ),
  dateRange: z
    .enum(GA4_DATE_RANGES)
    .optional()
    .describe(
      "Convenience window (default last_28_days). End set ~1 day back for GA4 data lag. Ignored when startDate+endDate are given. Max lookback 12 months.",
    ),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Explicit start (YYYY-MM-DD). Use together with endDate."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Explicit end (YYYY-MM-DD). Use together with startDate."),
  filters: z
    .array(filterSchema)
    .max(2)
    .optional()
    .describe(
      "AND-combined filters, e.g. [{device:'MOBILE'}] or [{country:'usa'}].",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(GA4_MAX_ROW_LIMIT)
    .optional()
    .describe("Rows per call (default 1000, max 10000)."),
  offset: z.number().int().min(0).optional().describe("Pagination offset."),
} satisfies Record<string, z.ZodTypeAny>;

const perfInputSchema = z.object(reportInputSchema);
type PerfArgs = z.infer<typeof perfInputSchema>;

export const getGa4ReportTool = {
  name: "get_ga4_report",
  config: {
    title: "Get Google Analytics 4 report",
    description:
      "Query the connected Google Analytics 4 property via the Data API runReport: sessions, users, pageviews, conversions, engagement grouped by channel/page/device/date/country. First-party data — use it to see real traffic, which channels drive it (highlight Organic Search for SEO), top landing pages, and trends. engagementRate is a 0-1 fraction; averageSessionDuration is seconds; date dimension is YYYYMMDD. Read-only; does not use credits.",
    inputSchema: perfInputSchema,
    outputSchema: {
      ok: z.boolean(),
      reason: z.string().optional(),
      connectUrl: z.string().optional(),
      setupDocsUrl: z.string().optional(),
      propertyId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      dimensions: z.array(z.string()).optional(),
      rowCount: z.number().optional(),
      rows: z
        .array(
          z
            .object({
              key: z.string(),
              sessions: z.number(),
              totalUsers: z.number(),
              newUsers: z.number(),
              engagedSessions: z.number(),
              engagementRate: z.number(),
              averageSessionDuration: z.number(),
              screenPageViews: z.number(),
              conversions: z.number(),
            })
            .passthrough(),
        )
        .optional(),
      hasMore: z.boolean().optional(),
      nextOffset: z.number().optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: PerfArgs, context) => {
    const blocked = await missingSelfHostedGoogleClientResponse(
      context,
      args.projectId,
    );
    if (blocked) return blocked;

    const connectUrl = connectGa4Url(context.baseUrl, args.projectId);
    const meta = buildProjectMeta(context, args.projectId);

    // Half-specified explicit ranges silently fall back to the default window.
    if (Boolean(args.startDate) !== Boolean(args.endDate)) {
      return invalidRequest(
        meta,
        "Provide both startDate and endDate, or neither (use dateRange instead).",
      );
    }

    try {
      const deviceFilter = args.filters?.find((f) => f.device)?.device;
      const countryFilter = args.filters?.find((f) => f.country)?.country;
      const filter: Ga4ReportInput["filter"] = {};
      if (deviceFilter) filter.device = deviceFilter;
      if (countryFilter) filter.country = countryFilter;

      const result = await Ga4Service.getReport({
        projectId: args.projectId,
        ...(args.startDate && args.endDate
          ? { startDate: args.startDate, endDate: args.endDate }
          : { dateRange: args.dateRange ?? "last_28_days" }),
        dimensions:
          args.dimensions && args.dimensions.length > 0
            ? args.dimensions
            : ["sessionDefaultChannelGroup"],
        metrics: args.metrics ?? [...GA4_METRICS],
        filter,
        limit: args.limit ?? GA4_DEFAULT_ROW_LIMIT,
        offset: args.offset,
      } satisfies Ga4ReportInput);

      const dimensions = result.request.dimensions?.map((d) => d.name) ?? [];
      const rows: Ga4PerfRow[] = (result.response.rows ?? []).map((row) => ({
        key: row.dimensionValues?.[0]?.value ?? "",
        ...readMetrics(result.response, row),
      }));

      const requestedLimit = result.request.limit ?? GA4_DEFAULT_ROW_LIMIT;
      const hasMore = rows.length >= requestedLimit;
      const nextOffset = (args.offset ?? 0) + rows.length;

      const header = `${result.propertyId} · ${dimensions.join("+")} · ${result.request.dateRanges[0]?.startDate}→${result.request.dateRanges[0]?.endDate}\n${rows.length} row${rows.length === 1 ? "" : "s"}${hasMore ? " (more available, paginate with offset)" : ""}`;
      const text =
        rows.length > 0
          ? `${header}\n${formatMcpTable(rows, GA4_PERF_COLUMNS)}`
          : `${header}\nNo rows for this query/date range.`;

      return mcpResponse({
        text,
        meta,
        structuredContent: {
          ok: true,
          propertyId: result.propertyId,
          startDate: result.request.dateRanges[0]?.startDate,
          endDate: result.request.dateRanges[0]?.endDate,
          dimensions,
          rowCount: rows.length,
          rows,
          hasMore,
          nextOffset: hasMore ? nextOffset : undefined,
        },
      });
    } catch (error) {
      const isNotConnected = error instanceof Ga4NotConnectedError;
      return mcpResponse({
        text: `${describeGa4Error(error)} ${isNotConnected ? `Connect here: ${connectUrl}` : `(reconnect: ${connectUrl})`}`,
        meta,
        structuredContent: {
          ok: false,
          reason: isNotConnected
            ? "not_connected"
            : isExpectedGrantFailure(error)
              ? "grant_expired"
              : "api_error",
          connectUrl,
        },
      });
    }
  }),
};
