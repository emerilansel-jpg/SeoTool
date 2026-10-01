import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function scoreColor(score: number): string {
  if (score < 20) return "text-success";
  if (score < 50) return "text-warning";
  return "text-error";
}

export function scoreRingColor(score: number): string {
  if (score < 20) return "stroke-success";
  if (score < 50) return "stroke-warning";
  return "stroke-error";
}

export function categoryBadgeClass(score: number): string {
  if (score < 20) return "badge-success badge-soft text-success";
  if (score < 50) return "badge-warning badge-soft text-warning";
  return "badge-error badge-soft text-error";
}

export function formatLastComputed(iso: string | null | undefined): string {
  if (!iso) return "Not computed yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function describeMoverStatus(
  status: string | undefined,
  current: number | null | undefined,
  previous: number | null | undefined,
): string {
  if (status === "new" || (previous == null && current != null)) {
    return `New at #${current}`;
  }
  if (status === "dropped" || (previous != null && current == null)) {
    return `Dropped from #${previous}`;
  }
  if (current != null && previous != null) {
    return `#${previous} to #${current}`;
  }
  return "Position shifted";
}

export function MoverArrow({ change }: { change: number }) {
  if (change > 0) {
    return <ArrowUpRight className="inline h-4 w-4 text-success shrink-0" />;
  }
  if (change < 0) {
    return <ArrowDownRight className="inline h-4 w-4 text-error shrink-0" />;
  }
  return <Minus className="inline h-4 w-4 text-base-content/40 shrink-0" />;
}

/** Circular gauge for the latest volatility score. */
export function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="10"
          className="stroke-base-200"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${scoreRingColor(score)} transition-all duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`text-3xl font-extrabold tracking-tight tabular-nums ${scoreColor(score)}`}
        >
          {score.toFixed(1)}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40">
          Index
        </span>
      </div>
    </div>
  );
}
