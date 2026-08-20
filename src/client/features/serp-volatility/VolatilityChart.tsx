import { categorizeVolatility } from "@/server/features/serp-volatility/services/volatilityCalculation";
import { Activity } from "lucide-react";

type TrendRow = {
  date: string;
  volatilityScore: number;
};

function categoryColor(score: number): string {
  if (score < 20) return "bg-success";
  if (score < 50) return "bg-warning";
  return "bg-error";
}

function categoryBadgeClass(score: number): string {
  if (score < 20) return "badge-success badge-soft text-success";
  if (score < 50) return "badge-warning badge-soft text-warning";
  return "badge-error badge-soft text-error";
}

export function VolatilityChart({ rows }: { rows: TrendRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-base-content/60 space-y-2">
        <Activity className="size-6 text-base-content/30 mx-auto" />
        <p className="font-medium text-base-content/70">
          No volatility history recorded yet
        </p>
        <p className="text-xs text-base-content/50">
          Run periodic rank checks to track SERP turbulence over time.
        </p>
      </div>
    );
  }

  const maxScore = Math.max(...rows.map((r) => r.volatilityScore), 1);

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr className="border-b border-base-200 text-xs font-semibold uppercase tracking-wider text-base-content/50">
            <th className="py-3 px-4">Date</th>
            <th className="w-full py-3 px-4">Volatility Distribution</th>
            <th className="py-3 px-4 text-right">Score</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-base-200/60">
          {rows.map((row) => {
            const pct = Math.min((row.volatilityScore / maxScore) * 100, 100);
            return (
              <tr
                key={row.date}
                className="hover:bg-base-200/40 transition-colors"
              >
                <td className="whitespace-nowrap font-mono text-xs text-base-content/80 py-3 px-4">
                  {row.date}
                </td>
                <td className="py-3 px-4">
                  <div className="relative h-3 w-full rounded-full bg-base-200/80 overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${categoryColor(row.volatilityScore)}`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap text-right font-mono text-xs font-bold tabular-nums text-base-content py-3 px-4">
                  {row.volatilityScore.toFixed(1)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`badge badge-sm font-semibold ${categoryBadgeClass(row.volatilityScore)}`}
                  >
                    {categorizeVolatility(row.volatilityScore)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
