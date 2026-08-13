import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getQuotaStateSummary } from "@/serverFunctions/billing";
import {
  BILLING_ROUTE,
  LOW_CREDITS_THRESHOLD_USD,
  SUBSCRIBE_ROUTE,
  creditsToUsd,
} from "@/shared/billing";
import { MONTHLY_CREDIT_GRANTS } from "@/server/billing/credits";
import type { PlanTier } from "@/shared/plans";

export function FreePlanBanner() {
  const { data: session } = useSession();
  const hasSession = Boolean(session?.user?.id);

  const query = useQuery({
    queryKey: ["billing", "free-plan-banner"],
    queryFn: async () => {
      const state = await getQuotaStateSummary({ data: undefined });
      return state;
    },
    enabled: hasSession,
    staleTime: 30_000,
  });

  if (query.isLoading || !query.data) {
    return null;
  }

  const planTier = (query.data.planTier as PlanTier) ?? "free";
  const isFreePlan = planTier === "free";

  // Estimate remaining credits from tier defaults (actual balance is server-side)
  const monthlyRemaining = creditsToUsd(
    MONTHLY_CREDIT_GRANTS[planTier] ?? 0,
  );
  const totalRemaining = monthlyRemaining;

  const isOutOfCredits = totalRemaining <= 0 && !isFreePlan;
  const isLowCredits =
    !isOutOfCredits &&
    totalRemaining > 0 &&
    totalRemaining < LOW_CREDITS_THRESHOLD_USD;

  const creditsActionLink = isFreePlan ? (
    <Link
      to={SUBSCRIBE_ROUTE}
      search={{ upgrade: true }}
      className="link link-primary font-medium"
    >
      Upgrade your plan
    </Link>
  ) : (
    <Link to={BILLING_ROUTE} className="link link-primary font-medium">
      Buy more credits
    </Link>
  );

  if (isOutOfCredits) {
    return (
      <BannerShell variant="error">
        You&rsquo;ve used all your credits. {creditsActionLink} to continue
        using SeoTool.im.
      </BannerShell>
    );
  }

  if (isLowCredits) {
    return (
      <BannerShell variant="warning">
        You&rsquo;re running low on credits. {creditsActionLink} to keep using
        SeoTool.im.
      </BannerShell>
    );
  }

  if (isFreePlan) {
    return (
      <BannerShell variant="info">
        We hope you&rsquo;re enjoying SeoTool.im!{" "}
        <Link
          to={SUBSCRIBE_ROUTE}
          search={{ upgrade: true }}
          className="link link-primary font-medium"
        >
          Upgrade anytime
        </Link>{" "}
        or{" "}
        <Link to="/support" className="link link-primary font-medium">
          reach out with questions
        </Link>
        .
      </BannerShell>
    );
  }

  return null;
}

function BannerShell({
  variant,
  children,
}: {
  variant: "info" | "warning" | "error";
  children: React.ReactNode;
}) {
  const alertClass =
    variant === "error"
      ? "alert-error"
      : variant === "warning"
        ? "alert-warning"
        : "alert-info";

  return (
    <div className="shrink-0 px-4 py-2.5 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className={`alert text-sm ${alertClass}`}>
          <span>{children}</span>
        </div>
      </div>
    </div>
  );
}
