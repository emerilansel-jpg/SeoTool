import { CircleHelp, ThumbsUp } from "lucide-react";
import type { AiTrackingSentimentBreakdown } from "@/types/schemas/ai-tracking";

interface Props {
  sentiment: AiTrackingSentimentBreakdown;
}

export function AiTrackingSentimentCard({ sentiment }: Props) {
  const total = sentiment.positive + sentiment.mixed + sentiment.negative + sentiment.neutral;
  const posWidth = total > 0 ? (sentiment.positive / total) * 100 : 100;
  const mixWidth = total > 0 ? (sentiment.mixed / total) * 100 : 0;
  const negWidth = total > 0 ? (sentiment.negative / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-base-content/70">Sentiment Breakdown</p>
        <div
          className="tooltip tooltip-left"
          data-tip="Sentiment analysis of your brand mentions across AI assistant answers"
        >
          <CircleHelp className="size-4 text-base-content/40 cursor-help" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-base-content">
          {sentiment.positivePercent}%
        </span>
        <span className="text-xs text-base-content/60">positive sentiment</span>
      </div>

      {/* Progress bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-200">
        <div
          className="bg-emerald-500 transition-all duration-300"
          style={{ width: `${posWidth}%` }}
        />
        <div
          className="bg-amber-500 transition-all duration-300"
          style={{ width: `${mixWidth}%` }}
        />
        <div
          className="bg-error transition-all duration-300"
          style={{ width: `${negWidth}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-medium text-base-content/70">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          <span>Positive ({sentiment.positive})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500" />
          <span>Mixed ({sentiment.mixed})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-error" />
          <span>Negative ({sentiment.negative})</span>
        </div>
      </div>

      {/* Top Sentiment Insights */}
      {sentiment.topInsights.length > 0 && (
        <div className="mt-3 border-t border-base-200 pt-3">
          <p className="mb-2 text-xs font-semibold text-base-content">
            Top Sentiment Insights
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sentiment.topInsights.slice(0, 4).map((insight) => (
              <div
                key={insight.text}
                className="flex items-center justify-between rounded-lg bg-base-200/50 p-2.5 text-xs hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ThumbsUp className="size-3.5 shrink-0 text-emerald-500" />
                  <span className="truncate text-base-content font-medium">
                    {insight.text}
                  </span>
                </div>
                <span className="badge badge-sm badge-ghost ml-2 font-semibold">
                  ×{insight.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
