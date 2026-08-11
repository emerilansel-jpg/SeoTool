import type { ReactNode } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import type { ContentFlag } from "@/server/features/content-intelligence/contentScore";

/** Color class for a 0-100 score. Mirrors the audit ResultsView thresholds. */
function scoreColorClass(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}

/** Background tint for a 0-100 score badge. */
function scoreBadgeClass(score: number): string {
  if (score >= 90) return "bg-success/10 text-success border-success/30";
  if (score >= 50) return "bg-warning/10 text-warning border-warning/30";
  return "bg-error/10 text-error border-error/30";
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[2.5rem] rounded-md border px-2 py-0.5 text-sm font-semibold tabular-nums ${scoreBadgeClass(score)}`}
    >
      {score}
    </span>
  );
}

/** A compact labeled sub-score bar (0-100). */
export function SubScoreBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-base-content/60">
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-300">
        <div
          className={`h-full ${scoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={`w-7 shrink-0 text-right text-xs tabular-nums ${scoreColorClass(score)}`}
      >
        {score}
      </span>
    </div>
  );
}

function scoreBarColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-error";
}

export type ScoreDistribution = {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
};

export function SummaryCards({
  averageScore,
  total,
  distribution,
}: {
  averageScore: number | null;
  total: number;
  distribution: ScoreDistribution;
}) {
  const items: Array<{ label: string; value: ReactNode; valueClass?: string }> =
    [
      {
        label: "Average score",
        value: averageScore == null ? "-" : String(averageScore),
        valueClass: averageScore == null ? "" : scoreColorClass(averageScore),
      },
      { label: "Pages scored", value: String(total) },
      {
        label: "Excellent (90+)",
        value: String(distribution.excellent),
        valueClass: distribution.excellent > 0 ? "text-success" : undefined,
      },
      {
        label: "Needs work (<50)",
        value: String(distribution.poor),
        valueClass: distribution.poor > 0 ? "text-error" : undefined,
      },
    ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-base-300 bg-base-300/70 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-base-100 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-base-content/50">
            {item.label}
          </p>
          <p
            className={`mt-0.5 text-xl font-semibold tabular-nums ${item.valueClass ?? ""}`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export type AggregatedFlag = ContentFlag & { count: number };

export function TopFlags({ flags }: { flags: AggregatedFlag[] }) {
  if (flags.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm text-base-content/60">
        No recurring content issues across scored pages.
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {flags.map((flag) => (
        <li
          key={flag.code}
          className="flex items-start gap-2 text-sm"
          title={flag.message}
        >
          <FlagIcon severity={flag.severity} />
          <span className="flex-1 text-base-content/80">{flag.message}</span>
          <span className="shrink-0 tabular-nums text-base-content/50">
            {flag.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

function FlagIcon({ severity }: { severity: ContentFlag["severity"] }) {
  if (severity === "critical")
    return <XCircle className="mt-0.5 size-4 shrink-0 text-error" />;
  if (severity === "warning")
    return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />;
  return <Info className="mt-0.5 size-4 shrink-0 text-base-content/40" />;
}
