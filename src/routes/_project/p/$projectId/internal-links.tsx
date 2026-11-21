import { createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { InternalLinksView } from "@/client/features/internal-links/InternalLinksView";

export const Route = createFileRoute("/_project/p/$projectId/internal-links")({
  component: InternalLinksRoute,
});

function InternalLinksRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Link2}
          title="Internal Links"
          badge="Quick Wins"
          description="Get internal link suggestions from your site audit body text and the Search Console keywords ranking 4-20: anchor text, a ready-to-paste sentence, and an approval queue."
        />
        <InternalLinksView projectId={projectId} />
      </div>
    </div>
  );
}
