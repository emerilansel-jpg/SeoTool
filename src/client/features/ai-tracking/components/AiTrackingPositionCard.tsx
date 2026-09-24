import { CircleHelp, Globe } from "lucide-react";
import type {
  AiTrackingCompetitorRanking,
  AiTrackingTrendPoint,
} from "@/types/schemas/ai-tracking";

interface Props {
  brandName: string;
  domain: string;
  averageListPosition: number | null;
  listPositionSamples: number;
  brandMentions: number;
  positionTrend: AiTrackingTrendPoint[];
  competitors: AiTrackingCompetitorRanking[];
}

export function AiTrackingPositionCard({
  brandName,
  domain,
  averageListPosition,
  listPositionSamples,
  brandMentions,
  positionTrend,
  competitors,
}: Props) {
  const target = competitors.find((competitor) => competitor.isTargetBrand);
  const targetRankIndex = competitors.findIndex(
    (competitor) => competitor.isTargetBrand,
  );
  const targetRank =
    target && target.mentionsCount > 0 && targetRankIndex >= 0
      ? `#${targetRankIndex + 1}`
      : "—";
  const topCompetitors = competitors.slice(0, 6);
  const displayedCompetitors =
    target && !topCompetitors.some((competitor) => competitor.isTargetBrand)
      ? [...topCompetitors.slice(0, 5), target]
      : topCompetitors;

  const validPoints = positionTrend.filter(
    (point): point is { date: string; position: number } =>
      point.position != null,
  );
  const chartPoints =
    validPoints.length > 0
      ? validPoints
      : averageListPosition != null
        ? [{ date: "Current", position: averageListPosition }]
        : [];
  const minPosition = 1;
  const maxPosition = Math.max(
    5,
    ...chartPoints.map((point) => point.position),
  );
  const height = 180;
  const width = 450;
  const paddingX = 40;
  const paddingY = 20;
  const plottedPoints = chartPoints.map((point, index) => ({
    ...point,
    x:
      paddingX +
      (index / Math.max(1, chartPoints.length - 1)) * (width - 2 * paddingX),
    y:
      paddingY +
      ((point.position - minPosition) /
        Math.max(0.1, maxPosition - minPosition)) *
        (height - 2 * paddingY),
  }));
  const pointsString = plottedPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const areaPath =
    plottedPoints.length > 1
      ? `M ${paddingX},${height - paddingY} L ${plottedPoints
          .map((point) => `${point.x},${point.y}`)
          .join(" L ")} L ${width - paddingX},${height - paddingY} Z`
      : "";

  return (
    <div className="flex flex-col rounded-xl border border-base-300 bg-base-100 p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        <div className="flex flex-col justify-between border-base-300 lg:border-r lg:pr-8">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-medium text-base-content/70">
                Detected List Position
              </p>
              <div
                className="tooltip tooltip-right"
                data-tip="Average position only when your brand appears in a numbered ranking list. Prose mentions have no list position."
              >
                <CircleHelp className="size-4 cursor-help text-base-content/40" />
              </div>
            </div>

            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-base-content">
                {averageListPosition != null
                  ? averageListPosition.toFixed(1)
                  : "—"}
              </span>
              <span className="badge badge-outline badge-sm font-semibold">
                {listPositionSamples} ranked-list sample
                {listPositionSamples === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mb-3 sm:mb-4 text-xs text-base-content/60 leading-relaxed">
              Average numbered-list position for {domain || brandName}, measured
              from {listPositionSamples} of {brandMentions} tracked mention
              {brandMentions === 1 ? "" : "s"}.
            </p>
          </div>

          {plottedPoints.length === 0 ? (
            <div className="flex h-40 sm:h-52 w-full flex-col items-center justify-center rounded-lg border border-dashed border-base-300 p-4 sm:px-6 text-center">
              <p className="text-xs font-medium text-base-content/60 leading-relaxed">
                {brandMentions > 0
                  ? `${brandMentions} tracked mentions found, but 0 ranked-list samples were available.`
                  : "No tracked brand mentions yet."}
              </p>
              <p className="mt-1 text-[11px] text-base-content/45 leading-relaxed">
                List position appears only when an answer contains a numbered
                ranking.
              </p>
            </div>
          ) : (
            <div className="h-40 sm:h-52 w-full pt-2">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="size-full overflow-visible"
                role="img"
                aria-label="Detected list position history"
              >
                <defs>
                  <linearGradient
                    id="listPositionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[paddingY, height / 2, height - paddingY].map((y) => (
                  <line
                    key={y}
                    x1={paddingX}
                    x2={width - paddingX}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeDasharray="3 3"
                  />
                ))}
                {areaPath && (
                  <path d={areaPath} fill="url(#listPositionGradient)" />
                )}
                {plottedPoints.length > 1 && (
                  <polyline
                    points={pointsString}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {plottedPoints.map((point) => (
                  <circle
                    key={point.date}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#f97316"
                    strokeWidth="2"
                  />
                ))}
                {plottedPoints.map((point) => (
                  <text
                    key={`label-${point.date}`}
                    x={point.x}
                    y={height - 4}
                    textAnchor="middle"
                    className="fill-base-content/50 text-[10px]"
                  >
                    {point.date.length > 5 ? point.date.slice(5) : point.date}
                  </text>
                ))}
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between border-t border-base-200/80 pt-6 lg:border-t-0 lg:pt-0">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-medium text-base-content/70">
                Tracked Mention Rank
              </p>
              <div
                className="tooltip tooltip-left"
                data-tip="Brands ranked by how many tracked AI responses mention them."
              >
                <CircleHelp className="size-4 cursor-help text-base-content/40" />
              </div>
            </div>

            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
                {targetRank}
              </span>
              <span className="text-xs text-base-content/50">
                by tracked mentions
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-base-200">
              <table className="table table-xs w-full min-w-[280px]">
                <thead>
                  <tr className="bg-base-200/50 text-base-content/60">
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-2.5 text-right">Mentions</th>
                    <th className="py-2.5 px-3 text-right">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCompetitors.map((competitor) => {
                    const rank = competitors.findIndex(
                      (item) => item.domain === competitor.domain,
                    );
                    return (
                      <tr
                        key={competitor.domain}
                        className={`transition-colors hover:bg-base-200/30 ${competitor.isTargetBrand ? "bg-primary/5 font-semibold" : ""}`}
                      >
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-base-content/40">
                              {competitor.mentionsCount > 0
                                ? `${rank + 1}.`
                                : "—"}
                            </span>
                            <img
                              src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${competitor.domain}&size=32`}
                              alt=""
                              className="size-4 rounded shrink-0"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                            <span className="max-w-[130px] sm:max-w-[180px] truncate text-xs text-base-content">
                              {competitor.domain}
                            </span>
                            {competitor.isTargetBrand && (
                              <span className="badge badge-primary badge-xs font-medium shrink-0">
                                Brand
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-right text-xs font-semibold text-base-content">
                          {competitor.mentionsCount}
                        </td>
                        <td className="py-2 px-3 text-right text-xs font-semibold text-base-content">
                          {competitor.visibilityPct}%
                        </td>
                      </tr>
                    );
                  })}
                  {displayedCompetitors.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-xs text-base-content/50"
                      >
                        No tracked brand or competitor mentions yet.
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
              Derived from tracked AI responses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
