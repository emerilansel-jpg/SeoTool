import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { BulkToolsView } from "@/client/features/bulk-tools/BulkToolsView";

export const Route = createFileRoute("/_project/p/$projectId/bulk-tools")({
  component: BulkToolsRoute,
});

function BulkToolsRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Boxes}
          title="Bulk Tools"
          badge="Productivity Suite"
          description="Run keyword metrics, search intent, People Also Ask, autocomplete, brand mentions, and metadata rewrites in bulk instead of one query at a time."
        />
        <BulkToolsView projectId={projectId} />
      </div>
    </div>
  );
}
