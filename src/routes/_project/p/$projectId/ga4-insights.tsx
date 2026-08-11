import { createFileRoute } from "@tanstack/react-router";
import { Ga4InsightsPage } from "@/client/features/ga4-insights/Ga4InsightsPage";

export const Route = createFileRoute("/_project/p/$projectId/ga4-insights")({
  component: Ga4InsightsRoute,
});

function Ga4InsightsRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <Ga4InsightsPage projectId={projectId} />
  );
}
