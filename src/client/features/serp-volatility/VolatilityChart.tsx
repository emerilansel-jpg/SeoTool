import { categorizeVolatility } from "@/server/features/serp-volatility/services/volatilityCalculation";

type TrendRow = {
  date: string;
  volatilityScore: number;
};

function categoryColor(score: number): string {
  if (score < 20) return "bg-success";
  if (score < 50) return "bg-warning";
  if (score < 80) return "bg-error";
  return "bg-error";
}

function categoryBadgeClass(score: number): string {
  if (score < 20) return "badge-success";
  if (score < 50) return "badge-warning";
  if (score < 80) return "badge-error";
  return "badge-error";
}

export function VolatilityChart({ rows }: { rows: TrendRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-base-content/60">
        No volatility data yet. Compute volatility after running rank checks.
      </p>
    );
  }

  const maxScore = Math.max(...rows.map((r) => r.volatilityScore), 1);

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th className="w-full">Score</th>
            <th>Value</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pct = (row.volatilityScore / maxScore) * 100;
            return (
              <tr key={row.date}>
                <td className="whitespace-nowrap font-mono text-xs">
                  {row.date}
                </td>
                <td>
                  <div className="relative h-4 w-full rounded bg-base-200">
                    <div
                      className={`absolute inset-y-0 left-0 rounded ${categoryColor(row.volatilityScore)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap text-right font-mono text-xs">
                  {row.volatilityScore.toFixed(1)}
                </td>
                <td>
                  <span
                    className={`badge badge-sm ${categoryBadgeClass(row.volatilityScore)}`}
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
