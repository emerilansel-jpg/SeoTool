import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { GmbGridView } from "@/client/features/gmb-grid/GmbGridView";

export const Route = createFileRoute("/_project/p/$projectId/gmb-grid")({
  component: GmbGridPage,
});

function GmbGridPage() {
  const { projectId } = Route.useParams();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 pb-24 sm:px-6">
      <FeatureHeader
        icon={MapPin}
        title="Local Map Rank"
        badge="Google Maps Grid Tracker"
        description="Measure how your exact Google Business Profile ranks from every point in a local geographic grid."
      />
      <GmbGridView projectId={projectId} />
    </div>
  );
}
