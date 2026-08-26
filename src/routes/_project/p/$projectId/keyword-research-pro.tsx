import { createFileRoute } from "@tanstack/react-router";
import { KeywordResearchProPage } from "@/client/features/keywords-pro/KeywordResearchProPage";
import { z } from "zod";

const searchSchema = z.object({
  checkout: z.enum(["success", "cancelled"]).optional().catch(undefined),
  subscription_id: z.string().max(128).optional().catch(undefined),
  ref: z.string().max(32).optional().catch(undefined),
});

export const Route = createFileRoute(
  "/_project/p/$projectId/keyword-research-pro",
)({
  validateSearch: searchSchema,
  component: KeywordResearchProRoute,
});

function KeywordResearchProRoute() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch();
  return (
    <div className="overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Keyword Research Pro</h1>
            <span className="badge badge-primary badge-sm">PRO</span>
          </div>
          <p className="max-w-3xl text-sm text-base-content/70">
            Find low-competition keywords with KGR, page-one content gaps and
            optional backlink competition—all in one report.
          </p>
        </div>
        <KeywordResearchProPage
          projectId={projectId}
          checkout={search.checkout}
          subscriptionId={search.subscription_id}
          initialReferralCode={search.ref}
        />
      </div>
    </div>
  );
}
