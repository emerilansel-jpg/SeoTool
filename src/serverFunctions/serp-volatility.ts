import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { SerpVolatilityService } from "@/server/features/serp-volatility/services/SerpVolatilityService";

const volatilityTrendSchema = z.object({
  projectId: z.string(),
  days: z.number().optional().default(30),
});

/** Get the latest SERP volatility snapshot and trend for the project. */
export const getSerpVolatility = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(volatilityTrendSchema)
  .handler(async ({ data: { projectId, days } }) => {
    const [latest, trend, isComputable] = await Promise.all([
      SerpVolatilityService.getLatestVolatility(projectId),
      SerpVolatilityService.getVolatilityTrend(projectId, days),
      SerpVolatilityService.checkEligibility(projectId),
    ]);
    return { latest, trend, isComputable };
  });

const computeVolatilitySchema = z.object({
  projectId: z.string(),
});

/** Trigger a SERP volatility computation for the project. */
export const computeSerpVolatility = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(computeVolatilitySchema)
  .handler(async ({ data: { projectId } }) => {
    return SerpVolatilityService.computeVolatility(projectId);
  });
