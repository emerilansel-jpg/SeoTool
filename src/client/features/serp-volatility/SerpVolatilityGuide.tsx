import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

export function SerpVolatilityGuide() {
  return (
    <details className="group rounded-2xl border border-base-300 bg-base-100 shadow-xs transition-all">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 sm:p-5 select-none">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <BookOpen className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-base-content">
              How SERP Volatility Works
            </h3>
            <p className="text-xs text-base-content/60">
              Scoring methodology, data requirements, and recommended actions
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-primary group-open:hidden">
          Show guide
        </span>
        <span className="text-xs font-semibold text-base-content/50 hidden group-open:inline">
          Hide guide
        </span>
      </summary>

      <div className="border-t border-base-200 px-4 py-5 sm:px-6 space-y-6 text-xs text-base-content/80 leading-relaxed">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 rounded-xl bg-base-200/40 p-4">
            <div className="flex items-center gap-2 font-bold text-base-content text-xs">
              <HelpCircle className="size-4 text-primary" />
              What It Measures
            </div>
            <p>
              SERP Volatility tracks turbulence across all tracked keyword and
              device combinations. The index scales from 0 to 100 by blending
              position shift magnitude (up to 50 points), the share of rankings
              that moved (up to 30 points), and keywords entering or leaving the
              tracked depth (up to 20 points).
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl bg-base-200/40 p-4">
            <div className="flex items-center gap-2 font-bold text-base-content text-xs">
              <CheckCircle2 className="size-4 text-success" />
              Data Source and Prerequisites
            </div>
            <p>
              Data comes directly from stored full Rank Tracking runs without
              using extra DataForSEO credits. Volatility requires at least two
              completed full checks for at least one tracked domain. Every
              completed full rank run automatically generates a fresh snapshot.
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-base-content mb-2 text-xs uppercase tracking-wider text-base-content/60">
            Score Bands
          </h4>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-success/30 bg-success/5 p-3">
              <span className="badge badge-success badge-soft badge-xs font-bold mb-1">
                Low (0 to 19.9)
              </span>
              <p className="text-[11px] text-base-content/70">
                Calm search results. Positions hold steady with typical minor
                day-to-day noise.
              </p>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
              <span className="badge badge-warning badge-soft badge-xs font-bold mb-1">
                Moderate (20 to 49.9)
              </span>
              <p className="text-[11px] text-base-content/70">
                Noticeable movement across keywords. Normal reshuffling after
                minor search updates.
              </p>
            </div>
            <div className="rounded-xl border border-error/30 bg-error/5 p-3">
              <span className="badge badge-error badge-soft badge-xs font-bold mb-1">
                High (50 to 79.9)
              </span>
              <p className="text-[11px] text-base-content/70">
                Heavy ranking turbulence. Likely broad core update or category
                reclassification.
              </p>
            </div>
            <div className="rounded-xl border border-error/50 bg-error/15 p-3">
              <span className="badge badge-error badge-xs font-bold mb-1">
                Extreme (80 to 100)
              </span>
              <p className="text-[11px] text-base-content/70">
                Severe disruption across search results with widespread position
                swings and dropped URLs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 rounded-xl bg-base-200/40 p-4">
            <div className="flex items-center gap-2 font-bold text-base-content text-xs">
              <AlertTriangle className="size-4 text-warning" />
              Understanding Top Movers
            </div>
            <p>
              Top movers highlight up to 5 keywords with the largest position
              swings. Improvements show positive deltas, declines show negative
              deltas, and newly entered or dropped rankings reflect effective
              moves against the unranked baseline.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl bg-base-200/40 p-4">
            <div className="flex items-center gap-2 font-bold text-base-content text-xs">
              <ShieldAlert className="size-4 text-error" />
              Action Plan During High Volatility
            </div>
            <p>
              Avoid panic edits during active volatility. Confirm whether Google
              has announced an algorithm rollout, inspect whether competitors
              dropped as well, verify search intent shifts, and let results
              settle before adjusting page content or site structure.
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}
