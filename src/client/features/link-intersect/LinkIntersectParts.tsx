import type { IntersectSummary } from "@/server/features/link-intersect/services/linkIntersectTypes";

function formatInt(value: number | null | undefined): string {
  if (value == null) return "—";
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

export function IntersectSummaryCards({
  summary,
  competitorCount,
}: {
  summary: IntersectSummary;
  competitorCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCard
        label="Linking domains"
        value={formatInt(summary.totalDomains)}
        hint="Not linking to you"
      />
      <SummaryCard
        label="Avg rank"
        value={formatInt(summary.avgRank)}
        hint="Domain authority (0-100)"
      />
      <SummaryCard
        label="Avg backlinks"
        value={formatInt(summary.avgBacklinks)}
      />
      <SummaryCard
        label="Competitors"
        value={String(competitorCount)}
        hint={`Across ${competitorCount} competitor${competitorCount === 1 ? "" : "s"}`}
      />
    </div>
  );
}
