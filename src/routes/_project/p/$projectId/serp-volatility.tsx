import { createFileRoute } from "@tanstack/react-router";
import { SerpVolatilityView } from "@/client/features/serp-volatility/SerpVolatilityView";

export const Route = createFileRoute("/_project/p/$projectId/serp-volatility")({
  component: SerpVolatilityRoute,
});

function SerpVolatilityRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">SERP Volatility</h1>
        <p className="text-sm text-base-content/60">
          Track day-over-day ranking instability across your tracked keywords.
          High volatility may indicate algorithm updates or competitive shifts.
        </p>
      </div>
      {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
      <SerpVolatilityView projectId={projectId} />
    </div>
  );
}
