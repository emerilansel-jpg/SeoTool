import { createFileRoute } from "@tanstack/react-router";
import { ContentGapView } from "@/client/features/content-intelligence/ContentGapView";

export const Route = createFileRoute("/_project/p/$projectId/content-gap")({
  component: ContentGapRoute,
});

function ContentGapRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Content Gap</h1>
        <p className="text-sm text-base-content/60">
          Find keywords your competitors rank for that your site doesn&apos;t.
        </p>
      </div>
      {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
      <ContentGapView projectId={projectId} />
    </div>
  );
}
