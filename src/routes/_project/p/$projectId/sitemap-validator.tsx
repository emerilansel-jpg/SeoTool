import { createFileRoute } from "@tanstack/react-router";
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
      <div className="mx-auto max-w-7xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Sitemap Validator</h1>
          <p className="text-sm text-base-content/70">
            Fetch and validate your XML sitemap. Check for errors, duplicates,
            and best practices.
          </p>
        </div>
        <SitemapValidationView projectId={projectId} />
      </div>
    </div>
  );
}
