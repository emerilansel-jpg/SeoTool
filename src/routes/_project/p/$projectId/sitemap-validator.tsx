import { createFileRoute } from "@tanstack/react-router";
import { FileCode } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { SitemapValidationView } from "@/client/features/sitemap-validation/SitemapValidationView";

export const Route = createFileRoute(
  "/_project/p/$projectId/sitemap-validator",
)({
  component: SitemapValidatorRoute,
});

function SitemapValidatorRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={FileCode}
          title="Sitemap Validator"
          badge="XML Indexing & URL Health"
          description="Fetch and validate your XML sitemap. Check for errors, duplicates, and indexing best practices."
        />
        <SitemapValidationView projectId={projectId} />
      </div>
    </div>
  );
}
