import { createFileRoute } from "@tanstack/react-router";
import { SearchPerformancePage } from "@/client/features/search-performance/SearchPerformancePage";

export const Route = createFileRoute(
  "/_project/p/$projectId/search-performance",
)({
  component: SearchPerformanceRoute,
});

function SearchPerformanceRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <SearchPerformancePage projectId={projectId} />
  );
}
