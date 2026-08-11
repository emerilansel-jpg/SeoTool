import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/client/features/dashboard/DashboardPage";

export const Route = createFileRoute("/_project/p/$projectId/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <DashboardPage projectId={projectId} />
  );
}
