import { createFileRoute } from "@tanstack/react-router";
import { FileCheck } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { OnPageCheckerView } from "@/client/features/on-page-checker/OnPageCheckerView";

export const Route = createFileRoute("/_project/p/$projectId/on-page-checker")({
  component: OnPageCheckerRoute,
});

function OnPageCheckerRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <FeatureHeader
          icon={FileCheck}
          title="On-Page SEO"
          badge="Page Health & Structure Analyzer"
          description="Analyze any URL for on-page SEO factors including title, meta description, headings, images, links, and technical signals."
        />
        <OnPageCheckerView projectId={projectId} />
      </div>
    </div>
  );
}
