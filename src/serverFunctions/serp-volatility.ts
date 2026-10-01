import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { SerpVolatilityService } from "@/server/features/serp-volatility/services/SerpVolatilityService";

export const volatilityTrendDaysSchema = z.union([
  z.literal(7),
  z.literal(30),
  z.literal(90),
]);

export const volatilityTrendSchema = z.object({
  projectId: z.string(),
  days: volatilityTrendDaysSchema.optional().default(30),
});

export const computeVolatilitySchema = z.object({
  projectId: z.string(),
});

function assertRequestedProject(
  requestedProjectId: string,
  currentProjectId: string,
) {
  if (requestedProjectId !== currentProjectId) {
    throw new Error("Project mismatch in authenticated request");
  }
}

/** Get latest SERP volatility snapshot and trend. Lazily backfills missing dates. */
export const getSerpVolatility = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(volatilityTrendSchema)
  .handler(async ({ data: { projectId, days }, context }) => {
    assertRequestedProject(projectId, context.projectId);
    await SerpVolatilityService.backfillBestEffort(context.projectId);

    const [latest, trend, isComputable] = await Promise.all([
      SerpVolatilityService.getLatestVolatility(context.projectId),
      SerpVolatilityService.getVolatilityTrend(context.projectId, days),
      SerpVolatilityService.checkEligibility(context.projectId),
    ]);
    return { latest, trend, isComputable };
  });

/** Trigger a SERP volatility computation for the project. */
export const computeSerpVolatility = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(computeVolatilitySchema)
  .handler(async ({ data: { projectId }, context }) => {
    assertRequestedProject(projectId, context.projectId);
    return SerpVolatilityService.computeVolatility(context.projectId);
  });
