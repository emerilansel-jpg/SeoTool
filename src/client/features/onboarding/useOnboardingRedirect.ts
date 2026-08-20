import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { onboardingAnswersQueryOptions } from "@/client/features/onboarding/onboardingModel";
import { useSession } from "@/lib/auth-client";
import {
  isEmailVerificationBypassed,
  isHostedClientAuthMode,
} from "@/lib/auth-mode";

/**
 * Redirects incomplete-onboarding users to /onboarding and returns the
 * check state so callers (like _app layout) can delay their own guards
 * until onboarding is resolved. Onboarding must be completed BEFORE the
 * paywall guard fires; otherwise a free user gets stuck on /subscribe
 * without ever seeing the wizard.
 */
export function useOnboardingRedirect(): {
  /** True while the onboarding status is being fetched. */
  isChecking: boolean;
  /** True when the user needs to visit /onboarding first. */
  needsOnboarding: boolean;
} {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const isEmailVerified =
    session?.user?.emailVerified === true || isEmailVerificationBypassed();
  const onboardingQuery = useQuery({
    ...onboardingAnswersQueryOptions(),
    enabled: isHostedMode && Boolean(session?.user?.id) && isEmailVerified,
  });

  const isChecking = onboardingQuery.isLoading && !onboardingQuery.isError;
  const needsOnboarding =
    isHostedMode &&
    Boolean(session?.user?.id) &&
    isEmailVerified &&
    !onboardingQuery.isLoading &&
    !onboardingQuery.isError &&
    !onboardingQuery.data?.completedAt &&
    window.location.pathname !== "/onboarding";

  useEffect(() => {
    if (!needsOnboarding) {
      return;
    }

    void navigate({ to: "/onboarding", search: { step: 0 }, replace: true });
  }, [needsOnboarding, navigate]);

  return { isChecking, needsOnboarding };
}
