import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import {
  capturePaypalTopup,
  createPaypalTopup,
} from "@/serverFunctions/paypal-checkout";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { QuotaBar } from "@/client/features/billing/QuotaBar";
import { getEffectivePricesUsd } from "@/server/billing/plan-config";
import { PLAN_TIER_LABELS } from "@/shared/plans";

export const Route = createFileRoute("/_app/billing")({
  beforeLoad: () => {
    if (!isHostedClientAuthMode()) {
      throw notFound();
    }
  },
  loader: async () => ({
    // Effective (admin-editable) prices for the current-plan display.
    prices: await getEffectivePricesUsd(),
  }),
  component: BillingPage,
});

function BillingPage() {
  const { prices } = Route.useLoaderData();
  const { data: session, isPending: isSessionPending } = useSession();
  const isE2EBypass =
    import.meta.env.BYPASS_AUTH === "true" ||
    (typeof window !== "undefined" &&
      Boolean(Reflect.get(window, "__E2E_BYPASS_AUTH")));
  const activeUserId =
    session?.user?.id ?? (isE2EBypass ? "e2e-user-id" : undefined);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);
  const [topupStatus, setTopupStatus] = useState<
    "idle" | "capturing" | "completed" | "cancelled" | "error"
  >("idle");
  const topupCaptureStarted = useRef(false);

  const { planTier, isLoading: isPlanLoading } = usePlanTier();
  const isFreePlan = planTier === "free";

  const getQuotaState = useServerFn(getQuotaStateSummary);
  const quotaQuery = useQuery({
    queryKey: ["quotaState", activeUserId],
    queryFn: () => getQuotaState(),
    enabled: Boolean(activeUserId),
  });

  const openPortal = useServerFn(getCustomerPortalUrl);
  const captureTopup = useServerFn(capturePaypalTopup);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const status = search.get("topup");
    if (status === "cancelled") {
      setTopupStatus("cancelled");
      return;
    }
    if (status === "complete") {
      setTopupStatus("completed");
      return;
    }
    if (status !== "success" || topupCaptureStarted.current) return;

    const orderId = search.get("token");
    if (!orderId) {
      setTopupStatus("error");
      return;
    }

    topupCaptureStarted.current = true;
    setTopupStatus("capturing");
    void captureTopup({ data: { orderId } })
      .then(async (result) => {
        if (!result.completed) throw new Error("PayPal capture is pending");
        setTopupStatus("completed");
        window.history.replaceState({}, "", "/billing?topup=complete");
        await quotaQuery.refetch();
      })
      .catch(() => {
        setTopupStatus("error");
      });
  }, [captureTopup, quotaQuery]);

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
    hasSession: Boolean(activeUserId),
    isSessionPending: isE2EBypass ? false : isSessionPending,
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
        <div className="flex flex-col justify-between rounded-lg border border-primary/50 bg-primary/5 p-4 gap-4 ring-1 ring-primary/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Plan</span>
              <span className="badge border-none bg-base-100 font-medium">
                {PLAN_TIER_LABELS[planTier]}
              </span>
            </div>
            <div className="mt-3 text-2xl font-semibold tabular-nums">
              ${prices[planTier].toFixed(2)}{" "}
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
                className="btn btn-primary w-full"
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
        <div className="border-b border-base-300 bg-base-200 p-4">
          <h2 className="font-medium">Current Usage limits</h2>
          <p className="mt-1 text-xs text-base-content/50">
            Windowed features reset daily or monthly. Gauge features match your
            live project data.
          </p>
        </div>

        <div className="divide-y divide-base-300">
          {(quotaQuery.data?.quotas ?? []).map((quota) => (
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
        Any limits exceeded will draw from your credit pool if available. Top up
        anytime, credits roll over and never expire.
      </p>

      {topupStatus !== "idle" ? (
        <div
          role="status"
          className={`alert py-3 text-sm ${
            topupStatus === "completed"
              ? "alert-success"
              : topupStatus === "error"
                ? "alert-error"
                : "alert-info"
          }`}
        >
          {topupStatus === "capturing" ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Completing your PayPal payment&hellip;
            </>
          ) : topupStatus === "completed" ? (
            "Payment completed. Your credits will appear as soon as PayPal confirms the webhook."
          ) : topupStatus === "cancelled" ? (
            "Top-up cancelled. You were not charged."
          ) : (
            "We could not confirm this top-up. Do not start another payment; refresh to retry confirmation or contact support."
          )}
        </div>
      ) : null}

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
    local_map_points: "Local Map Grid Points",
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
