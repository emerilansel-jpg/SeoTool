// oxlint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  computeSerpVolatility,
  getSerpVolatility,
} from "@/serverFunctions/serp-volatility";
import { VolatilityChart } from "./VolatilityChart";
import { SerpVolatilityGuide } from "./SerpVolatilityGuide";
import {
  MoverArrow,
  ScoreGauge,
  categoryBadgeClass,
  describeMoverStatus,
  formatLastComputed,
} from "./SerpVolatilityUi";

type SelectedDays = 7 | 30 | 90;
const LOW_SAMPLE_THRESHOLD = 10;

export function SerpVolatilityView({ projectId }: { projectId: string }) {
  const [days, setDays] = useState<SelectedDays>(30);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["serp-volatility", projectId, days],
    queryFn: () => getSerpVolatility({ data: { projectId, days } }),
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
  const isComputable = data?.isComputable ?? false;
  const isSampleSmall = (latest?.keywordsSampled ?? 0) < LOW_SAMPLE_THRESHOLD;

  return (
    <div className="space-y-4">
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
                Calculated automatically from full rank tracking position shifts
                over recent runs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {latest?.createdAt && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-base-200/60 px-2.5 py-1.5 text-xs text-base-content/70">
                <Clock className="size-3.5" />
                Last computed: {formatLastComputed(latest.createdAt)}
              </span>
            )}

            <button
              type="button"
              className="btn btn-primary rounded-xl gap-2 font-semibold shadow-xs shrink-0"
              onClick={() => computeMutation.mutate()}
              disabled={computeMutation.isPending || (!latest && !isComputable)}
              title={
                !latest && !isComputable
                  ? "Requires at least two completed rank checks"
                  : undefined
              }
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
      </div>

      <SerpVolatilityGuide />

      {latest && isSampleSmall && (
        <div className="alert alert-warning rounded-2xl text-xs py-3">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            Small sample size: only {latest.keywordsSampled} keyword-device
            positions were evaluated. Add more keywords in Rank Tracking to
            increase index statistical confidence.
          </span>
        </div>
      )}

      {/* Latest score cards */}
      {latest ? (
        <div className="grid gap-5 md:grid-cols-3">
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
                  ? "Rankings are stable across Google search results."
                  : latest.volatilityScore < 50
                    ? "Moderate movement detected across tracked keywords."
                    : latest.volatilityScore < 80
                      ? "High volatility detected. Broad ranking update likely underway."
                      : "Extreme volatility detected across the tracked keyword portfolio."}
              </p>
            </div>
          </div>

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
                    {latest.keywordsSampled} positions
                  </dd>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-base-200/50">
                  <dt className="text-xs font-medium text-base-content/70 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-primary/70" />
                    Avg Position Shift
                  </dt>
                  <dd className="font-bold tabular-nums text-base-content">
                    {latest.avgPositionChange.toFixed(1)} ranks
                  </dd>
                </div>
              </dl>
            </div>
          </div>

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
                <ul className="mt-2 space-y-2 text-sm max-h-[170px] overflow-y-auto pr-1">
                  {latest.topMovers.map((mover) => (
                    <li
                      key={mover.keyword}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-base-200/40 hover:bg-base-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MoverArrow change={mover.change} />
                        <div className="min-w-0">
                          <p
                            className="truncate text-xs font-medium text-base-content"
                            title={mover.keyword}
                          >
                            {mover.keyword}
                          </p>
                          <p className="text-[10px] text-base-content/50">
                            {describeMoverStatus(
                              mover.status,
                              mover.currentPosition,
                              mover.previousPosition,
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-mono text-xs font-bold tabular-nums shrink-0 ${
                          mover.change > 0
                            ? "text-success"
                            : mover.change < 0
                              ? "text-error"
                              : "text-base-content/60"
                        }`}
                      >
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
              {isComputable
                ? "Ready to compute SERP Volatility"
                : "Rank Tracking History Needed"}
            </p>
            <p className="text-sm text-base-content/70 leading-relaxed">
              {isComputable
                ? "Your project has completed rank check runs ready for comparison. Compute your turbulence index now or wait for the next automatic rank check snapshot."
                : "SERP volatility compares keyword positions across consecutive completed full rank checks. Run rank checks to start recording volatility."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            {isComputable ? (
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
            ) : (
              <Link
                to="/p/$projectId/rank-tracking"
                params={{ projectId }}
                className="btn btn-primary rounded-xl gap-2 font-semibold shadow-xs"
              >
                Go to Rank Tracking
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Volatility trend chart with 7/30/90 range */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-base-300 bg-base-200/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-base-content">
              {days}-Day Volatility Trend
            </h2>
            <p className="text-xs text-base-content/50">
              Auto-refreshes when full rank runs complete; missing historical
              dates backfill lazily
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="join">
              {([7, 30, 90] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setDays(choice)}
                  className={`join-item btn btn-xs font-semibold ${
                    days === choice ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {choice}d
                </button>
              ))}
            </div>
            <span className="badge badge-neutral badge-soft badge-sm font-semibold">
              {trend.length} {trend.length === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
        <div className="p-5">
          <VolatilityChart rows={trend} />
        </div>
      </div>
    </div>
  );
}
