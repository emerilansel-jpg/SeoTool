import { createFileRoute } from "@tanstack/react-router";
import { Webhook } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { AutomationsView } from "@/client/features/automations/AutomationsView";

export const Route = createFileRoute("/_project/p/$projectId/automations")({
  component: AutomationsRoute,
});

function AutomationsRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Webhook}
          title="Automations"
          badge="Webhooks"
          description="Get a POST notification whenever a site audit, rank check, or report finishes. Signed with HMAC SHA-256, with delivery history and test pings."
        />
        <AutomationsView projectId={projectId} />
      </div>
    </div>
  );
}
