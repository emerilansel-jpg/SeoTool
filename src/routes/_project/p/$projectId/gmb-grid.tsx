import { createFileRoute } from "@tanstack/react-router";
import { GmbGridView } from "@/client/features/gmb-grid/GmbGridView";

export const Route = createFileRoute("/_project/p/$projectId/gmb-grid")({
  component: GmbGridPage,
});

function GmbGridPage() {
  const { projectId } = Route.useParams();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 pb-24 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Local Map Rank Tracker</h1>
      </div>
      <p className="text-sm text-base-content/60">
        Measure how the exact Google Business Profile ranks from every point in
        a local geographic grid.
      </p>
      <GmbGridView projectId={projectId} />
    </div>
  );
}
