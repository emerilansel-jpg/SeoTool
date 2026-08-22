import { createFileRoute } from "@tanstack/react-router";
import { ContentGapView } from "@/client/features/content-intelligence/ContentGapView";

export const Route = createFileRoute("/_project/p/$projectId/content-gap")({
  component: ContentGapRoute,
});

function ContentGapRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Content Gap</h1>
          <p className="text-sm text-base-content/70">
            Find high-intent keywords your competitors rank for that your site
            is missing.
          </p>
        </div>
        {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
        <ContentGapView projectId={projectId} />
      </div>
    </div>
  );
}
