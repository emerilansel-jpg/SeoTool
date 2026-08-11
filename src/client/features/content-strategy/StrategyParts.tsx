import React from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Target, CheckCircle2 } from "lucide-react";
import type { topicClusters, contentBriefs } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type TopicClusterValue = InferSelectModel<typeof topicClusters>;
type ContentBriefValue = InferSelectModel<typeof contentBriefs>;

export function ClusterCard({
  cluster,
  briefs,
  projectId,
  onAddBrief,
}: {
  cluster: TopicClusterValue;
  briefs: ContentBriefValue[];
  projectId: string;
  onAddBrief: (clusterId: string) => void;
}) {
  return (
    <div className="card bg-base-100 shadow border border-base-200">
      <div className="card-body p-4">
        <h3 className="font-semibold text-lg flex items-center justify-between">
          <span>{cluster.name}</span>
          {cluster.pillarPageUrl && (
            <a
              href={cluster.pillarPageUrl}
              target="_blank"
              rel="noreferrer"
              className="badge badge-primary badge-outline text-xs"
              title="Pillar Page"
            >
              <Target className="w-3 h-3 mr-1" /> Pillar
            </a>
          )}
        </h3>
        {cluster.description && (
          <p className="text-sm text-base-content/70">{cluster.description}</p>
        )}

        <div className="divider my-2" />

        <div className="space-y-2">
          {briefs.length === 0 ? (
            <p className="text-xs text-base-content/50 italic py-2">
              No briefs planned yet
            </p>
          ) : (
            briefs.map((brief) => (
              <BriefItem key={brief.id} brief={brief} projectId={projectId} />
            ))
          )}

          <button
            className="btn btn-sm btn-ghost w-full justify-start text-base-content/60 hover:text-base-content"
            onClick={() => onAddBrief(cluster.id)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Brief
          </button>
        </div>
      </div>
    </div>
  );
}

function BriefItem({
  brief,
  projectId,
}: {
  brief: ContentBriefValue;
  projectId: string;
}) {
  const statusColors: Record<string, string> = {
    idea: "bg-base-200 text-base-content",
    briefing: "bg-info/20 text-info",
    writing: "bg-warning/20 text-warning-content",
    published: "bg-success/20 text-success",
    archived: "bg-base-300 text-base-content/50 line-through",
  };

  return (
    <Link
      to="/p/$projectId/strategy/briefs/$briefId"
      params={{ projectId, briefId: brief.id }}
      className="flex items-start gap-2 p-2 rounded-md hover:bg-base-200/50 group text-sm transition-colors"
    >
      <CheckCircle2
        className={`w-4 h-4 mt-0.5 shrink-0 ${brief.status === "published" ? "text-success" : "text-base-content/30"}`}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{brief.targetKeyword}</div>
        {brief.title && (
          <div className="text-xs text-base-content/70 truncate">
            {brief.title}
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {brief.priorityScore && (
          <span
            className="text-xs font-mono text-base-content/50"
            title="Priority Score"
          >
            {brief.priorityScore}
          </span>
        )}
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${statusColors[brief.status]}`}
        >
          {brief.status}
        </span>
      </div>
    </Link>
  );
}

// Stub for empty state
export function EmptyStrategyState({
  onCreateCluster,
}: {
  onCreateCluster: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-base-300 rounded-box">
      <Target className="w-12 h-12 text-base-content/30 mb-4" />
      <h3 className="text-lg font-semibold">Build Your Strategy</h3>
      <p className="text-base-content/70 max-w-md mt-2 mb-6">
        Organize your keywords into Topic Clusters and plan Content Briefs to
        systematically close the content gap.
      </p>
      <button className="btn btn-primary" onClick={onCreateCluster}>
        <Plus className="w-4 h-4 mr-2" /> Create Topic Cluster
      </button>
    </div>
  );
}
