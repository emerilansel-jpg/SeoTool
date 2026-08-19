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
      <div className="flex items-center gap-2 py-8 text-base-content/60">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Loading volatility data...
      </div>
    );
  }

  const latest = data?.latest;
  const trend = data?.trend ?? [];

  return (
    <div className="space-y-6">
      {/* Header + compute button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-base-content/60">
          <Activity className="h-5 w-5" />
          <span className="text-sm">
            Measured from rank tracking position changes
          </span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => computeMutation.mutate()}
          disabled={computeMutation.isPending}
        >
          {computeMutation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {computeMutation.isPending ? "Computing..." : "Compute Now"}
        </button>
      </div>

      {/* Latest score gauge */}
      {latest ? (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-sm">Current Volatility</h2>
              <div className="relative flex items-center justify-center">
                <ScoreGauge score={latest.volatilityScore} />
              </div>
              <span
                className={`badge ${categoryBadgeClass(latest.volatilityScore)}`}
              >
                {latest.category}
              </span>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-sm">Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-base-content/60">Date</dt>
                  <dd className="font-mono">{latest.date}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-base-content/60">Keywords sampled</dt>
                  <dd>{latest.keywordsSampled}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-base-content/60">Avg position change</dt>
                  <dd>{latest.avgPositionChange.toFixed(1)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-sm">Top Movers</h2>
              {latest.topMovers && latest.topMovers.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {latest.topMovers.map((mover: TopMover) => (
                    <li key={mover.keyword} className="flex items-center gap-2">
                      <MoverArrow change={mover.change} />
                      <span className="truncate">{mover.keyword}</span>
                      <span className="ml-auto font-mono text-xs">
                        {mover.change > 0 ? "+" : ""}
                        {mover.change}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-base-content/60">No movers data</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-base-300 p-8 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-base-content/30" />
          <p className="text-base-content/60">
            No volatility data computed yet.
          </p>
          <p className="text-sm text-base-content/40">
            Click "Compute Now" after completing at least two rank checks.
          </p>
        </div>
      )}

      {/* 30-day trend chart */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">30-Day Trend</h2>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <VolatilityChart rows={trend} />
          </div>
        </div>
      </div>
    </div>
  );
}
