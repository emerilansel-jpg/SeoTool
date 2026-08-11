import type {
  ContentGapSummary,
  GapTopic,
} from "@/server/features/content-intelligence/contentGap";

function formatInt(value: number): string {
  return value.toLocaleString();
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-base-content/40">{hint}</p>}
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCard
        label="Gap keywords"
        value={formatInt(summary.totalKeywords)}
        hint="Ranked by competitors, not you"
      />
      <SummaryCard
        label="Addressable volume"
        value={formatInt(summary.totalVolume)}
        hint="Total monthly searches"
      />
      <SummaryCard
        label="Avg difficulty"
        value={
          summary.averageDifficulty != null
            ? String(summary.averageDifficulty)
            : "—"
        }
      />
      <SummaryCard
        label="Competitor overlap"
        value={summary.averageCompetitorOverlap.toFixed(1)}
        hint={`Across ${competitorCount} competitor${competitorCount === 1 ? "" : "s"}`}
      />
    </div>
  );
}

/** Colored pill for a DataForSEO keyword-difficulty value (0-100). */
export function DifficultyPill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-base-content/30">—</span>;
  const tone =
    value < 30
      ? "badge-success badge-soft"
      : value < 70
        ? "badge-warning badge-soft"
        : "badge-error badge-soft";
  return <span className={`badge badge-sm ${tone}`}>{value}</span>;
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
    <ul className="space-y-2">
      {topics.map((topic) => (
        <li
          key={topic.topic}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-base-300 bg-base-100 px-3 py-2"
        >
          <span className="font-medium capitalize">{topic.topic}</span>
          <span className="badge badge-ghost badge-sm">
            {topic.keywordCount} keyword{topic.keywordCount === 1 ? "" : "s"}
          </span>
          <span className="text-xs text-base-content/50">
            {formatInt(topic.totalVolume)} searches/mo
          </span>
          <span className="basis-full text-xs text-base-content/40 sm:basis-auto">
            {topic.keywords.join(", ")}
          </span>
        </li>
      ))}
    </ul>
  );
}
