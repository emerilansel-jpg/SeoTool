import { createFileRoute } from "@tanstack/react-router";
import { LinkIntersectView } from "@/client/features/link-intersect/LinkIntersectView";

export const Route = createFileRoute("/_project/p/$projectId/link-intersect")({
  component: LinkIntersectRoute,
});

function LinkIntersectRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Link Intersect</h1>
        <p className="text-sm text-base-content/60">
          Find domains linking to your competitors but not to you — potential
          link-building opportunities.
        </p>
      </div>
      {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
      <LinkIntersectView projectId={projectId} />
    </div>
  );
}
