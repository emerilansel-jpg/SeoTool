import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { GoogleReviewsView } from "@/client/features/nap-finder/GoogleReviewsView";

export const Route = createFileRoute("/_project/p/$projectId/google-reviews")({
  component: GoogleReviewsRoute,
});

function GoogleReviewsRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={Star}
          title="Google Reviews"
          badge="Local SEO"
          description="Pull the Google Business Profile (rating, review count, NAP, category) and the latest reviews for any establishment, then keep them in the project for reporting."
        />
        <GoogleReviewsView projectId={projectId} />
      </div>
    </div>
  );
}
