import { createFileRoute } from "@tanstack/react-router";
import { CrawlBudgetView } from "@/client/features/crawl-budget/CrawlBudgetView";

export const Route = createFileRoute("/_project/p/$projectId/crawl-budget")({
  component: CrawlBudgetRoute,
});

function CrawlBudgetRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Crawl Budget Analysis</h1>
          <p className="text-sm text-base-content/70">
            Analyze server access logs to understand how search engine bots
            crawl your site. Identify wasted crawl budget and optimization
            opportunities.
          </p>
        </div>
        <CrawlBudgetView projectId={projectId} />
      </div>
    </div>
  );
}
