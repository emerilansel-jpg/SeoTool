import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { KeywordClusteringView } from "@/client/features/keyword-clustering/KeywordClusteringView";

export const Route = createFileRoute(
  "/_project/p/$projectId/keyword-clustering",
)({
  component: KeywordClusteringRoute,
});

function KeywordClusteringRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Layers}
          title="Keyword Clustering"
          badge="Semantic SERP Grouping"
          description="Group keywords by SERP similarity. Keywords with overlapping search results are clustered together for content planning."
        />
        <KeywordClusteringView projectId={projectId} />
      </div>
    </div>
  );
}
