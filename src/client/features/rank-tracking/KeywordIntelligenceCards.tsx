import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Brain,
  Eye,
  Flame,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { KeywordIntelligenceDetail } from "@/server/features/rank-tracking/services/KeywordIntelligenceService";

export function KeywordIntelligenceCards({
  detail,
}: {
  detail: KeywordIntelligenceDetail;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {/* Card 1: Visibility Score */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            SEO Visibility
          </span>
          <Eye className="size-3.5 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {detail.visibilityScore}%
          </span>
          {detail.visibilityDelta !== 0 && (
            <span
              className={`inline-flex items-center text-[10px] font-bold ${
                detail.visibilityDelta > 0 ? "text-success" : "text-error"
              }`}
            >
              {detail.visibilityDelta > 0 ? "+" : ""}
              {detail.visibilityDelta}pp
            </span>
          )}
        </div>
        <p className="mt-1 text-[10px] text-base-content/50 truncate">
          Weighted rankings
        </p>
      </div>

      {/* Card 2: Avg SERP Position */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            SERP Position
          </span>
          <TrendingUp className="size-3.5 text-info" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {detail.currentPosition !== null
              ? `#${detail.currentPosition}`
              : "—"}
          </span>
          {detail.positionDelta !== 0 && (
            <span
              className={`inline-flex items-center text-[10px] font-bold ${
                detail.positionDelta > 0 ? "text-success" : "text-error"
              }`}
            >
              {detail.positionDelta > 0 ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {Math.abs(detail.positionDelta)}
            </span>
          )}
        </div>
        <p className="mt-1 text-[10px] text-base-content/50 truncate">
          Current position
        </p>
      </div>

      {/* Card 3: AI Overview Share */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            AI Overview
          </span>
          <Sparkles className="size-3.5 text-secondary" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {detail.aiOverview.sharePercent}%
          </span>
          <span
            className={`badge badge-2xs font-semibold ${
              detail.aiOverview.status === "found"
                ? "badge-success text-success-content"
                : "badge-ghost text-base-content/50"
            }`}
          >
            {detail.aiOverview.status === "found" ? "Found" : "Missing"}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-base-content/50 truncate">
          {detail.aiOverview.label}
        </p>
      </div>

      {/* Card 4: Avg AEO Score */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            AEO Score
          </span>
          <Brain className="size-3.5 text-accent" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {detail.aeoScore}%
          </span>
        </div>
        <p className="mt-1 text-[10px] text-base-content/50 truncate">
          {detail.aeoStatus}
        </p>
      </div>

      {/* Card 5: Avg GEO Score */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            GEO Score
          </span>
          <MapPin className="size-3.5 text-warning" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {detail.geoScore}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-base-content/50 truncate">
          {detail.geoStatus}
        </p>
      </div>

      {/* Card 6: SERP Volatility */}
      <div
        className={`rounded-xl border p-3.5 shadow-2xs ${
          detail.serpVolatility.level === "high"
            ? "border-error/40 bg-error/5 text-error"
            : detail.serpVolatility.level === "moderate"
              ? "border-warning/40 bg-warning/5 text-warning"
              : "border-success/40 bg-success/5 text-success"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Volatility
          </span>
          {detail.serpVolatility.level === "high" ? (
            <Flame className="size-3.5" />
          ) : (
            <Activity className="size-3.5" />
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-black">
            {detail.serpVolatility.label}
          </span>
          <span className="text-[10px] font-bold">
            ({detail.serpVolatility.score}/10)
          </span>
        </div>
        <p className="mt-1 text-[10px] font-medium opacity-80 truncate">
          {detail.serpVolatility.description}
        </p>
      </div>

      {/* Card 7: Top Movers (24H) */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-2xs col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Top Movers 24h
          </span>
          <ArrowUpDown className="size-3.5 text-base-content/40" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xs font-bold text-base-content truncate max-w-[130px]">
            {detail.topMovers24h.headline}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-base-content/50 truncate">
          {detail.topMovers24h.change !== 0
            ? `${detail.topMovers24h.change > 0 ? "+" : ""}${detail.topMovers24h.change} pos change`
            : "Stable position"}
        </p>
      </div>
    </div>
  );
}
