// oxlint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Minus,
  RefreshCw,
  Sparkles,
  TrendingUp,
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
  return "text-error";
}

function scoreRingColor(score: number): string {
  if (score < 20) return "stroke-success";
  if (score < 50) return "stroke-warning";
  return "stroke-error";
}

function categoryBadgeClass(score: number): string {
  if (score < 20) return "badge-success badge-soft text-success";
  if (score < 50) return "badge-warning badge-soft text-warning";
  return "badge-error badge-soft text-error";
}

function MoverArrow({ change }: { change: number }) {
  if (change > 0)
    return <ArrowUpRight className="inline h-4 w-4 text-success shrink-0" />;
  if (change < 0)
    return <ArrowDownRight className="inline h-4 w-4 text-error shrink-0" />;
  return <Minus className="inline h-4 w-4 text-base-content/40 shrink-0" />;
}

/** Circular gauge for the latest volatility score. */
function ScoreGauge({ score }: { score: number }) {
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

export function SerpVolatilityView({ projectId }: { projectId: string }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["serp-volatility", projectId],
    queryFn: () => getSerpVolatility({ data: { projectId } }),
  });

  const computeMutation = useMutation({
    mutationFn: () => computeSerpVolatility({ data: { projectId } }),
    onSuccess: () => {
      toast.success("SERP volatility computed successfully");
      void refetch();
    },
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
          <div className="skeleton h-56 rounded-2xl" />
          <div className="skeleton h-56 rounded-2xl" />
          <div className="skeleton h-56 rounded-2xl" />
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const latest = data?.latest;
  const trend = data?.trend ?? [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs">
        <div className="card-body p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Activity className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-base-content">
                SERP Turbulence Index
              </h2>
              <p className="text-xs text-base-content/60">
                Calculated from rank tracking position shifts over the last
                24–48 hours
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary rounded-xl gap-2 font-semibold shadow-xs shrink-0 self-start sm:self-auto"
            onClick={() => computeMutation.mutate()}
            disabled={computeMutation.isPending}
          >
            {computeMutation.isPending ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Computing…
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Compute Volatility
              </>
            )}
          </button>
        </div>
      </div>

      {/* Latest score cards */}
      {latest ? (
        <div className="grid gap-5 md:grid-cols-3">
          {/* Card 1: Gauge */}
          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs hover:border-base-content/20 transition-all">
            <div className="card-body items-center text-center p-5">
              <div className="flex items-center justify-between w-full border-b border-base-200 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  Current Volatility
                </span>
                <span
                  className={`badge badge-sm font-semibold ${categoryBadgeClass(latest.volatilityScore)}`}
                >
                  {latest.category}
                </span>
              </div>
              <ScoreGauge score={latest.volatilityScore} />
              <p className="text-xs text-base-content/60">
                {latest.volatilityScore < 20
                  ? "Rankings are stable across Google SERPs."
                  : latest.volatilityScore < 50
                    ? "Moderate movement detected in search results."
                    : "High volatility — potential Google algorithm update in progress."}
              </p>
            </div>
          </div>

          {/* Card 2: Summary Metrics */}
          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs hover:border-base-content/20 transition-all">
            <div className="card-body p-5">
              <div className="flex items-center justify-between border-b border-base-200 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  Calculation Summary
                </span>
                <div className="flex items-center gap-1 text-xs font-mono text-base-content/60">
                  <Calendar className="size-3" />
                  {latest.date}
                </div>
              </div>

              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-base-200/50">
                  <dt className="text-xs font-medium text-base-content/70 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary/70" />
                    Keywords Sampled
                  </dt>
                  <dd className="font-bold tabular-nums text-base-content">
                    {latest.keywordsSampled} keywords
                  </dd>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-base-200/50">
                  <dt className="text-xs font-medium text-base-content/70 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-primary/70" />
                    Avg Position Shift
                  </dt>
                  <dd className="font-bold tabular-nums text-base-content">
                    {latest.avgPositionChange.toFixed(1)} positions
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Card 3: Top Movers */}
          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs hover:border-base-content/20 transition-all">
            <div className="card-body p-5">
              <div className="flex items-center justify-between border-b border-base-200 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  Top Movers
                </span>
                <span className="badge badge-ghost badge-sm text-base-content/60 font-medium">
                  {latest.topMovers ? latest.topMovers.length : 0} shifts
                </span>
              </div>

              {latest.topMovers && latest.topMovers.length > 0 ? (
                <ul className="mt-2 space-y-2 text-sm max-h-[160px] overflow-y-auto pr-1">
                  {latest.topMovers.map((mover: TopMover) => (
                    <li
                      key={mover.keyword}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-base-200/40 hover:bg-base-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MoverArrow change={mover.change} />
                        <span
                          className="truncate text-xs font-medium text-base-content"
                          title={mover.keyword}
                        >
                          {mover.keyword}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold tabular-nums shrink-0">
                        {mover.change > 0 ? `+${mover.change}` : mover.change}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-base-content/50">
                  <p className="text-xs">
                    No significant position jumps detected.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60 space-y-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <Activity className="size-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="text-lg font-bold text-base-content">
              No SERP Volatility computed yet
            </p>
            <p className="text-sm text-base-content/70 leading-relaxed">
              SERP volatility tracks fluctuations across your tracked keywords
              over time. Click below to compute volatility score based on your
              latest rank tracking checks.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="btn btn-primary rounded-xl gap-2 font-semibold shadow-xs"
              onClick={() => computeMutation.mutate()}
              disabled={computeMutation.isPending}
            >
              {computeMutation.isPending ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Computing Volatility…
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" />
                  Compute Volatility Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 30-day trend chart */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-base-300 bg-base-200/20 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-base-content">
              30-Day Volatility Trend
            </h2>
            <p className="text-xs text-base-content/50">
              Historical timeline of SERP turbulence
            </p>
          </div>
          <span className="badge badge-neutral badge-soft badge-sm font-semibold">
            {trend.length} recorded {trend.length === 1 ? "day" : "days"}
          </span>
        </div>
        <div className="p-5">
          <VolatilityChart rows={trend} />
        </div>
      </div>
    </div>
  );
}
