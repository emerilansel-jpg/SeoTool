import { createFileRoute } from "@tanstack/react-router";
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
      <div className="mx-auto max-w-7xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Keyword Clustering</h1>
          <p className="text-sm text-base-content/70">
            Group keywords by SERP similarity. Keywords with overlapping search
            results are clustered together for content planning.
          </p>
        </div>
        <KeywordClusteringView projectId={projectId} />
      </div>
    </div>
  );
}
