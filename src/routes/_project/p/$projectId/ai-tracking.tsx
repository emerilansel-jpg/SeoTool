import { createFileRoute } from "@tanstack/react-router";
import { AiTrackingPage } from "@/client/features/ai-tracking/AiTrackingPage";

export const Route = createFileRoute("/_project/p/$projectId/ai-tracking")({
  component: AiTrackingRoute,
});

function AiTrackingRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  return <AiTrackingPage projectId={projectId} />;
}
