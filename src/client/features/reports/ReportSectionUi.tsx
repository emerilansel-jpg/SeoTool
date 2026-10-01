import type { ReactNode } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Completeness } from "./reportData";

export function ReportSectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <header className="border-b border-base-300 bg-base-200/40 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-base-content/55">{subtitle}</p>
        ) : null}
      </header>
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
  );
}

export function Metric({
  label,
  value,
  previous,
  lowerIsBetter = false,
}: {
  label: string;
  value: string;
  previous?: string;
  lowerIsBetter?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-base-300 bg-base-200/30 p-3">
      <div className="text-xs text-base-content/55">{label}</div>
      <div className="mt-1 truncate text-lg font-semibold tabular-nums">
        {value}
      </div>
      {previous ? (
        <div className="mt-0.5 text-[11px] text-base-content/50">
          Previous: {previous}
          {lowerIsBetter ? " (lower is better)" : ""}
        </div>
      ) : null}
    </div>
  );
}

export type TableColumn<Row> = {
  label: string;
  render: (row: Row) => ReactNode;
  align?: "left" | "right";
};

export function CompactTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  emptyText = "No detail rows available for this period.",
}: {
  caption: string;
  columns: Array<TableColumn<Row>>;
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  emptyText?: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
        {caption}
      </h4>
      {rows.length === 0 ? (
        <EmptyDetail>{emptyText}</EmptyDetail>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-sm min-w-[560px]">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.label}
                    className={
                      column.align === "right" ? "text-right" : undefined
                    }
                    scope="col"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={rowKey(row, index)}>
                  {columns.map((column) => (
                    <td
                      key={column.label}
                      className={
                        column.align === "right"
                          ? "text-right tabular-nums"
                          : "max-w-[300px]"
                      }
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function TrendChart({
  title,
  data,
  series,
}: {
  title: string;
  data: Array<Record<string, string | number | undefined>>;
  series: Array<{ key: string; label: string; color: string }>;
}) {
  if (data.length < 2 || series.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
        {title}
      </h4>
      <div className="h-44 w-full" role="img" aria-label={`${title} chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip />
            {series.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CompletenessNote({ value }: { value?: Completeness }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-base-300 bg-base-200/30 p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{value.label}</span>
        {value.percent !== undefined ? (
          <span className="tabular-nums text-base-content/60">
            {Math.max(0, Math.min(100, value.percent)).toFixed(0)}%
          </span>
        ) : null}
      </div>
      {value.percent !== undefined ? (
        <progress
          className="progress progress-primary mt-2 h-1.5 w-full"
          value={Math.max(0, Math.min(100, value.percent))}
          max={100}
          aria-label={value.label}
        />
      ) : null}
      {value.detail ? (
        <p className="mt-1.5 text-base-content/55">{value.detail}</p>
      ) : null}
    </div>
  );
}

export function EmptyDetail({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-base-300 px-3 py-4 text-xs text-base-content/50">
      {children}
    </p>
  );
}
