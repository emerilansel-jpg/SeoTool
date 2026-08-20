import type {
  ContentGapSummary,
  GapTopic,
} from "@/server/features/content-intelligence/contentGap";
import { Layers, Search, Sparkles, TrendingUp } from "lucide-react";

function formatInt(value: number): string {
  return value.toLocaleString();
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="card bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xs transition-all hover:border-base-content/20">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
          {label}
        </p>
        {Icon && (
          <div className="flex size-7 items-center justify-center rounded-lg bg-base-200 text-base-content/70">
            <Icon className="size-3.5" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-base-content">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-base-content/60 truncate">{hint}</p>
      )}
    </div>
  );
}

export function GapSummaryCards({
  summary,
  competitorCount,
}: {
  summary: ContentGapSummary;
  competitorCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        label="Gap Keywords"
        value={formatInt(summary.totalKeywords)}
        hint="Ranked by competitors, not you"
        icon={Search}
      />
      <SummaryCard
        label="Addressable Volume"
        value={formatInt(summary.totalVolume)}
        hint="Total monthly searches"
        icon={TrendingUp}
      />
      <SummaryCard
        label="Avg Difficulty"
        value={
          summary.averageDifficulty != null
            ? String(summary.averageDifficulty)
            : "—"
        }
        hint="Scale of 0-100"
        icon={Sparkles}
      />
      <SummaryCard
        label="Competitor Overlap"
        value={summary.averageCompetitorOverlap.toFixed(1)}
        hint={`Across ${competitorCount} competitor${competitorCount === 1 ? "" : "s"}`}
        icon={Layers}
      />
    </div>
  );
}

/** Colored pill for a DataForSEO keyword-difficulty value (0-100). */
export function DifficultyPill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-base-content/30">—</span>;
  const tone =
    value < 30
      ? "badge-success badge-soft text-success"
      : value < 70
        ? "badge-warning badge-soft text-warning"
        : "badge-error badge-soft text-error";
  return (
    <span className={`badge badge-sm font-semibold ${tone}`}>{value}</span>
  );
}

export function TopicList({ topics }: { topics: GapTopic[] }) {
  if (topics.length === 0) {
    return (
      <p className="text-sm text-base-content/50">
        No topic clusters — add competitors and run the analysis.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {topics.map((topic) => (
        <div
          key={topic.topic}
          className="flex flex-col justify-between gap-2 rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-xs transition-all hover:border-base-content/20"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm capitalize text-base-content truncate">
              {topic.topic}
            </span>
            <span className="badge badge-primary badge-soft badge-sm font-semibold shrink-0">
              {topic.keywordCount} kw{topic.keywordCount === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-xs text-base-content/50 line-clamp-1">
            {topic.keywords.join(", ")}
          </p>
          <div className="text-xs font-semibold text-base-content/70">
            {formatInt(topic.totalVolume)} searches/mo
          </div>
        </div>
      ))}
    </div>
  );
}
