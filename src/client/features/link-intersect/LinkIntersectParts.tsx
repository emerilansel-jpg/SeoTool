import type { IntersectSummary } from "@/server/features/link-intersect/services/linkIntersectTypes";
import { Award, Globe, Layers, Link as LinkIcon } from "lucide-react";

function formatInt(value: number | null | undefined): string {
  if (value == null) return "—";
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

export function IntersectSummaryCards({
  summary,
  competitorCount,
}: {
  summary: IntersectSummary;
  competitorCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        label="Linking Domains"
        value={formatInt(summary.totalDomains)}
        hint="Not linking to you"
        icon={Globe}
      />
      <SummaryCard
        label="Avg Rank"
        value={formatInt(summary.avgRank)}
        hint="Domain authority (0-100)"
        icon={Award}
      />
      <SummaryCard
        label="Avg Backlinks"
        value={formatInt(summary.avgBacklinks)}
        hint="Per referring domain"
        icon={LinkIcon}
      />
      <SummaryCard
        label="Competitors"
        value={String(competitorCount)}
        hint={`Across ${competitorCount} competitor${competitorCount === 1 ? "" : "s"}`}
        icon={Layers}
      />
    </div>
  );
}
