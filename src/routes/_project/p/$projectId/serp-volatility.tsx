import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { SerpVolatilityView } from "@/client/features/serp-volatility/SerpVolatilityView";

export const Route = createFileRoute("/_project/p/$projectId/serp-volatility")({
  component: SerpVolatilityRoute,
});

function SerpVolatilityRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Activity}
          title="SERP Volatility"
          badge="Algorithm Instability Tracker"
          description="Track day-over-day ranking instability and potential Google algorithm updates across your tracked keywords."
        />
        {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
        <SerpVolatilityView projectId={projectId} />
      </div>
    </div>
  );
}
