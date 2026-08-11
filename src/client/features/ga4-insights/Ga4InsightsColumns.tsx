import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/client/components/table/SortableHeader";
import type {
  getGa4Report,
  getGa4ReportTable,
} from "@/serverFunctions/ga4Report";

export type Report = Extract<
  Awaited<ReturnType<typeof getGa4Report>>,
  { connected: true }
>;

export type Ga4TableRow = Extract<
  Awaited<ReturnType<typeof getGa4ReportTable>>,
  { connected: true }
>["rows"][number];

const numberFormat = new Intl.NumberFormat("en-US");

export function formatCount(value: number): string {
  return numberFormat.format(Math.round(value));
}

/** Compact count for chart axes / large numbers (1.2k, 3.4M). */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** 0..1 fraction to "12.3%". */
export function formatRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Seconds to "1m 23s" / "45.0s". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${remaining}s`;
}

// Flat projection of a Ga4TableRow used by the table so columns can use
// string-key accessors (which give the header callback a Column, matching how
// SearchPerformanceColumns wires SortableHeader).
export type FlatGa4Row = {
  key: string;
  sessions: number;
  totalUsers: number;
  screenPageViews: number;
  conversions: number;
  engagementRate: number;
  averageSessionDuration: number;
};

export function toFlatRow(row: Ga4TableRow): FlatGa4Row {
  return {
    key: row.key,
    sessions: row.metrics.sessions,
    totalUsers: row.metrics.totalUsers,
    screenPageViews: row.metrics.screenPageViews,
    conversions: row.metrics.conversions,
    engagementRate: row.metrics.engagementRate,
    averageSessionDuration: row.metrics.averageSessionDuration,
  };
}

const rightAligned = {
  headerClassName: "text-right",
  cellClassName: "text-right tabular-nums",
} as const;

const helper = createColumnHelper<FlatGa4Row>();

export function buildDimensionColumns(
  keyLabel: string,
): ColumnDef<FlatGa4Row>[] {
  return [
    helper.accessor("key", {
      enableSorting: false,
      header: keyLabel,
      cell: ({ getValue }) => (
        <span className="block max-w-xl truncate" title={getValue()}>
          {getValue()}
        </span>
      ),
    }),
    helper.accessor("sessions", {
      header: (ctx) => (
        <SortableHeader column={ctx.column} label="Sessions" align="right" />
      ),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned,
    }),
    helper.accessor("totalUsers", {
      header: (ctx) => (
        <SortableHeader column={ctx.column} label="Users" align="right" />
      ),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned,
    }),
    helper.accessor("screenPageViews", {
      header: (ctx) => (
        <SortableHeader column={ctx.column} label="Pageviews" align="right" />
      ),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned,
    }),
    helper.accessor("conversions", {
      header: (ctx) => (
        <SortableHeader column={ctx.column} label="Conversions" align="right" />
      ),
      cell: ({ getValue }) => formatCount(getValue()),
      meta: rightAligned,
    }),
    helper.accessor("engagementRate", {
      header: (ctx) => (
        <SortableHeader column={ctx.column} label="Eng. rate" align="right" />
      ),
      cell: ({ getValue }) => formatRate(getValue()),
      meta: rightAligned,
    }),
    helper.accessor("averageSessionDuration", {
      header: (ctx) => (
        <SortableHeader column={ctx.column} label="Avg session" align="right" />
      ),
      cell: ({ getValue }) => formatDuration(getValue()),
      meta: rightAligned,
    }),
  ];
}
