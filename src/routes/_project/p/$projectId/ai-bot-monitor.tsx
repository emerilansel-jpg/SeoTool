import { createFileRoute } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { AiBotMonitorView } from "@/client/features/ai-bots/AiBotMonitorView";

export const Route = createFileRoute("/_project/p/$projectId/ai-bot-monitor")({
  component: AiBotMonitorRoute,
});

function AiBotMonitorRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Radar}
          title="AI Bot Monitor"
          badge="AEO / GEO"
          description="Track how AI crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot) hit your site versus classic search engines. Connect a beacon or upload access logs to build the AI-vs-Search baseline."
        />
        <AiBotMonitorView projectId={projectId} />
      </div>
    </div>
  );
}
