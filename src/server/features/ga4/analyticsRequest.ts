import type { Ga4ReportRequest } from "@/server/lib/ga4Client";

// Convenience ranges offered on the GA4 Insights page. A subset is reused by the
// MCP tool; keep them assignable at the resolveDateRange call site.
export const GA4_DATE_RANGES = [
  "last_7_days",
  "last_28_days",
  "last_3_months",
  "last_6_months",
  "last_12_months",
] as const;

const GA4_DEVICES = ["DESKTOP", "MOBILE", "TABLET"] as const;

// GA4 standard data can lag up to ~24-48h; default the end of convenience
// ranges a day before today so recent incomplete data doesn't skew totals.
const GA4_DATA_LAG_DAYS = 1;

export const GA4_DEFAULT_ROW_LIMIT = 1000;
export const GA4_MAX_ROW_LIMIT = 10000;

export type Ga4DateRange = (typeof GA4_DATE_RANGES)[number];
export type Ga4Device = (typeof GA4_DEVICES)[number];

/** Dimensions surfaced on the GA4 Insights page and MCP tool. */
export const GA4_DIMENSIONS = [
  "date",
  "deviceCategory",
  "sessionDefaultChannelGroup",
  "landingPagePlusQueryString",
  "country",
] as const;

export type Ga4Dimension = (typeof GA4_DIMENSIONS)[number];

// Metrics requested for every report so totals/trend/tables share one shape.
export const GA4_METRICS = [
  "sessions",
  "totalUsers",
  "newUsers",
  "engagedSessions",
  "engagementRate",
  "averageSessionDuration",
  "screenPageViews",
  "conversions",
] as const;

export type Ga4Metric = (typeof GA4_METRICS)[number];

export type Ga4ReportFilter = {
  device?: Ga4Device;
  // ISO-3166-1 alpha-3, lowercased — the code GA4 returns in `country`.
  country?: string;
};

export type Ga4ReportInput = {
  projectId: string;
  dateRange?: Ga4DateRange;
  startDate?: string;
  endDate?: string;
  filter?: Ga4ReportFilter;
  dimensions?: Ga4Dimension[];
  metrics?: Ga4Metric[];
  limit?: number;
  offset?: number;
  /** Request the TOTAL metric aggregation (populates `totals` on the response). */
  includeTotals?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function subtractUtcMonths(date: Date, months: number): Date {
  const day = date.getUTCDate();
  const d = new Date(date);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - months);
  const daysInTargetMonth = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(day, daysInTargetMonth));
  return d;
}

function subtractRange(end: Date, range: Ga4DateRange): Date {
  const d = new Date(end);
  switch (range) {
    case "last_7_days":
      d.setUTCDate(d.getUTCDate() - 6); // 7 days inclusive of `end`
      break;
    case "last_28_days":
      d.setUTCDate(d.getUTCDate() - 27); // 28 days inclusive of `end`
      break;
    case "last_3_months":
      return subtractUtcMonths(d, 3);
    case "last_6_months":
      return subtractUtcMonths(d, 6);
    case "last_12_months":
      return subtractUtcMonths(d, 12);
  }
  return d;
}

/** Resolve a convenience `dateRange` or explicit start/end into GA4 dates.
 *  `today` is injectable for deterministic tests. */
export function resolveDateRange(
  input: Pick<Ga4ReportInput, "dateRange" | "startDate" | "endDate">,
  today: Date = new Date(),
): { startDate: string; endDate: string } {
  if (input.startDate && input.endDate) {
    return { startDate: input.startDate, endDate: input.endDate };
  }

  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - GA4_DATA_LAG_DAYS);
  const start = subtractRange(end, input.dateRange ?? "last_28_days");
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

/** The same-length period immediately before [startDate, endDate], for the
 *  totals comparison. Dates are YYYY-MM-DD in UTC. */
export function previousPeriod(
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } {
  const dayMs = 24 * 60 * 60 * 1000;
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const lengthMs = Math.max(end - start, 0);
  const prevEnd = start - dayMs;
  const prevStart = prevEnd - lengthMs;
  return {
    startDate: formatUtcDate(prevStart),
    endDate: formatUtcDate(prevEnd),
  };
}

function formatUtcDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Build a GA4 Data API `dimensionFilter` (FilterExpression) from device +
 *  country. Returns `undefined` when neither is set so we don't send an empty
 *  filter. */
function buildDimensionFilter(filter?: Ga4ReportFilter): unknown {
  const expressions: unknown[] = [];
  if (filter?.device) {
    expressions.push({
      filter: {
        fieldName: "deviceCategory",
        stringFilter: { matchType: "EXACT", value: filter.device },
      },
    });
  }
  if (filter?.country) {
    expressions.push({
      filter: {
        fieldName: "country",
        stringFilter: { matchType: "EXACT", value: filter.country },
      },
    });
  }
  if (expressions.length === 0) return undefined;
  if (expressions.length === 1) return expressions[0];
  return { andGroup: { expressions } };
}

/** Build the GA4 Data API `runReport` body from validated input. `today` is
 *  injectable for deterministic tests. */
export function buildReportRequest(
  input: Ga4ReportInput,
  today: Date = new Date(),
): Ga4ReportRequest {
  const { startDate, endDate } = resolveDateRange(input, today);
  const request: Ga4ReportRequest = {
    dateRanges: [{ startDate, endDate }],
    metrics: (input.metrics ?? GA4_METRICS).map((name) => ({ name })),
    limit: clamp(input.limit ?? GA4_DEFAULT_ROW_LIMIT, 1, GA4_MAX_ROW_LIMIT),
  };
  if (input.dimensions && input.dimensions.length > 0) {
    request.dimensions = input.dimensions.map((name) => ({ name }));
  }
  const dimensionFilter = buildDimensionFilter(input.filter);
  if (dimensionFilter) request.dimensionFilter = dimensionFilter;
  if (input.offset && input.offset > 0) request.offset = input.offset;
  if (input.includeTotals) {
    request.metricAggregations = ["TOTAL"];
    // Keep zero-traffic rows out of totals so an empty filter doesn't read as
    // a full dataset.
    request.keepEmptyRows = false;
  }
  return request;
}
