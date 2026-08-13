import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Zap } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { getStoredRedditAttribution } from "@/client/lib/reddit-attribution";
import { BillingUsageChart } from "@/client/features/billing/BillingUsageChart";
import { BillingFeatureBreakdown } from "@/client/features/billing/BillingFeatureBreakdown";
import { getBillingRouteState } from "@/client/features/billing/route-state";
import { usePlanTier } from "@/client/features/billing/use-billing";
import { captureRedditConversionEvent } from "@/serverFunctions/redditConversions";
import {
  getQuotaStateSummary,
  getCustomerPortalUrl,
} from "@/serverFunctions/billing";
import { createPaypalTopup } from "@/serverFunctions/paypal-checkout";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { QuotaBar } from "@/client/features/billing/QuotaBar";
import { PLAN_TIER_LABELS, PLAN_PRICES_USD } from "@/shared/plans";

export const Route = createFileRoute("/_app/billing")({
  beforeLoad: () => {
    if (!isHostedClientAuthMode()) {
      throw notFound();
    }
  },
  component: BillingPage,
});

function BillingPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);

  const { planTier, isLoading: isPlanLoading } = usePlanTier();
  const isFreePlan = planTier === "free";

  const getQuotaState = useServerFn(getQuotaStateSummary);
  const quotaQuery = useQuery({
    queryKey: ["quotaState", session?.user?.id],
    queryFn: () => getQuotaState(),
    enabled: Boolean(session?.user?.id),
  });

  const openPortal = useServerFn(getCustomerPortalUrl);

  async function handleManageSubscription() {
    setIsPortalLoading(true);
    try {
      const url = await openPortal();
      window.location.assign(url);
    } catch {
      setIsPortalLoading(false);
    }
  }

  async function handleBuyCredits() {
    setIsBuyingCredits(true);
    try {
      const result = await createPaypalTopup({
        data: { amountUsd: 10 },
      });
      if (result?.approveUrl) {
        window.location.href = result.approveUrl;
      }
    } catch {
      setIsBuyingCredits(false);
    }
  }

  const billingRouteState = getBillingRouteState({
    hasSession: Boolean(session?.user?.id),
    isSessionPending,
    isCustomerLoading: isPlanLoading || quotaQuery.isLoading,
    isCustomerError: quotaQuery.isError,
  });

  const checkoutCompleted =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("checkout") === "success";

  useEffect(() => {
    if (!checkoutCompleted || billingRouteState !== "ready") return;

    const attribution = getStoredRedditAttribution();
    if (!attribution) return;

    void captureRedditConversionEvent({
      data: { attribution, eventType: "PURCHASE" },
    });
  }, [billingRouteState, checkoutCompleted]);

  if (billingRouteState === "loading") {
    return null;
  }

  if (billingRouteState === "error") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4 py-10 md:p-6 md:py-12">
        <h1 className="text-xl font-semibold">Billing unavailable</h1>
        <p className="text-sm text-base-content/70">
          {getStandardErrorMessage(
            quotaQuery.error,
            "We couldn't load your billing details right now. Please try again.",
          )}
        </p>
        <button
          type="button"
          className="btn btn-soft btn-sm"
          onClick={() => {
            void quotaQuery.refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 p-4 py-10 md:p-6 md:py-12">
      <h1 className="text-xl font-semibold">Billing</h1>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Subscription card */}
        <div className="flex flex-col justify-between rounded-lg border border-[var(--color-brand-accent)] bg-base-150 p-4 gap-4 ring-1 ring-[var(--color-brand-accent)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Plan</span>
              <span className="badge border-none bg-base-100 font-medium">
                {PLAN_TIER_LABELS[planTier]}
              </span>
            </div>
            <div className="mt-3 text-2xl font-semibold tabular-nums">
              ${PLAN_PRICES_USD[planTier].toFixed(2)}{" "}
              <span className="text-sm font-normal text-base-content/50">
                / month
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {isFreePlan ? (
              <Link
                to="/subscribe"
                search={{ upgrade: true }}
                className="btn btn-neutral w-full bg-[var(--color-brand-accent)] text-white hover:bg-[var(--color-brand-accent)]/90"
              >
                Upgrade Plan
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/subscribe"
                  search={{ upgrade: true }}
                  className="btn btn-outline w-full"
                >
                  Change Plan
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm w-full"
                  disabled={isPortalLoading}
                  onClick={handleManageSubscription}
                >
                  {isPortalLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Manage Subscription
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade options card */}
        {!isFreePlan && planTier !== "agency" ? (
          <div className="flex flex-col justify-between rounded-lg border border-base-300 bg-base-100 p-4 gap-4">
            <div>
              <span className="font-medium">Need more limits?</span>
              <p className="mt-2 text-sm text-base-content/70">
                Upgrade to the next tier for higher quotas and unlimited
                projects.
              </p>
            </div>
            <Link
              to="/subscribe"
              search={{ upgrade: true }}
              className="btn btn-soft w-full"
            >
              View Plans
            </Link>
          </div>
        ) : isFreePlan ? (
          <div className="flex flex-col justify-between rounded-lg border border-base-300 bg-base-100 p-4 gap-4">
            <div>
              <span className="font-medium">Unlock full features</span>
              <p className="mt-2 text-sm text-base-content/70">
                Paid plans include high daily quotas, on-demand AI agents, and
                unlimited projects.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 overflow-hidden">
        <div className="border-b border-base-300 bg-base-50 p-4">
          <h2 className="font-medium">Current Usage limits</h2>
          <p className="mt-1 text-xs text-base-content/50">
            Windowed features reset daily or monthly. Gauge features match your
            live project data.
          </p>
        </div>

        <div className="divide-y divide-base-300">
          {(quotaQuery.data ?? []).map((quota) => (
            <div key={quota.feature} className="p-4">
              <QuotaBar
                label={formatFeatureName(quota.feature)}
                used={quota.used}
                limit={quota.limit}
                resetAt={quota.resetAt}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Credit top-up */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Overage & Past Usage</h2>
        <button
          type="button"
          className="btn btn-outline btn-sm shrink-0"
          disabled={isBuyingCredits}
          onClick={() => void handleBuyCredits()}
        >
          {isBuyingCredits ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Buy Credits
        </button>
      </div>
      <p className="text-sm text-base-content/70 -mt-3">
        Any limits exceeded will draw from your credit pool if available.
        Top up anytime, credits roll over and never expire.
      </p>

      <BillingUsageChart />
      <BillingFeatureBreakdown />
    </div>
  );
}

function formatFeatureName(feature: string): string {
  const map: Record<string, string> = {
    projects: "Projects",
    keyword_search: "Keyword Searches (Labs)",
    saved_keywords: "Saved Keywords",
    rank_tracking: "Tracked Keywords",
    backlink_check: "Backlink Checks",
    site_audit: "Site Audits",
    audit_pages: "Max Pages per Audit",
    ai_brand_lookup: "AI Brand Citation Scans",
    ai_prompt: "AI Prompt Explorer Responses",
    content_intelligence: "Content Intelligence (Gap, Entities)",
    reports: "Reporting Configurations",
  };
  return map[feature] || feature;
}
