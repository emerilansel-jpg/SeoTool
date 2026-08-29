import { createServerFn } from "@tanstack/react-start";
import { KeywordResearchProService } from "@/server/features/keywords/services/KeywordResearchProService";
import { resolveLabsMarket } from "@/shared/keyword-locations";
import { keywordResearchProSchema } from "@/types/schemas/keyword-research-pro";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { isPlatformAdmin } from "@/server/lib/platform-admin";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { AppError } from "@/server/lib/errors";
import { resolveAllAccessFeatureEntitlement } from "@/shared/keyword-pro-membership";

export const researchKeywordsPro = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(keywordResearchProSchema)
  .handler(async ({ data, context }) => {
    if (await isHostedServerAuthMode()) {
      const [membership, subscription, admin] = await Promise.all([
        KeywordProRepository.getMembership(context.organizationId),
        QuotaRepository.getSubscription(context.organizationId),
        isPlatformAdmin({
          userId: context.userId,
          userEmail: context.userEmail,
        }),
      ]);
      const entitlement = resolveAllAccessFeatureEntitlement({
        membershipStatus: membership?.status,
        membershipCurrentPeriodEnd: membership?.currentPeriodEnd,
        subscription,
      });
      if (!admin && !entitlement.hasFeatureAccess) {
        throw new AppError(
          "PAYMENT_REQUIRED",
          "An active SeoTool.im paid plan is required for Pro Analysis.",
        );
      }
    }
    return KeywordResearchProService.research(
      {
        ...data,
        ...resolveLabsMarket(data, context.project),
        projectId: context.projectId,
      },
      { ...context, projectId: context.projectId },
    );
  });
