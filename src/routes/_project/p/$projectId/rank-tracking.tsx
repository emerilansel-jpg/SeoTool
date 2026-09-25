import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";

export const Route = createFileRoute("/_project/p/$projectId/rank-tracking")({
  component: RankTrackingLayout,
});

function RankTrackingLayout() {
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <FeatureHeader
          icon={TrendingUp}
          title="Rank Tracking"
          badge="Daily Position Monitoring"
          description="Track keyword positions, search visibility, and historical rank trends across domains."
        />

        <Outlet />
      </div>
    </div>
  );
}
