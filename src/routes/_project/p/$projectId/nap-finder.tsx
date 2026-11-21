import { createFileRoute } from "@tanstack/react-router";
import { MapPinned } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { NapFinderView } from "@/client/features/nap-finder/NapFinderView";

export const Route = createFileRoute("/_project/p/$projectId/nap-finder")({
  component: NapFinderRoute,
});

function NapFinderRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={MapPinned}
          title="N.A.P Finder"
          badge="Local Citations"
          description="Audit how your business Name, Address, and Phone appear on Google and the major directories (Yelp, Yellow Pages, BBB, MapQuest, Facebook). Inconsistent citations cost local rankings."
        />
        <NapFinderView projectId={projectId} />
      </div>
    </div>
  );
}
