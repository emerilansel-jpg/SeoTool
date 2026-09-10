import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, FileText, Globe } from "lucide-react";
import { getAiPages } from "@/serverFunctions/ai-tracking";

interface Props {
  projectId: string;
  domain: string;
}

export function AiPagesTab({ projectId, domain }: Props) {
  const getPagesFn = useServerFn(getAiPages);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-pages", projectId],
    queryFn: () => getPagesFn({ data: { projectId } }),
  });

  const pages = data ?? [];

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-base-content flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            Top AI Mentioned Pages ({domain})
          </h3>
          <p className="text-xs text-base-content/60">
            Pages on your website most frequently cited and surfaced by LLM
            answers and AI overviews.
          </p>
        </div>
        <span className="badge badge-sm badge-neutral font-semibold">
          {pages.length} Pages
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="bg-base-200/50 text-xs font-semibold text-base-content/70">
              <th>Page URL</th>
              <th>Platform</th>
              <th className="text-right">AI Mentions</th>
              <th className="text-right">AI Search Volume</th>
              <th className="text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-xs text-base-content/50"
                >
                  <span className="loading loading-spinner loading-sm text-primary mr-2" />
                  Loading top pages…
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-xs text-base-content/60"
                >
                  No top pages recorded yet. Run prompt discovery to populate
                  top cited URLs for {domain}.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="hover">
                  <td className="font-medium text-base-content max-w-md">
                    <a
                      href={
                        p.url.startsWith("http") ? p.url : `https://${p.url}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline font-mono text-xs"
                    >
                      <span className="truncate">{p.url}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </td>
                  <td>
                    <span className="badge badge-xs font-medium uppercase">
                      {p.platform === "chat_gpt"
                        ? "ChatGPT"
                        : p.platform === "google"
                          ? "Google AI"
                          : p.platform}
                    </span>
                  </td>
                  <td className="text-right font-mono text-xs font-semibold text-success">
                    {p.mentions.toLocaleString()}
                  </td>
                  <td className="text-right font-mono text-xs">
                    {p.aiSearchVolume > 0
                      ? p.aiSearchVolume.toLocaleString()
                      : "—"}
                  </td>
                  <td className="text-right text-xs text-base-content/60">
                    {p.updatedAt
                      ? new Date(p.updatedAt).toLocaleDateString()
                      : "—"}
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
