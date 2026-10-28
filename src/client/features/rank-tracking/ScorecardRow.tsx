import { useMemo } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Brain,
  Eye,
  Flame,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { RankTrackingRow } from "@/types/schemas/rank-tracking";
import { computeScorecards } from "./rankTrackingScorecards";

export function ScorecardRow({
  rows,
  device,
}: {
  rows: RankTrackingRow[];
  device: "desktop" | "mobile";
}) {
  const cards = useMemo(() => computeScorecards(rows, device), [rows, device]);

  const metrics = useMemo(() => {
    const rankingRows = rows.filter((r) => r[device].position !== null);
    const posList = rankingRows.map((r) => r[device].position as number);
    const prevPosList = rows
      .filter((r) => r[device].previousPosition !== null)
      .map((r) => r[device].previousPosition as number);

    const avgPos =
      posList.length > 0
        ? (posList.reduce((a, b) => a + b, 0) / posList.length).toFixed(1)
        : null;

    const prevAvgPos =
      prevPosList.length > 0
        ? prevPosList.reduce((a, b) => a + b, 0) / prevPosList.length
        : null;

    const posDelta =
      avgPos !== null && prevAvgPos !== null
        ? Math.round((prevAvgPos - Number(avgPos)) * 10) / 10
        : 0;

    // AI Overview detection
    const aiRows = rows.filter((r) =>
      r[device].serpFeatures.includes("ai_overview"),
    );
    const aiSharePercent =
      rows.length > 0 ? Math.round((aiRows.length / rows.length) * 100) : 0;
    const isCited = aiRows.some(
      (r) => r[device].position !== null && r[device].position <= 10,
    );

    // AEO Score
    const aeoScore =
      posList.length > 0
        ? Math.round(
            posList.reduce(
              (acc, pos) => acc + (pos <= 3 ? 85 : pos <= 10 ? 62 : 25),
              0,
            ) / posList.length,
          )
        : 0;

    // GEO Score (Local pack)
    const localRows = rows.filter(
      (r) =>
        r[device].serpFeatures.includes("local_pack") ||
        r[device].serpFeatures.includes("local_finder"),
    );
    const geoScore =
      rows.length > 0 ? Math.round((localRows.length / rows.length) * 100) : 0;

    // Volatility
    const shifts = rows.map((r) => {
      const pos = r[device].position;
      const prev = r[device].previousPosition;
      return pos !== null && prev !== null ? Math.abs(prev - pos) : 0;
    });
    const avgShift =
      shifts.length > 0 ? shifts.reduce((a, b) => a + b, 0) / shifts.length : 0;

    const volatilityScore = avgShift >= 4 ? 8.4 : avgShift >= 1.5 ? 5.2 : 2.4;
    const volatilityLevel =
      volatilityScore >= 6.6
        ? "high"
        : volatilityScore >= 3.5
          ? "moderate"
          : "calm";
    const volatilityLabel =
      volatilityLevel === "high"
        ? "High"
        : volatilityLevel === "moderate"
          ? "Moderate"
          : "Calm";

    // Top Mover
    let maxChange = 0;
    let maxKeyword = "No change";
    for (const r of rows) {
      const pos = r[device].position;
      const prev = r[device].previousPosition;
      if (pos !== null && prev !== null) {
        const change = prev - pos;
        if (Math.abs(change) > Math.abs(maxChange)) {
          maxChange = change;
          maxKeyword = r.keyword;
        }
      }
    }

    return {
      avgPos,
      posDelta,
      aiSharePercent,
      isCited,
      aiRowsCount: aiRows.length,
      aeoScore,
      geoScore,
      volatilityScore,
      volatilityLevel,
      volatilityLabel,
      maxChange,
      maxKeyword,
    };
  }, [rows, device]);

  return (
    <div className="grid grid-cols-2 gap-3 border-b border-base-300 px-4 py-3 sm:grid-cols-4 lg:grid-cols-7 bg-base-200/30">
      {/* 1. SEO Visibility */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            SEO Visibility
          </span>
          <Eye className="size-3.5 text-primary" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {cards.visibility !== null ? cards.visibility.toFixed(1) : "0.0"}%
          </span>
          {cards.visibilityDelta !== null && cards.visibilityDelta !== 0 && (
            <span
              className={`inline-flex items-center text-[10px] font-bold ${
                cards.visibilityDelta > 0 ? "text-success" : "text-error"
              }`}
            >
              {cards.visibilityDelta > 0 ? "+" : ""}
              {cards.visibilityDelta.toFixed(1)}pp
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[10px] text-base-content/50 truncate">
          Weighted rankings
        </p>
      </div>

      {/* 2. SERP Position */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            SERP Position
          </span>
          <TrendingUp className="size-3.5 text-info" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {metrics.avgPos !== null ? `#${metrics.avgPos}` : "—"}
          </span>
          {metrics.posDelta !== 0 && (
            <span
              className={`inline-flex items-center text-[10px] font-bold ${
                metrics.posDelta > 0 ? "text-success" : "text-error"
              }`}
            >
              {metrics.posDelta > 0 ? (
                <ArrowUp className="size-2.5 mr-0.5" />
              ) : (
                <ArrowDown className="size-2.5 mr-0.5" />
              )}
              {Math.abs(metrics.posDelta)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[10px] text-base-content/50 truncate">
          Avg position
        </p>
      </div>

      {/* 3. AI Overview Share */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            AI Overview
          </span>
          <Sparkles className="size-3.5 text-secondary" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {metrics.aiSharePercent}%
          </span>
          <span
            className={`badge badge-2xs text-[9px] font-bold ${
              metrics.isCited
                ? "badge-secondary"
                : metrics.aiRowsCount > 0
                  ? "badge-neutral"
                  : "badge-ghost"
            }`}
          >
            {metrics.isCited
              ? "Cited"
              : metrics.aiRowsCount > 0
                ? "Detected"
                : "No AI"}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-base-content/50 truncate">
          {metrics.aiRowsCount} of {rows.length} queries
        </p>
      </div>

      {/* 4. Avg AEO Score */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Avg AEO Score
          </span>
          <Brain className="size-3.5 text-accent" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {metrics.aeoScore}%
          </span>
          <span className="badge badge-accent badge-2xs text-[9px] font-bold">
            {metrics.aeoScore >= 70
              ? "High"
              : metrics.aeoScore >= 40
                ? "Moderate"
                : "Low"}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-base-content/50 truncate">
          LLM readiness
        </p>
      </div>

      {/* 5. Avg GEO Score */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Avg GEO Score
          </span>
          <MapPin className="size-3.5 text-warning" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {metrics.geoScore}%
          </span>
          <span className="badge badge-warning badge-2xs text-[9px] font-bold">
            {metrics.geoScore > 0 ? "3-Pack" : "0 GEO"}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-base-content/50 truncate">
          Maps visibility
        </p>
      </div>

      {/* 6. SERP Volatility */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Volatility
          </span>
          <Flame
            className={`size-3.5 ${
              metrics.volatilityLevel === "high"
                ? "text-error"
                : metrics.volatilityLevel === "moderate"
                  ? "text-warning"
                  : "text-success"
            }`}
          />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {metrics.volatilityLabel}
          </span>
          <span
            className={`badge badge-2xs text-[9px] font-bold ${
              metrics.volatilityLevel === "high"
                ? "badge-error"
                : metrics.volatilityLevel === "moderate"
                  ? "badge-warning"
                  : "badge-success"
            }`}
          >
            {metrics.volatilityScore}/10
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-base-content/50 truncate">
          SERP stability
        </p>
      </div>

      {/* 7. Top Movers (24H) */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 shadow-2xs">
        <div className="flex items-center justify-between text-base-content/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Top Movers
          </span>
          <Activity className="size-3.5 text-info" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-base-content font-mono">
            {metrics.maxChange !== 0
              ? `${metrics.maxChange > 0 ? "+" : ""}${metrics.maxChange}`
              : "0"}
          </span>
          <span className="text-[10px] font-semibold text-base-content/60">
            pos
          </span>
        </div>
        <p
          className="mt-0.5 text-[10px] text-base-content/70 truncate font-medium"
          title={metrics.maxKeyword}
        >
          {metrics.maxKeyword}
        </p>
      </div>
    </div>
  );
}
