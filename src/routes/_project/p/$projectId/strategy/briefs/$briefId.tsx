import { createFileRoute } from "@tanstack/react-router";
import { BriefDetailView } from "@/client/features/content-strategy/BriefDetailView";

export const Route = createFileRoute(
  "/_project/p/$projectId/strategy/briefs/$briefId",
)({
  component: BriefDetailPage,
});

function BriefDetailPage() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId, briefId } = Route.useParams();
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
    <BriefDetailView projectId={projectId} briefId={briefId} />
  );
}
