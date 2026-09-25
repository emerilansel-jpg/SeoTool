import { createFileRoute } from "@tanstack/react-router";
import { Waypoints } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { LinkIntersectView } from "@/client/features/link-intersect/LinkIntersectView";

export const Route = createFileRoute("/_project/p/$projectId/link-intersect")({
  component: LinkIntersectRoute,
});

function LinkIntersectRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <FeatureHeader
          icon={Waypoints}
          title="Link Intersect"
          badge="Backlink Opportunity Discovery"
          description="Find domains linking to your competitors but not to you — high-converting outreach opportunities."
        />
        {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
        <LinkIntersectView projectId={projectId} />
      </div>
    </div>
  );
}
