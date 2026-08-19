import { useMemo, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Eye } from "lucide-react";
import type { RankTrackingRow } from "@/types/schemas/rank-tracking";
import { computeScorecards } from "./rankTrackingScorecards";

/**
 * Portfolio stat cards for one rank-tracking config + device: visibility (SoV),
 * keywords ranking, top-3, top-10, improved, declined. All values come from the
 * already-loaded latest-results rows via `computeScorecards`, so this adds no
 * extra query. Shown only when there are tracked keywords with positions.
 */
export function ScorecardRow({
  rows,
  device,
}: {
  rows: RankTrackingRow[];
  device: "desktop" | "mobile";
}) {
  const cards = useMemo(() => computeScorecards(rows, device), [rows, device]);

  return (
    <div className="grid grid-cols-2 gap-3 border-b border-base-300 px-4 py-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Visibility"
        icon={<Eye className="size-3.5" />}
        value={cards.visibility !== null ? cards.visibility.toFixed(1) : "—"}
        suffix={cards.visibility !== null ? "%" : undefined}
        delta={cards.visibilityDelta}
        deltaSuffix="pp"
        hint={
          cards.visibility === null ? "Refresh metrics to compute" : undefined
        }
      />
      <StatCard
        label="Ranking"
        value={String(cards.ranking)}
        delta={cards.rankingDelta}
      />
      <StatCard label="Top 3" value={String(cards.top3)} />
      <StatCard label="Top 10" value={String(cards.top10)} />
      <StatCard
        label="Improved"
        value={String(cards.improved)}
        valueClass="text-success"
      />
      <StatCard
        label="Declined"
        value={String(cards.declined)}
        valueClass="text-error"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  delta,
  deltaSuffix,
  hint,
  icon,
  valueClass,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta?: number | null;
  deltaSuffix?: string;
  hint?: string;
  icon?: ReactNode;
  valueClass?: string;
}) {
  const hasDelta = delta != null && delta !== 0;
  const isUp = (delta ?? 0) > 0;
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-3">
      <div className="flex items-center gap-1.5 text-xs text-base-content/50">
        {icon}
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-semibold tabular-nums ${valueClass ?? ""}`}
      >
        {value}
        {suffix ? (
          <span className="text-sm font-normal text-base-content/40">
            {suffix}
          </span>
        ) : null}
      </div>
      {hasDelta ? (
        <div
          className={`mt-0.5 flex items-center gap-0.5 text-xs tabular-nums ${
            isUp ? "text-success" : "text-error"
          }`}
        >
          {isUp ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )}
          {isUp ? "+" : ""}
          {Number.isInteger(delta) ? delta : delta?.toFixed(1)}
          {deltaSuffix}
        </div>
      ) : hint ? (
        <div className="mt-0.5 text-[11px] text-base-content/40">{hint}</div>
      ) : null}
    </div>
  );
}
