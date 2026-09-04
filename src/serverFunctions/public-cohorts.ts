import { createServerFn } from "@tanstack/react-start";

/**
 * Public (unauthenticated) server function that returns current All Access
 * cohort pricing with live occupancy. Used by the public /pricing page.
 *
 * Dynamic-imports KeywordProConfigService inside the handler so the
 * cloudflare:workers transitive dependency stays out of the client bundle.
 */
export const getPublicCohortPricing = createServerFn({ method: "GET" }).handler(
  async () => {
    const { KeywordProConfigService } =
      await import("@/server/features/keywords/services/KeywordProConfigService");
    return KeywordProConfigService.getCohorts();
  },
);
