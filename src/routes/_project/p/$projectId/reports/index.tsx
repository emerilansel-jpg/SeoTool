import { createFileRoute } from "@tanstack/react-router";
import { ReportsListPage } from "@/client/features/reports/ReportsListPage";

export const Route = createFileRoute("/_project/p/$projectId/reports/")({
  component: ReportsIndexRoute,
});

function ReportsIndexRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <ReportsListPage projectId={projectId} />
  );
}
