import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck, User, XCircle } from "lucide-react";
import { ThemePreferenceMenuItems } from "@/client/components/ThemePreferenceMenuItems";
import { captureClientEvent } from "@/client/lib/posthog";
import { getStoredRedditAttribution } from "@/client/lib/reddit-attribution";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { normalizeAuthRedirect } from "@/lib/auth-redirect";
import { captureRedditConversionEvent } from "@/serverFunctions/redditConversions";
import { createPaypalSubscription } from "@/serverFunctions/paypal-checkout";
import { getQuotaStateSummary } from "@/serverFunctions/billing";
import { getEffectivePlanConfigs } from "@/server/billing/plan-config";
import { PlanPickerGrid } from "@/client/features/billing/PlanPickerGrid";
import type { PaidTier } from "@/client/features/marketing/tierHighlights";
import {
  ORDERED_PLAN_TIERS,
  PLAN_PRICES_USD,
  PLAN_TIER_LABELS,
  type PlanTier,
} from "@/shared/plans";

const PLAN_TIER_SET: ReadonlySet<string> = new Set(ORDERED_PLAN_TIERS);

function isPlanTier(value: string): value is PlanTier {
  return PLAN_TIER_SET.has(value);
}

const SUPPORT_EMAIL = "support@seotool.im";

type Search = { upgrade?: true; redirect?: string; plan?: PlanTier };

export const Route = createFileRoute("/_authenticated/subscribe")({
  loader: async () => {
    // Effective (admin-editable) prices so checkout matches the picker.
    const configs = await getEffectivePlanConfigs();
    const prices: Record<PlanTier, number> = { ...PLAN_PRICES_USD };
    const hiddenTiers: PlanTier[] = [];
    for (const config of Object.values(configs)) {
      prices[config.tier] = config.priceUsdCents / 100;
      if (!config.active) hiddenTiers.push(config.tier);
    }
    return { prices, hiddenTiers };
  },
  validateSearch: (search: Record<string, unknown>): Search => ({
    upgrade:
      search.upgrade === true || search.upgrade === "true" ? true : undefined,
    redirect:
      typeof search.redirect === "string"
        ? normalizeAuthRedirect(search.redirect)
        : undefined,
    plan:
      typeof search.plan === "string" && isPlanTier(search.plan)
        ? search.plan
        : undefined,
  }),
  component: SubscribePage,
});

