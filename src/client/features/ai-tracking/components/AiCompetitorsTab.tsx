import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Swords, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { getAiCompetitors } from "@/serverFunctions/ai-tracking";

interface Props {
  projectId: string;
  brandName: string;
  domain: string;
}

export function AiCompetitorsTab({ projectId, brandName, domain }: Props) {
  const getCompetitorsFn = useServerFn(getAiCompetitors);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-tracking", projectId, "competitors"],
    queryFn: () => getCompetitorsFn({ data: { projectId } }),
  });

  const shareOfVoice = data?.shareOfVoice ?? [];
  const promptGaps = data?.promptGaps ?? [];

  return (
    <div className="space-y-6">
      {/* Competitor Share of Voice */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-base-content flex items-center gap-2">
              <Users className="size-4 text-primary" />
              AI Share of Voice (SOV)
            </h3>
            <p className="text-xs text-base-content/60">
              Distribution of actual AI mentions between your brand ({brandName}
              ) and discovered competitors.
            </p>
          </div>
          <span className="badge badge-sm badge-outline">
            {shareOfVoice.length} Brands Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/50 text-xs font-semibold text-base-content/70">
                <th>Brand / Domain</th>
                <th>Status</th>
                <th>Total Mentions</th>
                <th>Avg Position</th>
                <th className="w-1/3">Share of Voice</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-base-content/50"
                  >
                    Loading competitors…
                  </td>
                </tr>
              ) : shareOfVoice.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-base-content/60"
                  >
                    No competitor mentions recorded yet. Run prompt tracking or
                    discovery to identify competitors.
                  </td>
                </tr>
              ) : (
                shareOfVoice.map((comp, idx) => (
                  <tr
                    key={idx}
                    className={`hover ${comp.isTargetBrand ? "bg-primary/5 font-semibold" : ""}`}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${comp.domain}&size=32`}
                          alt=""
                          className="size-4 rounded-sm shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display =
                              "none";
                          }}
                        />
                        <span className="font-medium text-xs text-base-content font-mono">
                          {comp.brandName || comp.domain}
                        </span>
                      </div>
                    </td>
                    <td>
                      {comp.isTargetBrand ? (
                        <span className="badge badge-xs badge-primary">
                          Your Brand
                        </span>
                      ) : (
                        <span className="badge badge-xs badge-ghost">
                          Competitor
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs">{comp.mentionsCount}</td>
                    <td className="font-mono text-xs">
                      {comp.avgPosition != null ? `#${comp.avgPosition}` : "—"}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress
                          className={`progress h-2 w-full ${comp.isTargetBrand ? "progress-primary" : "progress-neutral"}`}
                          value={comp.shareOfVoice}
                          max="100"
                        />
                        <span className="text-xs font-mono w-10 text-right font-medium">
                          {comp.shareOfVoice}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Prompt Gap */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-base-content flex items-center gap-2">
              <Swords className="size-4 text-warning" />
              AI Prompt Gap (Opportunities to Win)
            </h3>
            <p className="text-xs text-base-content/60">
              High-value user prompts where competitors are recommended or
              cited, but your brand is missing.
            </p>
          </div>
          <span className="badge badge-sm badge-warning font-semibold">
            {promptGaps.length} Gap Prompts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/50 text-xs font-semibold text-base-content/70">
                <th>Prompt / Question</th>
                <th className="text-right">AI Search Volume</th>
                <th>Our Brand</th>
                <th>Competitors Mentioned</th>
                <th className="text-right">Priority</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-base-content/50"
                  >
                    Loading prompt gap analysis…
                  </td>
                </tr>
              ) : promptGaps.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-base-content/60"
                  >
                    No prompt gaps detected. Your brand is present across all
                    tracked competitor prompts!
                  </td>
                </tr>
              ) : (
                promptGaps.map((gap, i) => (
                  <tr key={i} className="hover">
                    <td className="font-medium text-base-content max-w-sm">
                      <span className="line-clamp-2">{gap.prompt}</span>
                    </td>
                    <td className="text-right font-mono text-xs font-semibold">
                      {gap.aiSearchVolume > 0
                        ? gap.aiSearchVolume.toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      <span className="badge badge-xs badge-error">
                        Missing
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {gap.competitorsMentioned.map((c, cidx) => (
                          <span
                            key={cidx}
                            className="badge badge-xs badge-neutral truncate max-w-[120px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right">
                      <span
                        className={`badge badge-xs ${gap.aiSearchVolume > 100 ? "badge-warning" : "badge-ghost"}`}
                      >
                        {gap.aiSearchVolume > 100
                          ? "High Priority"
                          : "Opportunity"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
