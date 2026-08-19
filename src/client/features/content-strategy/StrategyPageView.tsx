import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  listTopicClusters,
  listContentBriefs,
  createTopicCluster,
  createContentBrief,
} from "@/serverFunctions/content-strategy";
import { useServerFn } from "@tanstack/react-start";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { EmptyStrategyState, ClusterCard } from "./StrategyParts";

type ClusterModalState = { open: boolean };
type BriefModalState = { open: boolean; clusterId: string };

export function StrategyPageView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [clusterModal, setClusterModal] = useState<ClusterModalState>({
    open: false,
  });
  const [briefModal, setBriefModal] = useState<BriefModalState>({
    open: false,
    clusterId: "",
  });

  const clustersQuery = useQuery({
    queryKey: ["topic_clusters", projectId],
    queryFn: () => listTopicClusters({ data: { projectId } }),
  });
  const briefsQuery = useQuery({
    queryKey: ["content_briefs", projectId],
    queryFn: () => listContentBriefs({ data: { projectId } }),
  });

  const clusters = clustersQuery.data ?? [];
  const briefs = briefsQuery.data ?? [];

  if (clustersQuery.isLoading || briefsQuery.isLoading) {
    return (
      <div className="p-6" aria-busy="true">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-56" />
            <div className="skeleton h-4 w-80" />
          </div>
          <div className="skeleton h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card border border-base-300 bg-base-100">
              <div className="card-body gap-3 p-4">
                <div className="skeleton h-5 w-40" />
                <div className="skeleton h-3.5 w-full" />
                <div className="skeleton h-3.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (clusters.length === 0 && briefs.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <EmptyStrategyState
          onCreateCluster={() => setClusterModal({ open: true })}
        />
        <CreateClusterModal
          projectId={projectId}
          state={clusterModal}
          onClose={() => setClusterModal({ open: false })}
          onCreated={() => {
            void queryClient.invalidateQueries({
              queryKey: ["topic_clusters", projectId],
            });
            setClusterModal({ open: false });
          }}
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
          <h1 className="text-2xl font-semibold">Content Strategy</h1>
          <p className="text-sm text-base-content/70">
            Plan topic clusters and manage targeted content briefs.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setClusterModal({ open: true })}
        >
          <Plus className="size-4" /> New Cluster
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((cluster) => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            projectId={projectId}
            briefs={briefsByCluster[cluster.id] || []}
            onAddBrief={(clusterId) => setBriefModal({ open: true, clusterId })}
          />
        ))}

        {/* Unclustered briefs */}
        {briefsByCluster["unclustered"] &&
        briefsByCluster["unclustered"].length > 0 ? (
          <div className="card bg-base-200/50 border border-base-200 border-dashed">
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
        ) : null}
      </div>

      <CreateClusterModal
        projectId={projectId}
        state={clusterModal}
        onClose={() => setClusterModal({ open: false })}
        onCreated={() => {
          void queryClient.invalidateQueries({
            queryKey: ["topic_clusters", projectId],
          });
          setClusterModal({ open: false });
        }}
      />
      <CreateBriefModal
        projectId={projectId}
        state={briefModal}
        onClose={() =>
          setBriefModal({ open: false, clusterId: briefModal.clusterId })
        }
        onCreated={() => {
          void queryClient.invalidateQueries({
            queryKey: ["content_briefs", projectId],
          });
          setBriefModal({ open: false, clusterId: briefModal.clusterId });
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Topic Cluster modal
// ---------------------------------------------------------------------------

function CreateClusterModal({
  projectId,
  state,
  onClose,
  onCreated,
}: {
  projectId: string;
  state: ClusterModalState;
  onClose: () => void;
  onCreated: () => void;
}) {
  const createCluster = useServerFn(createTopicCluster);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pillarPageUrl, setPillarPageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state.open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await createCluster({
        data: {
          projectId,
          name: name.trim(),
          description: description.trim() || null,
          pillarPageUrl: pillarPageUrl.trim() || null,
        },
      });
      toast.success("Cluster created.");
      setName("");
      setDescription("");
      setPillarPageUrl("");
      onCreated();
    } catch (err) {
      setError(
        getStandardErrorMessage(
          err,
          "Could not create the cluster. Please try again.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      maxWidth="max-w-lg"
      onClose={onClose}
      labelledBy="create-cluster-title"
    >
      <h3 id="create-cluster-title" className="text-lg font-semibold">
        Create Topic Cluster
      </h3>
      <p className="text-sm text-base-content/60">
        Group related keywords around a pillar topic.
      </p>

      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <div className="space-y-1.5">
          <label className="text-sm">Cluster name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="e.g. Email marketing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm">
            Description <span className="text-base-content/40">(optional)</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="What this cluster covers"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm">
            Pillar page URL{" "}
            <span className="text-base-content/40">(optional)</span>
          </label>
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder="https://example.com/email-marketing"
            value={pillarPageUrl}
            onChange={(e) => setPillarPageUrl(e.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : null}
            Create Cluster
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Create Content Brief modal
// ---------------------------------------------------------------------------

function CreateBriefModal({
  projectId,
  state,
  onClose,
  onCreated,
}: {
  projectId: string;
  state: BriefModalState;
  onClose: () => void;
  onCreated: () => void;
}) {
  const createBrief = useServerFn(createContentBrief);
  const [targetKeyword, setTargetKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state.open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetKeyword.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await createBrief({
        data: {
          projectId,
          clusterId: state.clusterId || null,
          targetKeyword: targetKeyword.trim(),
          title: title.trim() || null,
        },
      });
      toast.success("Brief added.");
      setTargetKeyword("");
      setTitle("");
      onCreated();
    } catch (err) {
      setError(
        getStandardErrorMessage(
          err,
          "Could not add the brief. Please try again.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      maxWidth="max-w-lg"
      onClose={onClose}
      labelledBy="create-brief-title"
    >
      <h3 id="create-brief-title" className="text-lg font-semibold">
        Add Content Brief
      </h3>
      <p className="text-sm text-base-content/60">
        Plan a new piece of content for this cluster.
      </p>

      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <div className="space-y-1.5">
          <label className="text-sm">Target keyword</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="e.g. best email marketing tools"
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm">
            Working title{" "}
            <span className="text-base-content/40">(optional)</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="A draft title for this brief"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving || !targetKeyword.trim()}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : null}
            Add Brief
          </button>
        </div>
      </form>
    </Modal>
  );
}
