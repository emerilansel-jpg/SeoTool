import type {
  Ga4ReportResponse,
  Ga4ReportRow,
  Ga4ReportTotals,
} from "@/server/lib/ga4Client";
import type { Ga4Metric } from "@/server/features/ga4/analyticsRequest";

/**
 * Pure shaping helpers for the GA4 Insights page. Kept separate from the
 * service/server function so the aggregation and table mapping are unit
 * testable without a GA4 client.
 */

export type Ga4Totals = {
  sessions: number;
  totalUsers: number;
  newUsers: number;
  engagedSessions: number;
  /** 0..1 (engagedSessions / sessions). */
  engagementRate: number;
  /** Average session length in seconds. */
  averageSessionDuration: number;
  screenPageViews: number;
  conversions: number;
};

export type Ga4DimensionRow = {
  key: string;
  metrics: Ga4Totals;
};

export type Ga4TrendPoint = {
  /** ISO date YYYY-MM-DD (parsed from GA4's YYYYMMDD `date` dimension). */
  date: string;
  metrics: Ga4Totals;
};

export const ZERO_GA4_TOTALS: Ga4Totals = {
  sessions: 0,
  totalUsers: 0,
  newUsers: 0,
  engagedSessions: 0,
  engagementRate: 0,
  averageSessionDuration: 0,
  screenPageViews: 0,
  conversions: 0,
};

function metricIndex(
  headers: { name?: string }[] | undefined,
  name: string,
): number {
  if (!headers) return -1;
  return headers.findIndex((header) => header.name === name);
}

function numeric(value: string | undefined): number {
  if (value == null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readValues(source: Ga4ReportTotals | Ga4ReportRow | undefined): {
  dimensionValues: Array<{ value?: string }>;
  metricValues: Array<{ value?: string }>;
} {
  return {
    dimensionValues: source?.dimensionValues ?? [],
    metricValues: source?.metricValues ?? [],
  };
}

/** Read the eight tracked metrics off a row or totals entry, aligned to the
 *  response's `metricHeaders` so the metric order can never drift. */
export function readMetrics(
  response: Ga4ReportResponse,
  source: Ga4ReportTotals | Ga4ReportRow | undefined,
): Ga4Totals {
  const headers = response.metricHeaders;
  const { metricValues } = readValues(source);
  const get = (name: Ga4Metric): number => {
    const idx = metricIndex(headers, name);
    if (idx < 0) return 0;
    return numeric(metricValues[idx]?.value);
  };
  return {
    sessions: get("sessions"),
    totalUsers: get("totalUsers"),
    newUsers: get("newUsers"),
    engagedSessions: get("engagedSessions"),
    engagementRate: get("engagementRate"),
    averageSessionDuration: get("averageSessionDuration"),
    screenPageViews: get("screenPageViews"),
    conversions: get("conversions"),
  };
}

/** Add two totals entry-wise (used to fold a `date` time series into range
 *  totals when no aggregation was requested). */
export function addTotals(a: Ga4Totals, b: Ga4Totals): Ga4Totals {
  const sessions = a.sessions + b.sessions;
  return {
    sessions,
    totalUsers: a.totalUsers + b.totalUsers,
    newUsers: a.newUsers + b.newUsers,
    engagedSessions: a.engagedSessions + b.engagedSessions,
    // engagementRate / averageSessionDuration are ratios/averages, not counts —
    // when folding a series we recompute them from the summed counts below.
    engagementRate:
      sessions > 0 ? (a.engagedSessions + b.engagedSessions) / sessions : 0,
    averageSessionDuration:
      sessions > 0
        ? (a.averageSessionDuration * a.sessions +
            b.averageSessionDuration * b.sessions) /
          sessions
        : 0,
    screenPageViews: a.screenPageViews + b.screenPageViews,
    conversions: a.conversions + b.conversions,
  };
}

/** Range totals from a response: prefer the `TOTAL` aggregation the API returns
 *  when requested; otherwise fold the rows (used for the trend series which has
 *  no aggregation). */
export function sumTotals(response: Ga4ReportResponse): Ga4Totals {
  if (response.totals && response.totals.length > 0) {
    return readMetrics(response, response.totals[0]);
  }
  return (response.rows ?? []).reduce<Ga4Totals>(
    (acc, row) => addTotals(acc, readMetrics(response, row)),
    { ...ZERO_GA4_TOTALS },
  );
}

/** Flatten a single-dimension response into keyed rows with full metrics. */
export function toDimensionRows(
  response: Ga4ReportResponse,
): Ga4DimensionRow[] {
  const output: Ga4DimensionRow[] = [];
  for (const row of response.rows ?? []) {
    const key = row.dimensionValues?.[0]?.value;
    if (!key) continue;
    output.push({ key, metrics: readMetrics(response, row) });
  }
  return output;
}

/** Convert GA4's `date` dimension (YYYYMMDD) into a sorted daily time series. */
export function toTrendPoints(response: Ga4ReportResponse): Ga4TrendPoint[] {
  const points = (response.rows ?? []).map((row) => {
    const raw = row.dimensionValues?.[0]?.value ?? "";
    // GA4 emits "20240101"; normalize to "2024-01-01" for charting/display.
    const date =
      raw.length === 8
        ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
        : raw;
    return { date, metrics: readMetrics(response, row) };
  });
  return points.toSorted((a, b) => a.date.localeCompare(b.date));
}

/** Percent change between two totals, guarded against divide-by-zero. Returns
 *  `null` when the previous value is 0 (no meaningful delta). */
export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}
