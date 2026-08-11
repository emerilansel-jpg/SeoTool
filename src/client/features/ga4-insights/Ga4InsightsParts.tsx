// oxlint-disable typescript-eslint/no-unsafe-member-access -- Recharts Tooltip entry is untyped
import { useMemo } from "react";
import {
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import {
  AppDataTable,
  useAppTable,
} from "@/client/components/table/AppDataTable";
import { useChartWidth } from "@/client/features/rank-tracking/RankTrackingTrendChart";
import {
  buildDimensionColumns,
  formatCompact,
  formatCount,
  formatRate,
  toFlatRow,
  type Ga4TableRow,
  type Report,
} from "@/client/features/ga4-insights/Ga4InsightsColumns";
import { buildCsv, downloadCsv, type CsvValue } from "@/client/lib/csv";
import { exportTableToSheets } from "@/client/lib/exportToSheets";
import { captureClientEvent } from "@/client/lib/posthog";
import type { Ga4TableDimension } from "@/types/schemas/ga4";

export type Tab = "pages" | "channels";
export type ExportTarget = "csv" | "sheets";

//---------------------------------------------------------------------------
// Export helpers
//---------------------------------------------------------------------------

type ExportTable = { filename: string; headers: string[]; rows: CsvValue[][] };

const DIMENSION_HEADERS: Record<Ga4TableDimension, string[]> = {
  pages: [
    "Landing page",
    "Sessions",
    "Users",
    "Pageviews",
    "Conversions",
    "Engagement rate",
    "Avg session (s)",
  ],
  channels: [
    "Channel",
    "Sessions",
    "Users",
    "Pageviews",
    "Conversions",
    "Engagement rate",
    "Avg session (s)",
  ],
};

function dimensionExportTable(
  dimension: Ga4TableDimension,
  rows: Ga4TableRow[],
  stamp: string,
): ExportTable {
  return {
    filename: `ga4-insights-${dimension}-${stamp}.csv`,
    headers: DIMENSION_HEADERS[dimension],
    rows: rows.map((row) => [
      row.key,
      row.metrics.sessions,
      row.metrics.totalUsers,
      row.metrics.screenPageViews,
      row.metrics.conversions,
      row.metrics.engagementRate,
      row.metrics.averageSessionDuration,
    ]),
  };
}

function runExport(table: ExportTable, target: ExportTarget): void {
  if (target === "csv") {
    downloadCsv(table.filename, buildCsv(table.headers, table.rows));
    captureClientEvent("data:export", {
      source_feature: "ga4_insights",
      result_count: table.rows.length,
    });
    return;
  }
  void exportTableToSheets({
    headers: table.headers,
    rows: table.rows,
    feature: "ga4_insights",
  });
}

/** Export the full pages/channels dataset (fetched separately, not the visible
 *  page — pagination truncates the download). */
export function exportDimensionRows(
  dimension: Ga4TableDimension,
  rows: Ga4TableRow[],
  range: Report["range"],
  target: ExportTarget,
): void {
  const stamp = `${range.startDate}-to-${range.endDate}`;
  runExport(dimensionExportTable(dimension, rows, stamp), target);
}

//---------------------------------------------------------------------------
// Tab button
//---------------------------------------------------------------------------

export function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`tab ${active ? "tab-active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

//---------------------------------------------------------------------------
// Totals cards
//---------------------------------------------------------------------------

type Delta = { text: string; improved: boolean | null };

function percentDelta(current: number, previous: number): Delta | null {
  if (previous <= 0) return null;
  const change = (current - previous) / previous;
  const pct = (change * 100).toFixed(1);
  return {
    text: `${change >= 0 ? "+" : ""}${pct}%`,
    improved: change > 0,
  };
}

export function TotalsCards({ report }: { report: Report }) {
  const { totals, prevTotals, range } = report;
  const deltaTitle = `vs ${range.prevStartDate} to ${range.prevEndDate}`;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <TotalCard
        label="Sessions"
        value={formatCount(totals.sessions)}
        delta={percentDelta(totals.sessions, prevTotals.sessions)}
        deltaTitle={deltaTitle}
      />
      <TotalCard
        label="Users"
        value={formatCount(totals.totalUsers)}
        delta={percentDelta(totals.totalUsers, prevTotals.totalUsers)}
        deltaTitle={deltaTitle}
      />
      <TotalCard
        label="Pageviews"
        value={formatCount(totals.screenPageViews)}
        delta={percentDelta(totals.screenPageViews, prevTotals.screenPageViews)}
        deltaTitle={deltaTitle}
      />
      <TotalCard
        label="Engagement"
        value={formatRate(totals.engagementRate)}
        delta={percentDelta(totals.engagementRate, prevTotals.engagementRate)}
        deltaTitle={deltaTitle}
      />
    </div>
  );
}

function TotalCard({
  label,
  value,
  delta,
  deltaTitle,
}: {
  label: string;
  value: string;
  delta: Delta | null;
  deltaTitle: string;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-4">
      <div className="text-xs uppercase tracking-wide text-base-content/60">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {delta ? (
          <span
            className={`text-xs ${delta.improved ? "text-success" : delta.improved === false ? "text-error" : "text-base-content/50"}`}
            title={deltaTitle}
          >
            {delta.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}

//---------------------------------------------------------------------------
// Daily sessions trend chart
//---------------------------------------------------------------------------

export function SessionsTrendChart({ trend }: { trend: Report["trend"] }) {
  const { containerRef, width } = useChartWidth();
  const height = 220;
  // Recharts needs flat per-point objects keyed by dataKey.
  const data = useMemo(
    () =>
      trend.map((point) => ({
        date: point.date,
        sessions: point.metrics.sessions,
        users: point.metrics.totalUsers,
      })),
    [trend],
  );

  if (trend.length === 0) {
    return (
      <div className="p-6 text-sm text-base-content/60">
        Not enough data for a trend over this range.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full min-w-0" style={{ height }}>
      {width > 0 ? (
        <LineChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            opacity={0.18}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={{ fontSize: 10, fill: "#888" }}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fontSize: 10, fill: "#888" }}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          <Tooltip
            content={(props: TooltipContentProps<number, string>) => {
              const { active, payload, label } = props;
              if (!active || !payload?.length || typeof label !== "string") {
                return null;
              }
              return (
                <div className="rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs shadow-sm">
                  <div className="font-medium">{label}</div>
                  {payload.map((entry) => (
                    <div
                      key={String(entry.dataKey)}
                      className="text-base-content/70"
                    >
                      {entry.name}: {formatCount(Number(entry.value ?? 0))}
                    </div>
                  ))}
                </div>
              );
            }}
            cursor={{ stroke: "rgba(150,150,150,0.3)" }}
          />
          <Line
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="#4285F4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="users"
            name="Users"
            stroke="#34A853"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      ) : null}
    </div>
  );
}

function formatDateTick(value: string): string {
  // "2024-01-05" → "Jan 5"
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

//---------------------------------------------------------------------------
// Breakdown card (channels + devices)
//---------------------------------------------------------------------------

export function BreakdownCard({
  title,
  rows,
  totalSessions,
  highlightKey,
}: {
  title: string;
  rows: Report["channels"];
  totalSessions: number;
  /** Render this row as the SEO highlight (e.g. Organic Search). */
  highlightKey?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-5">
        <h3 className="mb-2 text-sm font-semibold">{title}</h3>
        <p className="text-sm text-base-content/60">No data for this range.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-5">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2">
        {rows.map((row) => {
          const share =
            totalSessions > 0 ? row.metrics.sessions / totalSessions : 0;
          const isHighlight = highlightKey === row.key;
          return (
            <li key={row.key} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">
                  {isHighlight ? (
                    <span className="font-medium text-success">{row.key}</span>
                  ) : (
                    row.key
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-base-content/60">
                  {formatCount(row.metrics.sessions)}
                  <span className="ml-1.5 text-xs">
                    ({(share * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-base-200">
                <div
                  className={
                    isHighlight ? "h-full bg-success" : "h-full bg-primary/60"
                  }
                  style={{ width: `${Math.max(share * 100, 2)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

//---------------------------------------------------------------------------
// Dimension table (pages / channels, server-paginated)
//---------------------------------------------------------------------------

export function DimensionTable({
  rows,
  keyLabel,
}: {
  rows: Ga4TableRow[];
  keyLabel: string;
}) {
  const columns = useMemo(() => buildDimensionColumns(keyLabel), [keyLabel]);
  const flatRows = useMemo(() => rows.map(toFlatRow), [rows]);
  const table = useAppTable({
    data: flatRows,
    columns,
    withSorting: true,
    initialState: { sorting: [{ id: "sessions", desc: true }] },
  });
  return (
    <AppDataTable
      table={table}
      className="table table-zebra table-sm"
      wrapperClassName="overflow-x-auto"
      empty={
        <p className="p-6 text-sm text-base-content/60">
          No data for this period yet. GA4 data trails up to a day.
        </p>
      }
    />
  );
}
