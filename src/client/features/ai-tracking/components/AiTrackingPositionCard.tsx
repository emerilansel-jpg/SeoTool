import { CircleHelp, Globe } from "lucide-react";
import type {
  AiTrackingCompetitorRanking,
  AiTrackingTrendPoint,
} from "@/types/schemas/ai-tracking";

interface Props {
  brandName: string;
  domain: string;
  averagePosition: number | null;
  averagePositionDelta: number | null;
  positionTrend: AiTrackingTrendPoint[];
  competitors: AiTrackingCompetitorRanking[];
}

export function AiTrackingPositionCard({
  brandName,
  domain,
  averagePosition,
  positionTrend,
  competitors,
}: Props) {
  const targetRankIndex = competitors.findIndex((c) => c.isTargetBrand);
  const targetRank = targetRankIndex >= 0 ? `#${targetRankIndex + 1}` : "#1";

  // Build points for SVG line chart
  const validPoints = positionTrend.filter(
    (p): p is { date: string; position: number } => p.position != null,
  );

  const chartPoints =
    validPoints.length > 0
      ? validPoints
      : [
          { date: "Day 1", position: averagePosition ?? 2.0 },
          { date: "Day 2", position: averagePosition ?? 1.8 },
        ];

  const minPos = 1;
  const maxPos = Math.max(5, ...chartPoints.map((p) => p.position));
  const height = 180;
  const width = 450;
  const paddingX = 40;
  const paddingY = 20;

  const pointsString = chartPoints
    .map((p, i) => {
      const x =
        paddingX +
        (i / Math.max(1, chartPoints.length - 1)) * (width - 2 * paddingX);
      const y =
        paddingY +
        ((p.position - minPos) / Math.max(0.1, maxPos - minPos)) *
          (height - 2 * paddingY);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath =
    chartPoints.length > 0
      ? `M ${paddingX},${height - paddingY} L ${chartPoints
          .map((p, i) => {
            const x =
              paddingX +
              (i / Math.max(1, chartPoints.length - 1)) *
                (width - 2 * paddingX);
            const y =
              paddingY +
              ((p.position - minPos) / Math.max(0.1, maxPos - minPos)) *
                (height - 2 * paddingY);
            return `${x},${y}`;
          })
          .join(" L ")} L ${width - paddingX},${height - paddingY} Z`
      : "";

  return (
    <div className="flex flex-col rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Average Position Trend */}
        <div className="flex flex-col justify-between border-base-300 lg:border-r lg:pr-8">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-medium text-base-content/70">
                Average Position
              </p>
              <div
                className="tooltip tooltip-right"
                data-tip="Average ranking of your domain when it appears in AI answers."
              >
                <CircleHelp className="size-4 text-base-content/40 cursor-help" />
              </div>
            </div>

            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-base-content">
                {averagePosition != null ? averagePosition.toFixed(1) : "—"}
              </span>
              {averagePosition != null && (
                <span className="badge badge-success badge-sm font-semibold">
                  Active
                </span>
              )}
            </div>
            <p className="mb-4 text-xs text-base-content/60">
              Position of {domain || brandName} when it appears in AI answers.
            </p>
          </div>

          <div className="h-52 w-full pt-2">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="size-full overflow-visible"
            >
              <defs>
                <linearGradient
                  id="avgPositionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Grid Lines */}
              <line
                x1={paddingX}
                x2={width - paddingX}
                y1={paddingY}
                y2={paddingY}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                x2={width - paddingX}
                y1={height / 2}
                y2={height / 2}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                x2={width - paddingX}
                y1={height - paddingY}
                y2={height - paddingY}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="3 3"
              />

              {/* Area & Line */}
              {areaPath && (
                <path d={areaPath} fill="url(#avgPositionGradient)" />
              )}
              {pointsString && (
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {chartPoints.map((p, i) => {
                const x =
                  paddingX +
                  (i / Math.max(1, chartPoints.length - 1)) *
                    (width - 2 * paddingX);
                const y =
                  paddingY +
                  ((p.position - minPos) / Math.max(0.1, maxPos - minPos)) *
                    (height - 2 * paddingY);
                return (
                  <circle
                    key={p.date}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#ffffff"
                    stroke="#f97316"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Date labels */}
              {chartPoints.map((p, i) => {
                const x =
                  paddingX +
                  (i / Math.max(1, chartPoints.length - 1)) *
                    (width - 2 * paddingX);
                return (
                  <text
                    key={`lbl-${p.date}`}
                    x={x}
                    y={height - 4}
                    textAnchor="middle"
                    className="text-[10px] fill-base-content/50"
                  >
                    {p.date.length > 5 ? p.date.slice(5) : p.date}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-base-content/70">
                  Average Position Rank
                </p>
                <div
                  className="tooltip tooltip-left"
                  data-tip="Your ranking compared to competitors across AI responses."
                >
                  <CircleHelp className="size-4 text-base-content/40 cursor-help" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold tracking-tight text-base-content">
                {targetRank}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-base-200">
              <table className="table table-xs w-full">
                <thead>
                  <tr className="bg-base-200/50 text-base-content/60">
                    <th className="py-2.5">Domain</th>
                    <th className="py-2.5 text-right">Avg Position</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.slice(0, 6).map((comp, idx) => (
                    <tr
                      key={comp.domain}
                      className={`hover:bg-base-200/30 transition-colors ${comp.isTargetBrand ? "bg-primary/5 font-semibold" : ""}`}
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/40">
                            {idx + 1}.
                          </span>
                          <img
                            src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${comp.domain}&size=32`}
                            alt=""
                            className="size-4 rounded"
                            onError={(e) => {
                              // Hide image on error
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <span className="truncate max-w-[140px] text-xs text-base-content">
                            {comp.domain}
                          </span>
                          {comp.isTargetBrand && (
                            <span className="badge badge-xs badge-primary font-medium">
                              Brand
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right">
                        <span className="text-xs font-semibold text-base-content">
                          {comp.avgPosition > 0
                            ? comp.avgPosition.toFixed(1)
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {competitors.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-4 text-center text-xs text-base-content/50"
                      >
                        No competitor tracking data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 flex justify-end text-xs text-base-content/50">
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3.5" />
              Synced from DataForSEO AI Mentions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
