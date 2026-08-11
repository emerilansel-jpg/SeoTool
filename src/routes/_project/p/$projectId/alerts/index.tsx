import { createFileRoute } from "@tanstack/react-router";
import { AlertsPageView } from "@/client/features/alerts/AlertsPageView";

export const Route = createFileRoute("/_project/p/$projectId/alerts/")({
  component: AlertsPage,
});

function AlertsPage() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <AlertsPageView projectId={projectId} />
  );
}
