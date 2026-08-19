// oxlint-disable @typescript-eslint/no-unsafe-type-assertion
// oxlint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SUBSCRIBE_ROUTE } from "@/shared/billing";
import { useIsPaidPlan } from "@/client/features/billing/use-billing";
import { isHostedClientAuthMode } from "@/lib/auth-mode";

/**
 * Hard paywall guard for the authenticated app. Mirrors
 * useHostedAuthRouteGuard: once the plan tier is loaded, a free-tier user is
 * redirected to /subscribe (keeping the current path as the return target)
 * before any tool UI renders. The E2E bypass skips the check so Playwright
 * keeps its ungated fake context.
 */
export function usePaidPlanGuard() {
  const navigate = useNavigate();
  const { isPaid, isLoading } = useIsPaidPlan();
  const isHostedMode = isHostedClientAuthMode();

  const isE2EBypass =
    import.meta.env.BYPASS_AUTH === "true" ||
    (typeof window !== "undefined" &&
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH ===
        true);

  useEffect(() => {
    if (isE2EBypass || !isHostedMode || isLoading) {
      return;
    }

    if (!isPaid) {
      void navigate({
        href: `${SUBSCRIBE_ROUTE}?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`,
        replace: true,
      });
    }
  }, [isE2EBypass, isHostedMode, isLoading, isPaid, navigate]);

  return {
    canUseTools: isE2EBypass || !isHostedMode || (!isLoading && isPaid),
  };
}
