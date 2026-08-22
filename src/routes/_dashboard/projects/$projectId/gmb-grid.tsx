import { createFileRoute } from "@tanstack/react-router";
import { GmbGridView } from "@/client/features/gmb-grid/GmbGridView";

export const Route = createFileRoute(
  "/_dashboard/projects/$projectId/gmb-grid"
)({
  component: GmbGridPage,
});

function GmbGridPage() {
  const { projectId } = Route.useParams();
  return (
    <div className="flex flex-col gap-6 w-full px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">GMB Rank Tracker</h1>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Track your Google My Business rankings across a local geographic grid.
      </p>
      
      <GmbGridView projectId={projectId} />
    </div>
  );
}
