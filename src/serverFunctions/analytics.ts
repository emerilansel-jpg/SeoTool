import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import {
  AnalyticsRepository,
  type AnalyticsOverview,
} from "@/server/features/analytics/AnalyticsRepository";

export const getAnalyticsOverview = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext, requirePlatformAdmin])
  .handler(async () => {
    return AnalyticsRepository.getOverview();
  });

/** Lightweight check for route guards — returns true if the current user is a
 *  platform admin. Keeps admin IDs server-side. */
export const checkIsPlatformAdmin = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    const adminIdsRaw = await getOptionalEnvValue("PLATFORM_ADMIN_USER_IDS");
    const adminIds = adminIdsRaw
      ? adminIdsRaw
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];
    return adminIds.includes(context.userId);
  });

export type { AnalyticsOverview };
