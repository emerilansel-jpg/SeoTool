import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Link2, Sparkles, AlertCircle } from "lucide-react";
import { getAiCitations } from "@/serverFunctions/ai-tracking";

interface Props {
  projectId: string;
  domain: string;
}

export function AiCitationsTab({ projectId, domain }: Props) {
  const getCitationsFn = useServerFn(getAiCitations);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-citations", projectId],
    queryFn: () => getCitationsFn({ data: { projectId } }),
  });

  const sources = data?.sources ?? [];
  const opportunities = data?.opportunities ?? [];

  return (
    <div className="space-y-6">
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
