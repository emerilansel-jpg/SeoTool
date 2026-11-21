import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { CompetitorTrafficView } from "@/client/features/competitor-traffic/CompetitorTrafficView";

export const Route = createFileRoute(
  "/_project/p/$projectId/competitor-traffic",
)({
  component: CompetitorTrafficRoute,
});

function CompetitorTrafficRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={TrendingUp}
          title="Competitor Traffic"
          badge="Market Intel"
          description="Compare estimated monthly organic traffic and traffic value for up to five domains, then drill into each domain's top pages by traffic."
        />
        <CompetitorTrafficView projectId={projectId} />
      </div>
    </div>
  );
}
