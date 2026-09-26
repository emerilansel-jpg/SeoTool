import { createFileRoute } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { ContentGapView } from "@/client/features/content-intelligence/ContentGapView";

export const Route = createFileRoute("/_project/p/$projectId/content-gap")({
  component: ContentGapRoute,
});

function ContentGapRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Swords}
          title="Content Gap"
          badge="Competitor Keyword Intersect"
          description="Find high-intent keywords your competitors rank for that your site is missing."
        />
        {/* oxlint-disable-next-line typescript-eslint/no-unsafe-assignment */}
        <ContentGapView projectId={projectId} />
      </div>
    </div>
  );
}
