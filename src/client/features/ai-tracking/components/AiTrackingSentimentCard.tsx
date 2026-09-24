import { CircleHelp, Minus, Scale, ThumbsDown, ThumbsUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  AiTrackingSentiment,
  AiTrackingSentimentBreakdown,
} from "@/types/schemas/ai-tracking";

interface Props {
  sentiment: AiTrackingSentimentBreakdown;
}

const SENTIMENT_META: Record<
  AiTrackingSentiment,
  {
    label: string;
    Icon: LucideIcon;
    barClass: string;
    badgeClass: string;
    iconClass: string;
  }
> = {
  positive: {
    label: "Positive",
    Icon: ThumbsUp,
    barClass: "bg-emerald-500",
    badgeClass: "badge-success",
    iconClass: "text-emerald-500",
  },
  mixed: {
    label: "Mixed",
    Icon: Scale,
    barClass: "bg-amber-500",
    badgeClass: "badge-warning",
    iconClass: "text-amber-500",
  },
  neutral: {
    label: "Neutral",
    Icon: Minus,
    barClass: "bg-slate-400",
    badgeClass: "badge-ghost",
    iconClass: "text-slate-500",
  },
  negative: {
    label: "Negative",
    Icon: ThumbsDown,
    barClass: "bg-error",
    badgeClass: "badge-error",
    iconClass: "text-error",
  },
};

export function AiTrackingSentimentCard({ sentiment }: Props) {
  const categories = [
    {
      key: "positive" as const,
      count: sentiment.positive,
      percent: sentiment.positivePercent,
    },
    {
      key: "mixed" as const,
      count: sentiment.mixed,
      percent: sentiment.mixedPercent,
    },
    {
      key: "neutral" as const,
      count: sentiment.neutral,
      percent: sentiment.neutralPercent,
    },
    {
      key: "negative" as const,
      count: sentiment.negative,
      percent: sentiment.negativePercent,
    },
  ];
  const dominant =
    sentiment.total > 0
      ? categories.reduce((best, current) =>
          current.count > best.count ? current : best,
        )
      : null;

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-base-content/70">
            Sentiment Breakdown
          </p>
          <p className="mt-0.5 text-xs text-base-content/50">
            Keyword-based estimate from tracked mention context.
          </p>
        </div>
        <div
          className="tooltip tooltip-left"
          data-tip="Uses positive and negative keywords near each brand mention. Neutral means no clear positive or negative keyword signal."
        >
          <CircleHelp className="size-4 cursor-help text-base-content/40" />
        </div>
      </div>

      {dominant ? (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-base-content">
              {dominant.percent}%
            </span>
            <span className="text-xs font-semibold text-base-content/70">
              {SENTIMENT_META[dominant.key].label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-base-content/60">
            {dominant.key === "neutral"
              ? `Factual brand mentions (${dominant.percent}%) without strong positive/negative bias across ${sentiment.total} tracked response${sentiment.total === 1 ? "" : "s"}.`
              : `Largest group across ${sentiment.total} tracked mention${sentiment.total === 1 ? "" : "s"}.`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-base-300 px-4 py-5 text-center">
          <p className="text-sm font-medium text-base-content/60">
            No tracked brand mentions yet.
          </p>
          <p className="mt-1 text-xs text-base-content/45">
            Run tracking to collect mention sentiment.
          </p>
        </div>
      )}

      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-200"
        aria-label={`${sentiment.total} mentions classified by sentiment`}
      >
        {sentiment.total > 0 &&
          categories.map((category) => (
            <div
              key={category.key}
              className={`${SENTIMENT_META[category.key].barClass} transition-all duration-300`}
              style={{
                width: `${(category.count / sentiment.total) * 100}%`,
              }}
            />
          ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-base-content/70 sm:grid-cols-4">
        {categories.map((category) => {
          const meta = SENTIMENT_META[category.key];
          const Icon = meta.Icon;
          return (
            <div
              key={category.key}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-base-200/50 px-2 sm:px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs"
            >
              <Icon
                className={`size-3 sm:size-3.5 shrink-0 ${meta.iconClass}`}
              />
              <span className="truncate">
                {meta.label} ({category.count} · {category.percent}%)
              </span>
            </div>
          );
        })}
      </div>

      {sentiment.topInsights.length > 0 && (
        <div className="mt-1 border-t border-base-200 pt-4">
          <p className="mb-2 text-xs font-semibold text-base-content">
            Mention Evidence
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sentiment.topInsights.slice(0, 4).map((insight) => {
              const meta = SENTIMENT_META[insight.sentiment];
              const Icon = meta.Icon;
              return (
                <div
                  key={`${insight.sentiment}-${insight.text}`}
                  className="flex items-start gap-2.5 rounded-lg border border-base-200/80 bg-base-200/40 p-2.5 sm:p-3 text-xs shadow-2xs"
                >
                  <Icon
                    className={`mt-0.5 size-3.5 shrink-0 ${meta.iconClass}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="leading-relaxed text-base-content/90 font-normal">
                      “{insight.text}”
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`badge badge-xs font-semibold ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] font-medium text-base-content/60">
                        {insight.count} occurrence
                        {insight.count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
