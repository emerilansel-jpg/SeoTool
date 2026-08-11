import { createFileRoute } from "@tanstack/react-router";
import { StrategyPageView } from "@/client/features/content-strategy/StrategyPageView";

export const Route = createFileRoute("/_project/p/$projectId/strategy/")({
  component: StrategyPage,
});

function StrategyPage() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <StrategyPageView projectId={projectId} />
  );
}
