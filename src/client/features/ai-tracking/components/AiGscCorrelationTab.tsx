import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Info, AlertCircle } from "lucide-react";
import { getGscAiCorrelation } from "@/serverFunctions/ai-tracking";

interface Props {
  projectId: string;
}

export function AiGscCorrelationTab({ projectId }: Props) {
  const getGscCorrelationFn = useServerFn(getGscAiCorrelation);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-tracking", projectId, "gsc-correlation"],
    queryFn: () => getGscCorrelationFn({ data: { projectId } }),
  });

  const isConnected = data?.connected ?? false;
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {/* Informational banner */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-start gap-3">
        <Info className="size-5 text-info shrink-0 mt-0.5" />
        <div className="text-xs text-base-content/80 space-y-1">
          <p className="font-semibold text-base-content">
            Cross-Channel AI &amp; Google Search Performance Correlation
          </p>
          <p>
            Connects discovered AI prompts with your first-party Google Search
            Console impressions and clicks. Compare whether queries driving
            search traffic also surface your brand in LLM answers.
          </p>
        </div>
      </div>

      {!isConnected && (
        <div className="alert alert-warning text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            Google Search Console is not connected for this project. Connect
            your property in{" "}
            <Link
              to="/p/$projectId/search-performance"
              params={{ projectId }}
              className="underline font-semibold hover:text-base-content"
            >
              Search Performance
            </Link>{" "}
            to see first-party impression and click correlation.
          </span>
        </div>
      )}

      {/* Correlation Table */}
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-sm">
          <thead>
            <tr className="bg-base-200/50 text-xs font-semibold text-base-content/70">
              <th>AI Prompt</th>
              <th>AI Presence</th>
              <th>AI Citation</th>
              <th>Correlated GSC Query</th>
              <th className="text-right">GSC Impressions</th>
              <th className="text-right">GSC Clicks</th>
              <th className="text-right">GSC CTR</th>
              <th className="text-right">Google Avg Pos</th>
              <th className="text-center">Data Source</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-xs text-base-content/50"
                >
                  <span className="loading loading-spinner loading-sm text-primary mr-2" />
                  Loading GSC correlation data…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-xs text-base-content/60"
                >
                  No AI prompts available for correlation. Run prompt discovery
                  or add tracking prompts first.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className="hover">
                  <td className="font-medium text-base-content max-w-xs">
                    <span className="line-clamp-2">{item.aiPrompt}</span>
                  </td>
                  <td>
                    {item.aiPresence ? (
                      <span className="badge badge-xs badge-success">YES</span>
                    ) : (
                      <span className="badge badge-xs badge-ghost">NO</span>
                    )}
                  </td>
                  <td>
                    {item.aiCitation ? (
                      <span className="badge badge-xs badge-info">YES</span>
                    ) : (
                      <span className="badge badge-xs badge-ghost">NO</span>
                    )}
                  </td>
                  <td className="text-xs text-base-content/80 font-mono max-w-xs truncate">
                    {item.gscQuery}
                  </td>
                  <td className="text-right font-mono text-xs">
                    {item.impressions > 0
                      ? item.impressions.toLocaleString()
                      : "—"}
                  </td>
                  <td className="text-right font-mono text-xs">
                    {item.clicks > 0 ? item.clicks.toLocaleString() : "—"}
                  </td>
                  <td className="text-right font-mono text-xs">
                    {item.ctr > 0 ? `${item.ctr}%` : "—"}
                  </td>
                  <td className="text-right font-mono text-xs font-semibold">
                    {item.position > 0 ? `#${item.position}` : "—"}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge badge-xs font-mono uppercase ${
                        item.sourceBadge === "GSC"
                          ? "badge-primary"
                          : item.sourceBadge === "Tracked"
                            ? "badge-success"
                            : "badge-ghost"
                      }`}
                    >
                      {item.sourceBadge}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
