import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  ExternalLink,
  Link2,
  Sparkles,
} from "lucide-react";
import { getAiCitations } from "@/serverFunctions/ai-tracking";
import type { LlmCitationMetric } from "@/types/schemas/ai-tracking";

interface Props {
  projectId: string;
  domain: string;
  llmMetrics?: LlmCitationMetric[];
}

const PLATFORM_LABELS: Record<string, string> = {
  chat_gpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  claude: "Claude",
};

export function AiCitationsTab({ projectId, domain, llmMetrics = [] }: Props) {
  const getCitationsFn = useServerFn(getAiCitations);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-tracking", projectId, "citations"],
    queryFn: () => getCitationsFn({ data: { projectId } }),
  });

  const sources = data?.sources ?? [];
  const opportunities = data?.opportunities ?? [];

  return (
    <div className="space-y-6">
      {/* Profound Pillar 1: Citation Rates per LLM (Time-Series) */}
      {llmMetrics.length > 0 && (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-base-content flex items-center gap-2">
                <Bot className="size-4 text-primary" />
                LLM Citation Rates &amp; 30-Day Trends (Profound)
              </h3>
              <p className="text-xs text-base-content/60">
                Frequency and trend deltas of AI answers linking back to{" "}
                {domain} as a direct source citation.
              </p>
            </div>
            <span className="badge badge-sm badge-outline text-[11px] self-start sm:self-auto font-medium text-base-content/70">
              Profound (live, confidence 0.90)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {llmMetrics.map((m) => {
              const name = PLATFORM_LABELS[m.platform] || m.platform;
              const isPositiveTrend = m.trendDeltaPercent > 0;
              const hasTrend = m.trendDeltaPercent !== 0;

              return (
                <div
                  key={m.platform}
                  className="rounded-lg border border-base-200 bg-base-200/30 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-base-content">
                      {name}
                    </span>
                    {hasTrend ? (
                      <span
                        className={`badge badge-xs font-bold gap-0.5 ${
                          isPositiveTrend ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {isPositiveTrend ? (
                          <ArrowUpRight className="size-2.5" />
                        ) : (
                          <ArrowDownRight className="size-2.5" />
                        )}
                        {isPositiveTrend
                          ? `+${m.trendDeltaPercent}%`
                          : `${m.trendDeltaPercent}%`}
                      </span>
                    ) : (
                      <span className="badge badge-xs badge-ghost text-base-content/50">
                        steady
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-xl font-bold text-base-content">
                      {m.citationRatePercent}%
                    </div>
                    <div className="text-[10px] text-base-content/60 font-mono">
                      {m.citationsCount} / {m.totalResponses} cited
                    </div>
                  </div>

                  <div className="w-full bg-base-300 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(Math.max(m.citationRatePercent, 2), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overview stats header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-success/10 p-2.5 text-success">
            <Link2 className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-base-content">
              {sources.reduce((acc, s) => acc + s.frequency, 0)}
            </div>
            <div className="text-xs text-base-content/60">
              Our Brand Citations Recorded
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-info/10 p-2.5 text-info">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-base-content">
              {opportunities.length}
            </div>
            <div className="text-xs text-base-content/60">
              Citation Opportunities (AI Reference Gap)
            </div>
          </div>
        </div>
      </div>

      {/* Citation Sources (Our Cited URLs / Domains) */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-base-content">
              Active Citations for {domain}
            </h3>
            <p className="text-xs text-base-content/60">
              Domains and pages where your brand is currently referenced as an
              authoritative source in AI answers.
            </p>
          </div>
          <span className="badge badge-sm badge-success font-semibold">
            {sources.length} Sources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/50 text-xs font-semibold text-base-content/70">
                <th>Source Domain</th>
                <th>Frequency</th>
                <th>Brand Citation Status</th>
                <th>Sample Citations</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-xs text-base-content/50"
                  >
                    Loading citation sources…
                  </td>
                </tr>
              ) : sources.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-xs text-base-content/60"
                  >
                    No verified citations for {domain} recorded yet. Run prompt
                    discovery or prompt tracking to identify citations.
                  </td>
                </tr>
              ) : (
                sources.map((s, i) => (
                  <tr key={i} className="hover">
                    <td className="font-medium text-base-content font-mono text-xs">
                      {s.domain}
                    </td>
                    <td>
                      <span className="badge badge-xs badge-neutral">
                        {s.frequency}x cited
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-xs badge-success">
                        Target Brand Cited
                      </span>
                    </td>
                    <td className="text-xs text-base-content/70">
                      <div className="flex flex-col gap-1 max-w-md">
                        {s.sampleUrls.map((url, uidx) => (
                          <a
                            key={uidx}
                            href={
                              url.startsWith("http") ? url : `https://${url}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline truncate"
                          >
                            <span className="truncate">{url}</span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citation Gap Opportunities */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-base-content">
            Citation Gap (Top Reference Sources)
          </h3>
          <p className="text-xs text-base-content/60">
            Authoritative domains frequently cited by AI models for your target
            queries, where your brand is not yet referenced.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/50 text-xs font-semibold text-base-content/70">
                <th>Reference Domain</th>
                <th>AI Citation Frequency</th>
                <th>Our Domain Cited</th>
                <th>Opportunity Type</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-xs text-base-content/50"
                  >
                    Loading citation gap analysis…
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-xs text-base-content/60"
                  >
                    No citation opportunities found yet. Run prompt discovery to
                    populate source domains.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp, idx) => (
                  <tr key={idx} className="hover">
                    <td className="font-medium text-base-content font-mono text-xs">
                      {opp.domain}
                    </td>
                    <td>
                      <span className="badge badge-xs badge-info font-mono">
                        {opp.frequency} times
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-xs badge-ghost text-error">
                        Missing Citation
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-xs badge-outline">
                        AEO / GEO Outreach Target
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
