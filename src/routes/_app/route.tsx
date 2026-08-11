// oxlint-disable @typescript-eslint/no-unsafe-type-assertion
// oxlint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useHostedAuthRouteGuard } from "@/client/features/auth/useHostedAuthRouteGuard";
import { AuthenticatedAppLayout } from "@/client/layout/AppShell";
import { useOnboardingRedirect } from "@/client/features/onboarding/useOnboardingRedirect";

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
  useOnboardingRedirect();

  if (!authGate.canRenderAuthenticatedContent) {
    return null;
  }

  return (
    <AuthenticatedAppLayout>
      <Outlet />
    </AuthenticatedAppLayout>
  );
}
