import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { getKeywordClustersFn } from "@/serverFunctions/keyword-clustering";
import type { ClusteringViewData } from "@/server/features/keyword-clustering/services/clusteringTypes";

export function KeywordClusteringView({ projectId }: { projectId: string }) {
  const [keywordsText, setKeywordsText] = useState("");

  const mutation = useMutation({
    mutationFn: (keywords: string[]) =>
      getKeywordClustersFn({
        data: { projectId, keywords },
      }),
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to cluster keywords"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = keywordsText
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean);
    if (keywords.length < 2) return;
    mutation.mutate(keywords);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder={
            "Enter keywords, one per line (2-20):\nseo tools\nkeyword research\nbacklink checker\nrank tracker"
          }
          className="textarea textarea-bordered w-full h-40 font-mono text-sm"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className={`btn btn-primary gap-2 ${mutation.isPending ? "loading" : ""}`}
            disabled={
              mutation.isPending ||
              keywordsText.split("\n").filter((l) => l.trim()).length < 2
            }
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Layers className="size-4" />
            )}
            Cluster Keywords
          </button>
          <span className="text-xs text-base-content/50">
            Groups keywords by SERP similarity (Jaccard index)
          </span>
        </div>
      </form>

      {mutation.data ? <ClusteringResults data={mutation.data} /> : null}
    </div>
  );
}

function ClusteringResults({ data }: { data: ClusteringViewData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg border border-base-300 bg-base-300/70 overflow-hidden">
        <StatCell label="Total Keywords" value={String(data.totalKeywords)} />
        <StatCell label="Clusters" value={String(data.clusters.length)} />
        <StatCell label="Unclustered" value={String(data.unclustered.length)} />
        <StatCell label="Threshold" value={String(data.threshold)} />
      </div>

      {data.clusters.map((cluster, i) => (
        <div key={i} className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-primary badge-sm">
                Cluster {i + 1}
              </span>
              <span className="font-medium">{cluster.label}</span>
              <span className="text-xs text-base-content/50 ml-auto">
                {cluster.keywords.length} keywords · similarity{" "}
                {(cluster.avgSimilarity * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cluster.keywords.map((kw) => (
                <span key={kw} className="badge badge-ghost badge-sm">
                  {kw}
                </span>
              ))}
            </div>
            <div className="mt-2">
              <div className="w-full bg-base-200 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${cluster.avgSimilarity * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {data.unclustered.length > 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <span className="text-sm font-medium mb-2">
              Unclustered Keywords
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.unclustered.map((kw) => (
                <span key={kw} className="badge badge-outline badge-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-base-100 px-4 py-3">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
