import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KeywordIntelligenceDetail } from "@/server/features/rank-tracking/services/KeywordIntelligenceService";
import { useChartWidth } from "./RankTrackingTrendChart";

export function KeywordDistributionChart({
  detail,
}: {
  detail: KeywordIntelligenceDetail;
}) {
  const { containerRef, width: chartWidth } = useChartWidth();

  const dist = detail.rankDistribution30d;
  const distTotal =
    dist.top3 + dist.pos4_10 + dist.pos11_20 + dist.pos21_50 + dist.pos51_100;

  const distTop3Pct =
    distTotal > 0 ? Math.round((dist.top3 / distTotal) * 100) : 0;
  const dist4to10Pct =
    distTotal > 0 ? Math.round((dist.pos4_10 / distTotal) * 100) : 0;
  const dist11to20Pct =
    distTotal > 0 ? Math.round((dist.pos11_20 / distTotal) * 100) : 0;
  const dist21to50Pct =
    distTotal > 0 ? Math.round((dist.pos21_50 / distTotal) * 100) : 0;
  const dist51to100Pct = Math.max(
    0,
    100 - distTop3Pct - dist4to10Pct - dist11to20Pct - dist21to50Pct,
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left Chart: Search Visibility Over Time */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 lg:col-span-2 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-base-content">
              Search Visibility Over Time
            </h3>
            <p className="text-xs text-base-content/60">
              Visibility Score (%) calculated from CTR rank weight
            </p>
          </div>
          <span className="badge badge-sm badge-outline">
            {detail.visibilityHistory.length} checkpoints
          </span>
        </div>

        <div ref={containerRef} className="h-56 w-full pt-2">
          {chartWidth > 0 && detail.visibilityHistory.length > 0 ? (
            <LineChart
              width={chartWidth}
              height={210}
              data={detail.visibilityHistory}
              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.4}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as {
                    date: string;
                    score: number;
                    position: number | null;
                  };
                  return (
                    <div className="rounded-lg border border-base-300 bg-base-100 p-2.5 shadow-md text-xs space-y-1">
                      <p className="font-semibold">{p.date}</p>
                      <p className="text-primary font-bold">
                        Visibility: {p.score}%
                      </p>
                      <p className="text-base-content/70">
                        Rank: {p.position ? `#${p.position}` : "Not in Top 100"}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#6366f1" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-base-content/50">
              Not enough check history to plot visibility curve.
            </div>
          )}
        </div>
      </div>

      {/* Right Chart: Rank Distribution (30 Days) */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-base-content">
            Rank Distribution (30 Days)
          </h3>
          <p className="text-xs text-base-content/60">
            Daily position breakdown across tiers
          </p>
        </div>

        {/* Stacked Distribution Bar */}
        <div className="h-6 w-full overflow-hidden rounded-lg bg-base-200 flex">
          {distTop3Pct > 0 && (
            <div
              style={{ width: `${distTop3Pct}%` }}
              className="bg-emerald-500 transition-all"
              title={`Top 3: ${dist.top3} days (${distTop3Pct}%)`}
            />
          )}
          {dist4to10Pct > 0 && (
            <div
              style={{ width: `${dist4to10Pct}%` }}
              className="bg-blue-500 transition-all"
              title={`4–10: ${dist.pos4_10} days (${dist4to10Pct}%)`}
            />
          )}
          {dist11to20Pct > 0 && (
            <div
              style={{ width: `${dist11to20Pct}%` }}
              className="bg-amber-500 transition-all"
              title={`11–20: ${dist.pos11_20} days (${dist11to20Pct}%)`}
            />
          )}
          {dist21to50Pct > 0 && (
            <div
              style={{ width: `${dist21to50Pct}%` }}
              className="bg-purple-500 transition-all"
              title={`21–50: ${dist.pos21_50} days (${dist21to50Pct}%)`}
            />
          )}
          {dist51to100Pct > 0 && (
            <div
              style={{ width: `${dist51to100Pct}%` }}
              className="bg-base-300 transition-all"
              title={`51+: ${dist.pos51_100} days (${dist51to100Pct}%)`}
            />
          )}
        </div>

        {/* Tier Legends & Counts */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span>Top 3</span>
            </span>
            <span className="font-mono font-semibold">
              {dist.top3} days ({distTop3Pct}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-blue-500" />
              <span>Pos 4–10</span>
            </span>
            <span className="font-mono font-semibold">
              {dist.pos4_10} days ({dist4to10Pct}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span>Pos 11–20</span>
            </span>
            <span className="font-mono font-semibold">
              {dist.pos11_20} days ({dist11to20Pct}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-purple-500" />
              <span>Pos 21–50</span>
            </span>
            <span className="font-mono font-semibold">
              {dist.pos21_50} days ({dist21to50Pct}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-base-300" />
              <span>Pos 51–100 / Unranked</span>
            </span>
            <span className="font-mono font-semibold">
              {dist.pos51_100} days ({dist51to100Pct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
