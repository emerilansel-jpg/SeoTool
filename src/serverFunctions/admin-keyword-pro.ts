import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { KeywordProConfigService } from "@/server/features/keywords/services/KeywordProConfigService";
import { KEYWORD_PRO_COHORT_KEYS } from "@/shared/keyword-pro-membership";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";

export const getAdminKeywordProCohorts = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(() => KeywordProConfigService.getCohorts());

export const saveAdminKeywordProCohort = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(
    z.object({
      key: z.enum(KEYWORD_PRO_COHORT_KEYS),
      priceUsdCents: z.number().int().min(100).max(100_000),
      active: z.boolean(),
    }),
  )
  .handler(({ data, context }) =>
    KeywordProConfigService.saveCohort(data, context.userId),
  );

export const initializeAdminKeywordProPaypalPlans = createServerFn({
  method: "POST",
})
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .validator(z.object({ confirmed: z.literal(true) }))
  .handler(({ context }) =>
    KeywordProConfigService.initializePaypalPlans(context.userId),
  );
