import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { IndexNowView } from "@/client/features/indexnow/IndexNowView";

export const Route = createFileRoute("/_project/p/$projectId/indexnow")({
  component: IndexNowRoute,
});

function IndexNowRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Zap}
          title="IndexNow"
          badge="Instant Indexing"
          description="Push new or changed URLs straight to Bing, Yandex, Seznam, and Naver via IndexNow. Enable auto-submit to notify engines every time a site audit finds new or changed pages."
        />
        <IndexNowView projectId={projectId} />
      </div>
    </div>
  );
}
