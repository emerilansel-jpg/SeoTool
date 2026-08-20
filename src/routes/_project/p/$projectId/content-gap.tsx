import { createFileRoute } from "@tanstack/react-router";
import { ContentGapView } from "@/client/features/content-intelligence/ContentGapView";

export const Route = createFileRoute("/_project/p/$projectId/content-gap")({
  component: ContentGapRoute,
});

function ContentGapRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          Content Gap
        </h1>
        <p className="text-sm text-base-content/60">
          Find high-intent keywords your competitors rank for that your site is
          missing.
        </p>
      </div>
      {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
      <ContentGapView projectId={projectId} />
    </div>
  );
}
