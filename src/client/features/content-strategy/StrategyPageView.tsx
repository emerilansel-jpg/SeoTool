import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  listTopicClusters,
  listContentBriefs,
} from "@/serverFunctions/content-strategy";
import { EmptyStrategyState, ClusterCard } from "./StrategyParts";

export function StrategyPageView({ projectId }: { projectId: string }) {
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);

  const { data: clusters = [], isLoading: isLoadingClusters } = useQuery({
    queryKey: ["topic_clusters", projectId],
    queryFn: () => listTopicClusters({ data: { projectId } }),
  });

  const { data: briefs = [], isLoading: isLoadingBriefs } = useQuery({
    queryKey: ["content_briefs", projectId],
    queryFn: () => listContentBriefs({ data: { projectId } }),
  });

  if (isLoadingClusters || isLoadingBriefs) {
    return (
      <div className="p-8 text-center">
        <span className="loading loading-spinner" />
      </div>
    );
  }

  if (clusters.length === 0 && briefs.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <EmptyStrategyState
          onCreateCluster={() => setIsClusterModalOpen(true)}
        />
      </div>
    );
  }

  // Group briefs by cluster
  type BriefItem = (typeof briefs)[number];
  const briefsByCluster = briefs.reduce(
    (acc: Record<string, BriefItem[]>, brief: BriefItem) => {
      const key = brief.clusterId ?? "unclustered";
      if (!acc[key]) acc[key] = [];
      acc[key].push(brief);
      return acc;
    },
    {} as Record<string, BriefItem[]>,
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Content Strategy</h1>
          <p className="text-base-content/70">
            Plan topic clusters and manage targeted content briefs.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsClusterModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Cluster
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((cluster) => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            projectId={projectId}
            briefs={briefsByCluster[cluster.id] || []}
            onAddBrief={(id) => {
              // Minimal stub: a real implementation would open a brief creation modal prefilled with cluster
              alert(`Create brief for cluster ${id} - Coming soon`);
            }}
          />
        ))}

        {/* Unclustered briefs */}
        {briefsByCluster["unclustered"] &&
          briefsByCluster["unclustered"].length > 0 && (
            <div className="card bg-base-200/50 shadow-sm border border-base-200 border-dashed">
              <div className="card-body p-4">
                <h3 className="font-semibold text-lg text-base-content/70">
                  Unclustered Ideas
                </h3>
                <div className="divider my-2" />
                <div className="space-y-2 opacity-80">
                  {briefsByCluster["unclustered"].map((brief) => (
                    <div
                      key={brief.id}
                      className="text-sm p-2 bg-base-100 rounded border border-base-300"
                    >
                      {brief.targetKeyword}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Basic modal stub for creating clusters */}
      {isClusterModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create Topic Cluster</h3>
            <p className="py-4 text-base-content/70">
              Cluster forms are coming in the next iteraton.
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setIsClusterModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
