// oxlint-disable @typescript-eslint/no-unsafe-type-assertion
// oxlint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useHostedAuthRouteGuard } from "@/client/features/auth/useHostedAuthRouteGuard";
import { AuthenticatedAppLayout } from "@/client/layout/AppShell";
import { useOnboardingRedirect } from "@/client/features/onboarding/useOnboardingRedirect";
import { usePaidPlanGuard } from "@/client/features/billing/use-paid-plan-guard";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    // E2E bypass: when running Playwright with BYPASS_AUTH, skip the auth
    // redirect so tests don't need a real sign-in flow. The server-side
    // middleware (ensureUserMiddleware) also checks BYPASS_AUTH and returns a
    // fake user context, so all server functions will work.
    const isE2EServer = import.meta.env.BYPASS_AUTH === "true";
    const isE2EClient =
      typeof window !== "undefined" &&
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH === true;

    if (isE2EServer || isE2EClient) {
      return;
    }
  },
  component: AppRouteLayout,
});

function AppRouteLayout() {
  const authGate = useHostedAuthRouteGuard();
  const onboarding = useOnboardingRedirect();

  // Paywall guard only fires AFTER onboarding is resolved. If onboarding is
  // still loading or the user needs to visit /onboarding first, the paywall
  // guard is inert (onboardingIncomplete=true). This prevents the race
  // condition where a free user gets stuck on /subscribe without ever seeing
  // the wizard.
  const paywall = usePaidPlanGuard(
    onboarding.isChecking || onboarding.needsOnboarding,
  );

  const isHelpPath =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/help");

  if (isHelpPath) {
    return (
      <div className="min-h-screen bg-base-200">
        <Outlet />
      </div>
    );
  }

  // 1. Auth not resolved yet (or not authenticated) -> spinner
  if (!authGate.canRenderAuthenticatedContent) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  // 2. Auth OK, but onboarding still loading -> spinner (don't render tools
  //    yet; the onboarding redirect useEffect may fire next tick). Exempt
  //    paths like /settings and /billing must render even during onboarding
  //    so users can delete their account or manage their subscription.
  const isOnboardingExemptPath =
    typeof window !== "undefined" &&
    ["/settings", "/billing"].some(
      (p) =>
        window.location.pathname === p ||
        window.location.pathname.startsWith(`${p}/`),
    );
  if (onboarding.isChecking && !isOnboardingExemptPath) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  // 3. Auth OK, but paywall hasn't passed yet -> spinner (paywall useEffect
  //    will redirect to /subscribe, or we're waiting for plan-tier load).
  if (!paywall.canUseTools) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  // 4. All guards passed -> render the app.
  return (
    <AuthenticatedAppLayout>
      <Outlet />
    </AuthenticatedAppLayout>
  );
}
