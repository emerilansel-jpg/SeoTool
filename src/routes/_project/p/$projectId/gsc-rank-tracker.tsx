import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { GscRankTrackerView } from "@/client/features/gsc-rank-tracker/GscRankTrackerView";

export const Route = createFileRoute("/_project/p/$projectId/gsc-rank-tracker")(
  {
    component: GscRankTrackerRoute,
  },
);

function GscRankTrackerRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Activity}
          title="GSC Rank Tracker"
          badge="Free · Google Search Console"
          description="Track every keyword Search Console already knows about, with daily position history and one-click explanations of why a position moved. No SERP API credits used."
        />
        <GscRankTrackerView projectId={projectId} />
      </div>
    </div>
  );
}
