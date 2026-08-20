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
 * before any tool UI renders.
 *
 * When `onboardingIncomplete` is true the guard does NOT redirect, so the
 * onboarding wizard (which is reachable without payment) can complete before
 * the paywall kicks in. The caller is responsible for rendering a spinner
 * while onboarding is still resolving.
 */
export function usePaidPlanGuard(onboardingIncomplete: boolean = false) {
  const navigate = useNavigate();
  const { isPaid, isLoading } = useIsPaidPlan();
  const isHostedMode = isHostedClientAuthMode();

  const isE2EBypass =
    import.meta.env.BYPASS_AUTH === "true" ||
    (typeof window !== "undefined" &&
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH ===
        true);

  useEffect(() => {
    if (isE2EBypass || !isHostedMode || isLoading || onboardingIncomplete) {
      return;
    }

    // Platform admins keep admin-area access even on a free org; the admin
    // server functions enforce requirePlatformAdmin independently.
    const isAdminPath =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin");

    if (!isPaid && !isAdminPath) {
      void navigate({
        href: `${SUBSCRIBE_ROUTE}?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`,
        replace: true,
      });
    }
  }, [
    isE2EBypass,
    isHostedMode,
    isLoading,
    isPaid,
    navigate,
    onboardingIncomplete,
  ]);

  return {
    canUseTools:
      isE2EBypass ||
      !isHostedMode ||
      (!isLoading && !onboardingIncomplete && isPaid),
  };
}
