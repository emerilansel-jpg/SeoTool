import { createFileRoute } from "@tanstack/react-router";
import { LinkIntersectView } from "@/client/features/link-intersect/LinkIntersectView";

export const Route = createFileRoute("/_project/p/$projectId/link-intersect")({
  component: LinkIntersectRoute,
});

function LinkIntersectRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Link Intersect</h1>
          <p className="text-sm text-base-content/70">
            Find domains linking to your competitors but not to you —
            high-converting outreach opportunities.
          </p>
        </div>
        {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
        <LinkIntersectView projectId={projectId} />
      </div>
    </div>
  );
}
