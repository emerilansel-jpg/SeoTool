import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthenticatedContext,
  requirePlatformAdmin,
} from "@/serverFunctions/middleware";
import { isPlatformAdmin } from "@/server/lib/platform-admin";
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
 *  platform admin. Keeps admin IDs/emails server-side. */
export const checkIsPlatformAdmin = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    if (
      import.meta.env.BYPASS_AUTH === "true" ||
      import.meta.env.VITE_E2E_BYPASS_AUTH === "true"
    ) {
      return true;
    }
    return isPlatformAdmin({
      userId: context.userId,
      userEmail: context.userEmail,
    });
  });

export type { AnalyticsOverview };
