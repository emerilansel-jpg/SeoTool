// oxlint-disable complexity, max-lines
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Key, Lock, ShieldCheck, Sparkles, User, Zap } from "lucide-react";
import { toast } from "sonner";
import { ThemePreferenceMenuItems } from "@/client/components/ThemePreferenceMenuItems";
import {
  getErrorCode,
  getStandardErrorMessage,
} from "@/client/lib/error-messages";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";
import { normalizeAuthRedirect } from "@/lib/auth-redirect";
import {
  getMembershipStatus,
  verifyMembershipCheckout,
} from "@/serverFunctions/membership";
import {
  createPaypalSubscription,
  createPaypalLtdCheckout,
  capturePaypalLtdCheckout,
} from "@/serverFunctions/paypal-checkout";

type Search = {
  checkout?: "success" | "cancelled";
  subscriptionId?: string;
  orderId?: string;
  redirect?: string;
  ref?: string;
  upgrade?: true;
  plan?: string;
  cohort?: string;
  tier?: number;
  ltd?: boolean;
};

export const Route = createFileRoute("/_authenticated/subscribe")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    checkout:
      search.checkout === "success" || search.checkout === "cancelled"
        ? search.checkout
        : undefined,
    subscriptionId:
      typeof search.subscription_id === "string"
        ? search.subscription_id.slice(0, 128)
        : typeof search.subscriptionId === "string"
          ? search.subscriptionId.slice(0, 128)
          : undefined,
    orderId:
      typeof search.order_id === "string"
        ? search.order_id.slice(0, 128)
        : typeof search.orderId === "string"
          ? search.orderId.slice(0, 128)
          : undefined,
    redirect:
      typeof search.redirect === "string"
        ? normalizeAuthRedirect(search.redirect)
        : undefined,
    ref:
      typeof search.ref === "string"
        ? search.ref.trim().slice(0, 32).toUpperCase()
        : undefined,
    upgrade:
      search.upgrade === true || search.upgrade === "true" ? true : undefined,
    plan: typeof search.plan === "string" ? search.plan : undefined,
    cohort: typeof search.cohort === "string" ? search.cohort : undefined,
    tier:
      typeof search.tier === "number"
        ? search.tier
        : typeof search.tier === "string"
          ? parseInt(search.tier, 10)
          : undefined,
    ltd: search.ltd === true || search.ltd === "true" ? true : undefined,
  }),
  component: SubscribePage,
});

type ExistingSubscriptionKind = "finalizing" | "all-access" | "legacy";

function ExistingSubscriptionNotice({
  kind,
}: {
  kind: ExistingSubscriptionKind;
}) {
  const finalizing = kind === "finalizing";
  const description = finalizing
    ? "PayPal approval is complete. We are waiting for the active confirmation."
    : kind === "all-access"
      ? "You already have an active membership. You can manage your account in Billing or choose an LTD plan below."
      : "Your legacy paid plan remains active. Manage it from Billing before switching so you are never billed for two subscriptions.";
  return (
    <div className="w-full max-w-lg space-y-5 text-center">
      <img
        src="/logo-icon.png"
        alt="SeoTool.im"
        className="mx-auto size-12 object-contain"
      />
      <h1 className="text-xl font-semibold">
        {finalizing
          ? "Finalizing your membership…"
          : "Active subscription found"}
      </h1>
      <p className="text-sm text-base-content/70">{description}</p>
      <div className="flex justify-center gap-3">
        <Link to="/billing" className="btn btn-outline">
          Open Billing
        </Link>
        <Link to="/projects" className="btn btn-primary">
          Open Workspace
        </Link>
      </div>
    </div>
  );
}

const APPSUMO_PRICES: Record<number, { price: number; name: string; domains: string }> = {
  1: { price: 37, name: "Tier 1", domains: "1 Domain · 1 Seat" },
  2: { price: 79, name: "Tier 2", domains: "5 Domains · 2 Seats" },
  3: { price: 149, name: "Tier 3 (Sweet Spot)", domains: "15 Domains · 5 Seats" },
  4: { price: 249, name: "Tier 4", domains: "50 Domains · 15 Seats" },
  5: { price: 399, name: "Tier 5", domains: "150 Domains · 50 Seats" },
};

function SubscribePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search: Search = Route.useSearch();
  const { data: session } = useSession();

  const membership = useQuery({
    queryKey: ["membership-status"],
    queryFn: () => getMembershipStatus(),
    refetchInterval: (query) =>
      search.checkout === "success" && !query.state.data?.hasAccess
        ? 2_000
        : false,
  });

  const shouldReturnToWorkspace = Boolean(
    !search.plan &&
      !search.upgrade &&
      !search.checkout &&
      (membership.data?.hasAccess || membership.data?.hasLegacyPaidPlan),
  );

  // PayPal LTD one-time checkout (No Plan ID needed, works immediately!)
  const ltdCheckout = useMutation({
    mutationFn: (planKey: string) =>
      createPaypalLtdCheckout({ data: { planKey } }),
    onSuccess: (result) => window.location.assign(result.approveUrl),
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Could not start LTD checkout")),
  });

  // Capture LTD PayPal Order on return
  const ltdCapture = useMutation({
    mutationFn: (orderId: string) =>
      capturePaypalLtdCheckout({ data: { orderId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["membership-status"] });
      toast.success("Lifetime Deal payment successful! Access activated.");
      void navigate({ to: search.redirect ?? "/projects", replace: true });
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Could not capture payment")),
  });

  // Starter $1/month retainer subscription
  const starterCheckout = useMutation({
    mutationFn: () => createPaypalSubscription({ data: { tier: "starter" } }),
    onSuccess: (result) => window.location.assign(result.approveUrl),
    onError: (error) => {
      console.error("Starter checkout failed", error);
      toast.error(
        getErrorCode(error) === "UPSTREAM_UNAVAILABLE"
          ? "We could not reach PayPal to start this checkout. Please try again in a moment."
          : getStandardErrorMessage(error, "Checkout is temporarily unavailable"),
      );
    },
  });

  // Legacy subscription verification
  const verify = useMutation({
    mutationFn: (subscriptionId: string) =>
      verifyMembershipCheckout({ data: { subscriptionId } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["membership-status"] }),
    onError: (error) =>
      toast.error(
        getStandardErrorMessage(error, "Could not verify the membership"),
      ),
  });

  // Handle return from PayPal
  useEffect(() => {
    if (search.checkout === "success") {
      if (search.orderId && ltdCapture.isIdle) {
        ltdCapture.mutate(search.orderId);
      } else if (search.subscriptionId && verify.isIdle) {
        verify.mutate(search.subscriptionId);
      }
    }
  }, [search.checkout, search.orderId, search.subscriptionId, ltdCapture, verify]);

  useEffect(() => {
    if (!shouldReturnToWorkspace) return;
    void navigate({ to: search.redirect ?? "/projects", replace: true });
  }, [navigate, search.redirect, shouldReturnToWorkspace]);

  if (membership.isLoading || shouldReturnToWorkspace) {
    return null;
  }

  const membershipRecord = membership.data?.membership;
  const membershipStatus = membershipRecord?.status.toUpperCase();
  const hasRecoverableMembership =
    Boolean(membershipRecord) &&
    membershipStatus !== "CANCELLED" &&
    membershipStatus !== "EXPIRED" &&
    membershipStatus !== "FAILED";
  const hasLegacyPaidPlan = membership.data?.hasLegacyPaidPlan ?? false;

  if (
    !search.plan &&
    !search.upgrade &&
    (hasRecoverableMembership || hasLegacyPaidPlan)
  ) {
    const kind: ExistingSubscriptionKind =
      hasRecoverableMembership && search.checkout === "success"
        ? "finalizing"
        : hasRecoverableMembership
          ? "all-access"
          : "legacy";
    return <ExistingSubscriptionNotice kind={kind} />;
  }

  const cohort = membership.data?.currentCohort;
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  // Determine active LTD plan
  const isAppsumo = search.plan === "appsumo";
  const appsumoTierNum = search.tier && search.tier >= 1 && search.tier <= 5 ? search.tier : 3;
  const appsumoPlan = APPSUMO_PRICES[appsumoTierNum];

  const ltdPlanKey = isAppsumo
    ? `appsumo_tier_${appsumoTierNum}`
    : search.cohort || cohort?.key || "krp_founder_10";

  const ltdPriceDollars = isAppsumo
    ? appsumoPlan.price
    : Math.round((cohort?.priceUsdCents ?? 2900) / 100);

  const ltdTitle = isAppsumo
    ? `AppSumo ${appsumoPlan.name}`
    : `Early Believer LTD (${cohort?.label ?? "Founder 10"})`;

  return (
    <div className="w-full max-w-5xl space-y-8">
      <SubscribePageAccountMenu email={session?.user?.email} />

      <div className="space-y-3 text-center">
        <img
          src="/logo-icon.png"
          alt="SeoTool.im"
          className="mx-auto size-14 object-contain"
        />
        <h1 className="text-2xl font-bold">
          {firstName
            ? `Choose Your Plan, ${firstName}!`
            : "SeoTool.im Lifetime Deals & Access"}
        </h1>
        <p className="text-sm text-base-content/70 max-w-xl mx-auto">
          Get lifetime access with BYOK mode (zero data markup),
          or start light with our $1/month credit retainer.
        </p>
      </div>

      {search.checkout === "cancelled" ? (
        <div className="alert alert-warning mx-auto max-w-3xl text-sm">
          Checkout was canceled. No charges were made.
        </div>
      ) : null}

      {search.checkout === "success" && (ltdCapture.isPending || verify.isPending) ? (
        <div className="alert alert-info mx-auto max-w-3xl text-sm flex items-center justify-center gap-2">
          <span className="loading loading-spinner loading-xs" />
          <span>Verifying your PayPal payment…</span>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* CARD 1: LTD ONE-TIME PAYMENT (PRIMARY) */}
        <section className="card border-2 border-primary bg-base-100 shadow-xl shadow-primary/10">
          <div className="card-body gap-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="badge badge-primary badge-sm font-bold uppercase tracking-wide">
                  PAY ONCE · LIFETIME ACCESS
                </span>
                <h2 className="mt-2 text-xl font-bold">{ltdTitle}</h2>
                <p className="text-xs text-base-content/60 font-medium">
                  {isAppsumo ? appsumoPlan.domains : "BYOK Mode · Zero Data Markup"}
                  {!isAppsumo && cohort?.remaining != null
                    ? ` · ${cohort.remaining} spots left`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-primary">
                  ${ltdPriceDollars}
                </div>
                <div className="text-xs text-base-content/60 font-semibold">
                  USD / One-Time
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/[0.05] p-3 text-xs text-base-content/80 flex items-center gap-2">
              <Key className="size-4 text-primary shrink-0" />
              <span>
                <strong>BYOK Mode:</strong> Plug in your own DataForSEO & AI API keys.
                Save up to 90% on data costs with zero platform markup.
              </span>
            </div>

            <ul className="grid gap-2 text-xs sm:grid-cols-2">
              {[
                "All 12+ SEO & audit tools included",
                "Direct DataForSEO & AI BYOK integration",
                "Daily automated search rank tracking",
                "100+ check technical site auditor",
                "AI brand search visibility tracker",
                "White-label PDF reports & scheduling",
                "5,000 bonus credits on activation",
                "Lifetime engine & platform updates",
              ].map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                className="btn btn-primary w-full btn-md font-bold shadow-md shadow-primary/25 gap-2"
                disabled={ltdCheckout.isPending}
                onClick={() => ltdCheckout.mutate(ltdPlanKey)}
              >
                {ltdCheckout.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Zap className="size-4" />
                )}
                Pay Now (${ltdPriceDollars} One-Time via PayPal)
              </button>
              <p className="mt-2 text-center text-[11px] text-base-content/50">
                Instant access right after payment. No monthly bills ever.
              </p>
            </div>
          </div>
        </section>

        {/* CARD 2: $1 MICRO-RETAINER & EXPLORE */}
        <div className="flex flex-col gap-6">
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="badge badge-secondary badge-outline badge-sm font-bold">
                    MICRO RETAINER
                  </span>
                  <h2 className="mt-2 text-lg font-bold">Starter $1 / Month</h2>
                  <p className="text-xs text-base-content/60">
                    100% turns into permanent credits that never expire
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-base-content">$1</div>
                  <div className="text-xs text-base-content/60">USD / month</div>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-base-content/80">
                <li className="flex gap-2">
                  <Check className="size-3.5 shrink-0 text-success" />
                  <span>1,000 permanent credits added every month</span>
                </li>
                <li className="flex gap-2">
                  <Check className="size-3.5 shrink-0 text-success" />
                  <span>Credits roll over &amp; never expire</span>
                </li>
                <li className="flex gap-2">
                  <Check className="size-3.5 shrink-0 text-success" />
                  <span>Cancel anytime from your dashboard</span>
                </li>
              </ul>

              <button
                className="btn btn-outline btn-md w-full font-bold"
                disabled={starterCheckout.isPending}
                onClick={() => starterCheckout.mutate()}
              >
                {starterCheckout.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                Start for $1/month
              </button>
            </div>
          </section>

          <section className="card border border-base-200 bg-base-200/40">
            <div className="card-body p-5">
              <h3 className="text-sm font-bold text-base-content">
                Want to look around first?
              </h3>
              <p className="text-xs text-base-content/70 mt-1">
                You can explore the workspace and create your first project for free.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-xs font-semibold"
                  onClick={() => void navigate({ to: search.redirect ?? "/projects" })}
                >
                  Continue to Workspace (Free) →
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-base-content/60 pt-4">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-success" /> 30-day money-back guarantee
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Lock className="size-3.5" /> Encrypted and safe PayPal checkout
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" /> Instant access right after purchase
        </span>
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
          className="btn btn-ghost btn-sm px-2"
          aria-label="Account menu"
          title={email}
        >
          <User className="size-4" />
        </button>
        <ul className="menu dropdown-content z-[1] mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-sm">
          <li className="menu-title truncate px-4 py-2 text-xs">{email}</li>
          <li>
            <Link to="/billing">Billing</Link>
          </li>
          <ThemePreferenceMenuItems />
          <li>
            <button
              type="button"
              onClick={() => signOutAndRedirect()}
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
