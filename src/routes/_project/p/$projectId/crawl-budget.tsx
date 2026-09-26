import { createFileRoute } from "@tanstack/react-router";
import { Bug } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { CrawlBudgetView } from "@/client/features/crawl-budget/CrawlBudgetView";

export const Route = createFileRoute("/_project/p/$projectId/crawl-budget")({
  component: CrawlBudgetRoute,
});

function CrawlBudgetRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Bug}
          title="Crawl Budget"
          badge="Log Analysis & Bot Diagnostics"
          description="Analyze server access logs to understand how search engine bots crawl your site. Identify wasted crawl budget and optimization opportunities."
        />
        <CrawlBudgetView projectId={projectId} />
      </div>
    </div>
  );
}
