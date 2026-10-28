import { useMemo, useState } from "react";
import { Eye, Layers, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { getRankConfigTrend } from "@/serverFunctions/rank-tracking";
import {
  formatDateTick,
  TrendRangeToggle,
  useChartWidth,
} from "./RankTrackingTrendChart";

const BUCKETS = [
  { key: "top3", label: "Top 3", color: "#16a34a" },
  { key: "top4to10", label: "4–10", color: "#2563eb" },
  { key: "top11to20", label: "11–20", color: "#f59e0b" },
  { key: "notRanking", label: "Not in top 20", color: "var(--color-neutral)" },
] as const;

/** Narrowed recharts tooltip payload entry. */
interface PayloadEntry {
  dataKey?: string | number;
  value?: number | string | null;
}

export function RankTrackingOverview({
  device,
  projectId,
  configId,
}: {
  device: "desktop" | "mobile";
  projectId: string;
  configId: string;
}) {
  const [sinceDays, setSinceDays] = useState(30);

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ["rankConfigTrend", projectId, configId, device, sinceDays],
    queryFn: () =>
      getRankConfigTrend({
        data: { projectId, configId, device, sinceDays },
      }),
  });

  const chartData = useMemo(() => {
    return (trend ?? []).map((p) => {
      const total = Math.max(
        1,
        p.top3 + p.top4to10 + p.top11to20 + p.notRanking,
      );
      const visibilityScore = Math.min(
        100,
        Math.round(
          ((p.top3 * 100 + p.top4to10 * 35 + p.top11to20 * 8) / total) * 10,
        ) / 10,
      );
      return {
        checkedAt: new Date(p.checkedAt).getTime(),
        visibility: visibilityScore,
        top3: p.top3,
        top4to10: p.top4to10,
        top11to20: p.top11to20,
        notRanking: p.notRanking,
      };
    });
  }, [trend]);

  const leftChart = useChartWidth();
  const rightChart = useChartWidth();

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      {/* Timeframe selector header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Performance & Visibility Analytics
          </span>
        </div>
        <TrendRangeToggle value={sinceDays} onChange={setSinceDays} />
      </div>

      {trendLoading ? (
        <div className="flex items-center justify-center p-12 border border-base-300 rounded-xl bg-base-100">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : chartData.length <= 1 ? (
        <div className="rounded-xl border border-dashed border-base-300 p-8 text-center text-xs text-base-content/60 bg-base-100">
          {chartData.length === 0
            ? "No history yet — run a check to start tracking positions over time."
            : "Only 1 check so far — trend analytics fill in after the next check."}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Search Visibility Over Time */}
          <div className="rounded-xl border border-base-300 bg-base-100 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="size-4 text-primary" />
                <h4 className="text-xs font-bold text-base-content">
                  Search Visibility Over Time
                </h4>
              </div>
              <span className="badge badge-primary badge-outline badge-xs text-[10px] font-semibold">
                CTR Weighted %
              </span>
            </div>

            <div
              ref={leftChart.containerRef}
              className="w-full min-w-0"
              style={{ height: 190 }}
            >
              {leftChart.width > 0 && (
                <LineChart
                  width={leftChart.width}
                  height={190}
                  data={chartData}
                  margin={{ top: 8, right: 12, bottom: 0, left: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    opacity={0.08}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="checkedAt"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={formatDateTick}
                    tick={{ fontSize: 10, fill: "var(--trend-axis-color)" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--trend-axis-color)" }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    unit="%"
                  />
                  <Tooltip
                    content={(props: TooltipContentProps<number, string>) => {
                      const { active, payload, label } = props;
                      if (
                        !active ||
                        !payload?.length ||
                        typeof label !== "number"
                      )
                        return null;
                      const val = payload[0]?.value;
                      return (
                        <div className="rounded-lg border border-base-300 bg-base-100 px-2.5 py-1.5 shadow-md text-xs">
                          <p className="text-[10px] text-base-content/60 font-medium">
                            {new Date(label).toLocaleDateString("id-ID", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="font-bold text-primary tabular-nums mt-0.5">
                            Visibility: {val}%
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visibility"
                    name="Visibility"
                    stroke="var(--color-primary, #6366f1)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "var(--color-primary, #6366f1)" }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </div>
          </div>

          {/* Chart 2: Rank Distribution */}
          <div className="rounded-xl border border-base-300 bg-base-100 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="size-4 text-info" />
                <h4 className="text-xs font-bold text-base-content">
                  Rank Distribution ({sinceDays} Days)
                </h4>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {BUCKETS.map((b) => (
                  <span
                    key={b.key}
                    className="inline-flex items-center gap-1 text-[10px] text-base-content/60"
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <div
              ref={rightChart.containerRef}
              className="w-full min-w-0"
              style={{ height: 190 }}
            >
              {rightChart.width > 0 && (
                <AreaChart
                  width={rightChart.width}
                  height={190}
                  data={chartData}
                  margin={{ top: 8, right: 12, bottom: 0, left: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    opacity={0.08}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="checkedAt"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={formatDateTick}
                    tick={{ fontSize: 10, fill: "var(--trend-axis-color)" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "var(--trend-axis-color)" }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip
                    content={(props: TooltipContentProps<number, string>) => {
                      const { active, payload, label } = props;
                      if (
                        !active ||
                        !payload?.length ||
                        typeof label !== "number"
                      ) {
                        return null;
                      }
                      const byKey = new Map(
                        payload.map((p: PayloadEntry) => [
                          String(p.dataKey),
                          typeof p.value === "number" ? p.value : 0,
                        ]),
                      );
                      return (
                        <DistributionTooltip label={label} byKey={byKey} />
                      );
                    }}
                    cursor={{ stroke: "var(--trend-grid-color)" }}
                  />
                  {BUCKETS.map((b) => (
                    <Area
                      key={b.key}
                      type="monotone"
                      dataKey={b.key}
                      name={b.label}
                      stackId="positions"
                      stroke={b.color}
                      fill={b.color}
                      fillOpacity={0.65}
                      isAnimationActive={false}
                    />
                  ))}
                </AreaChart>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DistributionTooltip({
  label,
  byKey,
}: {
  label: number;
  byKey: Map<string, number>;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 px-3 py-2 space-y-0.5 shadow-md">
      <p className="text-[10px] text-base-content/60 font-medium">
        {new Date(label).toLocaleDateString("id-ID", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      {BUCKETS.map((b) => (
        <p
          key={b.key}
          className="text-xs flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-1.5 text-base-content/70">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: b.color }}
            />
            {b.label}:
          </span>
          <span className="font-bold tabular-nums">
            {byKey.get(b.key) ?? 0}
          </span>
        </p>
      ))}
    </div>
  );
}
