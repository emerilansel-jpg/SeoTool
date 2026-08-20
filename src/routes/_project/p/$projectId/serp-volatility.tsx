import { createFileRoute } from "@tanstack/react-router";
import { SerpVolatilityView } from "@/client/features/serp-volatility/SerpVolatilityView";

export const Route = createFileRoute("/_project/p/$projectId/serp-volatility")({
  component: SerpVolatilityRoute,
});

function SerpVolatilityRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          SERP Volatility
        </h1>
        <p className="text-sm text-base-content/60">
          Track day-over-day ranking instability and potential Google algorithm
          updates across your tracked keywords.
        </p>
      </div>
      {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
      <SerpVolatilityView projectId={projectId} />
    </div>
  );
}
