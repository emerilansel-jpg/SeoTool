import { createFileRoute } from "@tanstack/react-router";
import { ListTree } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { ContentOutlineView } from "@/client/features/content-outline/ContentOutlineView";

export const Route = createFileRoute("/_project/p/$projectId/content-outline")({
  component: ContentOutlineRoute,
});

function ContentOutlineRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={ListTree}
          title="Content Outline"
          badge="SERP Structure"
          description="Scrape the top-ranking pages for a keyword, map their heading structure, and generate an AI outline you can export for writing."
        />
        <ContentOutlineView projectId={projectId} />
      </div>
    </div>
  );
}