function SubscribePage() {
  const navigate = useNavigate();
  const {
    upgrade: isUpgradeFlow,
    redirect,
    plan: defaultPlan,
  }: Search = Route.useSearch();
  const { prices, hiddenTiers } = Route.useLoaderData();
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<PaidTier>(
    defaultPlan && defaultPlan !== "free" ? defaultPlan : "lite",
  );
  const [isAttaching, setIsAttaching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const checkoutCompleted =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("checkout") === "success";

  const hasSession = Boolean(session?.user?.id);

  // Check subscription status from local DB
  useEffect(() => {
    if (!hasSession) return;
    void getQuotaStateSummary({ data: undefined })
      .then((state) => {
        setIsPaid(state.planTier !== "free");
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [hasSession]);

  // Determine route state locally (no Autumn dependency)
  const subscribeRouteState = (() => {
    if (isLoading) return "loading";
    if (isPaid && !isUpgradeFlow) return "redirectToApp";
    if (checkoutCompleted && !isPaid) return "finalizing";
    if (checkoutCompleted && isPaid) return "redirectToApp";
    return "showPaywall";
  })();

  // After checkout, poll until subscription shows up
  const isFinalizing = subscribeRouteState === "finalizing";
  useEffect(() => {
    if (!isFinalizing) return;
    const interval = setInterval(() => {
      void getQuotaStateSummary({ data: undefined }).then((state) => {
        if (state.planTier !== "free") {
          setIsPaid(true);
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isFinalizing]);

  useEffect(() => {
    if (subscribeRouteState === "redirectToApp") {
      const destination = redirect ?? "/";
      const [destinationPath, destinationQuery] = destination.split("?");
      const destinationSearch = destinationQuery
        ? Object.fromEntries(new URLSearchParams(destinationQuery))
        : undefined;
      const goToApp = () =>
        void navigate({
          to: destinationPath,
          // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
          search: destinationSearch as never,
          replace: true,
        });
      if (checkoutCompleted) {
        captureClientEvent("billing:checkout_success", {
          plan_tier: selectedPlan,
        });
        const attribution = getStoredRedditAttribution();
        if (attribution) {
          void captureRedditConversionEvent({
            data: { attribution, eventType: "PURCHASE" },
          }).finally(goToApp);
          return;
        }
      }
      goToApp();
    }
  }, [
    checkoutCompleted,
    navigate,
    redirect,
    subscribeRouteState,
    selectedPlan,
  ]);

  useEffect(() => {
    if (subscribeRouteState === "showPaywall" && !isUpgradeFlow) {
      captureClientEvent("billing:paywall_viewed");
    }
  }, [isUpgradeFlow, subscribeRouteState]);

  if (
    subscribeRouteState === "loading" ||
    subscribeRouteState === "redirectToApp"
  ) {
    return null;
  }

  if (subscribeRouteState === "finalizing") {
    return (
      <div className="w-full max-w-xs space-y-4 text-center">
        <img
          src="/transparent-logo.png"
          alt="SeoTool.im"
          className="mx-auto size-10 rounded-lg"
        />
        <h1 className="text-xl font-semibold">
          Finalizing your subscription&hellip;
        </h1>
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm text-base-content/60">
          This usually takes a few seconds.
        </p>
        <p className="text-xs text-base-content/50">
          Taking longer?{" "}
          <a className="link" href={`mailto:${SUPPORT_EMAIL}`}>
            Email {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </div>
    );
  }

  function selectPlan(tier: PaidTier) {
    setSelectedPlan(tier);
    // Keep the selection in the URL so back/forward restores it (and the
    // pricing page deep-link ?plan= stays consistent).
    void navigate({
      to: "/subscribe",
      search: { upgrade: isUpgradeFlow, redirect, plan: tier },
      replace: true,
    });
  }

  async function handleSubscribe() {
    setError(null);
    setIsAttaching(true);

    try {
      captureClientEvent("billing:checkout_start", { plan_tier: selectedPlan });

      // Create PayPal subscription and redirect to approval page
      const result = await createPaypalSubscription({
        data: { tier: selectedPlan },
      });

      if (result?.approveUrl) {
        window.location.href = result.approveUrl;
      } else {
        throw new Error("No approval URL returned from PayPal");
      }
    } catch (err) {
      setError(
        getStandardErrorMessage(
          err,
          "We couldn't start the checkout. Please try again.",
        ),
      );
      setIsAttaching(false);
    }
  }

  const firstName = session?.user?.name?.split(" ")[0] || "";

  return (
    <div className="w-full max-w-5xl space-y-8">
      <SubscribePageAccountMenu email={session?.user?.email} />

      <div className="space-y-3 text-center">
        <img
          src="/transparent-logo.png"
          alt="SeoTool.im"
          className="mx-auto size-10 rounded-lg"
        />
        <h1 className="text-2xl font-semibold">
          {isUpgradeFlow
            ? "Upgrade your plan"
            : firstName
              ? `Welcome to SeoTool.im, ${firstName}!`
              : "Welcome to SeoTool.im!"}
        </h1>
        <p className="text-sm text-base-content/70">
          SEO on your terms. Pick the plan that fits, cancel anytime.
        </p>
        <p className="text-xs text-base-content/50">
          <Link to="/" className="link">
            Back to homepage
          </Link>
        </p>
      </div>

      <PlanPickerGrid
        selected={selectedPlan}
        onSelect={selectPlan}
        disabled={isAttaching}
        prices={prices}
        hiddenTiers={hiddenTiers}
      />

      <div className="mx-auto w-full max-w-md space-y-4">
        {error ? (
          <div role="alert" className="alert alert-error py-2.5 text-sm">
            {error}
          </div>
        ) : null}

        <button
          className="btn btn-primary btn-md w-full font-semibold shadow-md shadow-primary/25"
          disabled={isAttaching}
          onClick={() => void handleSubscribe()}
        >
          {isAttaching ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Redirecting to PayPal...
            </>
          ) : (
            <>
              Subscribe to {PLAN_TIER_LABELS[selectedPlan]}
              <span className="opacity-70">${prices[selectedPlan]}/mo</span>
            </>
          )}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-base-content/60">
          <span
            className="tooltip before:max-w-60 before:whitespace-normal"
            data-tip={`Not for you yet? Email ${SUPPORT_EMAIL} within 30 days of your charge and we'll refund your subscription.`}
          >
            <span className="inline-flex cursor-help items-center gap-1.5 underline decoration-dotted">
              <ShieldCheck className="size-3.5 shrink-0" />
              30-day money-back guarantee
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <XCircle className="size-3.5 shrink-0" />
            Cancel anytime
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3.5 shrink-0" />
            Secure checkout via PayPal
          </span>
        </div>
      </div>

      <div className="space-y-2 pb-6 text-center">
        <p className="text-sm text-base-content/60">
          Questions? Email {SUPPORT_EMAIL}.
        </p>
        <button
          type="button"
          onClick={() => {
            if (isUpgradeFlow) {
              void navigate({ to: redirect ?? "/" });
            } else {
              signOutAndRedirect();
            }
          }}
          className="text-xs font-medium text-base-content/60 hover:text-base-content"
        >
          {isUpgradeFlow ? "Back to dashboard" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

function SubscribePageAccountMenu({ email }: { email: string | undefined }) {
  if (!email) return null;
  return (
    <div className="absolute right-4 top-4 md:right-6 md:top-6">
      <div className="dropdown dropdown-end">
        <button
          type="button"
          className="btn btn-ghost btn-sm px-2 text-base-content/70 hover:bg-base-200"
          aria-label="Account menu"
          title={email}
        >
          <User className="size-4 shrink-0" />
        </button>
        <ul className="menu dropdown-content z-[1] mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-sm">
          <li className="menu-title px-4 py-2">
            <span className="block truncate text-xs font-medium text-base-content">
              {email}
            </span>
          </li>
          <li>
            <ThemePreferenceMenuItems />
          </li>
          <li>
            <button
              type="button"
              className="text-error focus:bg-error/10 focus:text-error"
              onClick={() => {
                signOutAndRedirect();
              }}
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
