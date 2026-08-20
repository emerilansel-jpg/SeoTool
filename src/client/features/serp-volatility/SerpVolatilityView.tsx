// oxlint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  RefreshCw,
} from "lucide-react";
import {
  computeSerpVolatility,
  getSerpVolatility,
} from "@/serverFunctions/serp-volatility";
import { VolatilityChart } from "./VolatilityChart";

type TopMover = {
  keyword: string;
  currentPosition: number | null;
  previousPosition: number | null;
  change: number;
};

function scoreColor(score: number): string {
  if (score < 20) return "text-success";
  if (score < 50) return "text-warning";
  if (score < 80) return "text-error";
  return "text-error";
}

function scoreRingColor(score: number): string {
  if (score < 20) return "stroke-success";
  if (score < 50) return "stroke-warning";
  if (score < 80) return "stroke-error";
  return "stroke-error";
}

function categoryBadgeClass(score: number): string {
  if (score < 20) return "badge-success";
  if (score < 50) return "badge-warning";
  if (score < 80) return "badge-error";
  return "badge-error";
}

function MoverArrow({ change }: { change: number }) {
  if (change > 0)
    return <ArrowUpRight className="inline h-4 w-4 text-success" />;
  if (change < 0)
    return <ArrowDownRight className="inline h-4 w-4 text-error" />;
  return <Minus className="inline h-4 w-4 text-base-content/40" />;
}

/** Circular gauge for the latest volatility score. */
function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="8"
          className="stroke-base-200"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={scoreRingColor(score)}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${scoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
        <span className="text-xs text-base-content/60">/ 100</span>
      </div>
    </div>
  );
}

export function SerpVolatilityView({ projectId }: { projectId: string }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["serp-volatility", projectId],
    queryFn: () => getSerpVolatility({ data: { projectId } }),
  });

  const computeMutation = useMutation({
    mutationFn: () => computeSerpVolatility({ data: { projectId } }),
    onSuccess: () => refetch(),
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to compute SERP volatility"),
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const latest = data?.latest;
  const trend = data?.trend ?? [];

  return (
    <div className="space-y-6">
      {/* Header + compute button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base-content/70">
          <Activity className="size-4 text-primary" />
          <span className="text-sm font-medium">
            Measured from rank tracking position changes
          </span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-primary gap-2 font-semibold shadow-xs"
          onClick={() => computeMutation.mutate()}
          disabled={computeMutation.isPending}
        >
          {computeMutation.isPending ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {computeMutation.isPending ? "Computing..." : "Compute Volatility"}
        </button>
      </div>

      {/* Latest score gauge */}
      {latest ? (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs">
            <div className="card-body items-center text-center p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                Current Volatility
              </h2>
              <div className="relative flex items-center justify-center my-2">
                <ScoreGauge score={latest.volatilityScore} />
              </div>
              <span
                className={`badge badge-sm font-semibold ${categoryBadgeClass(latest.volatilityScore)}`}
              >
                {latest.category}
              </span>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs">
            <div className="card-body p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                Summary
              </h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-base-content/60">Date</dt>
                  <dd className="font-mono text-xs">{latest.date}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-base-content/60">Keywords sampled</dt>
                  <dd className="font-semibold tabular-nums">
                    {latest.keywordsSampled}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-base-content/60">Avg position change</dt>
                  <dd className="font-semibold tabular-nums">
                    {latest.avgPositionChange.toFixed(1)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs">
            <div className="card-body p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                Top Movers
              </h2>
              {latest.topMovers && latest.topMovers.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {latest.topMovers.map((mover: TopMover) => (
                    <li key={mover.keyword} className="flex items-center gap-2">
                      <MoverArrow change={mover.change} />
                      <span className="truncate flex-1">{mover.keyword}</span>
                      <span className="font-mono text-xs font-semibold tabular-nums">
                        {mover.change > 0 ? "+" : ""}
                        {mover.change}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-base-content/60">
                  No movers detected
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60 space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <Activity className="size-6" />
          </div>
          <p className="text-base font-bold text-base-content">
            No volatility data computed yet
          </p>
          <p className="text-sm text-base-content/70 max-w-md mx-auto">
            SERP volatility tracks rank fluctuations across your tracked
            keywords. Click &quot;Compute Volatility&quot; after running at
            least two rank checks.
          </p>
        </div>
      )}

      {/* 30-day trend chart */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-base-300 bg-base-200/20">
          <h2 className="text-sm font-bold tracking-tight text-base-content">
            30-Day Volatility Trend
          </h2>
        </div>
        <div className="p-5">
          <VolatilityChart rows={trend} />
        </div>
      </div>
    </div>
  );
}
