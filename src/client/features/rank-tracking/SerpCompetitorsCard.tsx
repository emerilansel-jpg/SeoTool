import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Globe } from "lucide-react";
import { getSerpCompetitors } from "@/serverFunctions/serp-snapshots";

type CompetitorRow = {
  domain: string;
  appearances: number;
  keywordCount: number;
  avgRank: number;
};

/**
 * Shows which domains appear most often in the SERPs for a rank-tracking
 * config's tracked keywords. Aggregated from the latest completed run's SERP
 * snapshots, excluding the tracked domain itself.
 */
export function SerpCompetitorsCard({
  projectId,
  configId,
  device,
}: {
  projectId: string;
  configId: string;
  device: "desktop" | "mobile";
}) {
  const getCompetitors = useServerFn(getSerpCompetitors);
  const { data, isLoading } = useQuery({
    queryKey: ["serpCompetitors", projectId, configId, device],
    queryFn: () => getCompetitors({ data: { projectId, configId, device } }),
  });

  const rows: CompetitorRow[] = data ?? [];

  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="flex items-center gap-2 border-b border-base-300 px-4 py-3">
        <Globe className="size-4 text-base-content/50" />
        <h3 className="text-sm font-semibold">SERP Competitors</h3>
        <span className="text-xs text-base-content/40">
          (top domains across your tracked keywords)
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <span className="loading loading-spinner loading-sm" />
        </div>
      ) : rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-base-content/50">
          No competitor data yet. Run a rank check to see SERP competitors.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-xs text-base-content/50">
                <th className="pl-4">Domain</th>
                <th className="text-right">Appearances</th>
                <th className="text-right">Keywords</th>
                <th className="pr-4 text-right">Avg Position</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.domain} className="hover:bg-base-200">
                  <td className="pl-4">
                    <span className="text-sm font-medium">{row.domain}</span>
                  </td>
                  <td className="text-right tabular-nums">{row.appearances}</td>
                  <td className="text-right tabular-nums">
                    {row.keywordCount}
                  </td>
                  <td className="pr-4 text-right tabular-nums">
                    {row.avgRank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
