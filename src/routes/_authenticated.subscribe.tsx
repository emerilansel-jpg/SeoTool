import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Lock, ShieldCheck, User, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ThemePreferenceMenuItems } from "@/client/components/ThemePreferenceMenuItems";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";
import { normalizeAuthRedirect } from "@/lib/auth-redirect";
import {
  createMembershipCheckout,
  getMembershipStatus,
  verifyMembershipCheckout,
} from "@/serverFunctions/membership";

type Search = {
  checkout?: "success" | "cancelled";
  subscriptionId?: string;
  redirect?: string;
  ref?: string;
  upgrade?: true;
  /** Legacy deep links are accepted; All Access is the only new paid offer. */
  plan?: "free" | "lite" | "pro" | "agency";
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
    plan:
      search.plan === "free" ||
      search.plan === "lite" ||
      search.plan === "pro" ||
      search.plan === "agency"
        ? search.plan
        : undefined,
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
    ? "PayPal approval is complete. We are waiting for the active subscription confirmation."
    : kind === "all-access"
      ? "Manage, recover, or cancel the existing All Access membership before starting another checkout."
      : "Your legacy paid plan remains active. Manage it from Billing before switching to All Access so you are never billed for two subscriptions.";
  return (
    <div className="w-full max-w-lg space-y-5 text-center">
      <img
        src="/transparent-logo.png"
        alt="SeoTool.im"
        className="mx-auto size-10 rounded-lg"
      />
      <h1 className="text-xl font-semibold">
        {finalizing
          ? "Finalizing your All Access membership…"
          : "A subscription already exists for this account"}
      </h1>
      <p className="text-sm text-base-content/70">{description}</p>
      {finalizing ? (
        <span className="loading loading-spinner loading-md" />
      ) : (
        <Link to="/billing" className="btn btn-primary">
          Open Billing
        </Link>
      )}
    </div>
  );
}

function SubscribePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search: Search = Route.useSearch();
  const { data: session } = useSession();
  const [referralCode, setReferralCode] = useState(search.ref ?? "");
  const membership = useQuery({
    queryKey: ["membership-status"],
    queryFn: () => getMembershipStatus(),
    refetchInterval: (query) =>
      search.checkout === "success" && !query.state.data?.hasAccess
        ? 2_000
        : false,
  });
  const shouldReturnToWorkspace = [
    membership.data?.hasAccess,
    membership.data?.hasLegacyPaidPlan,
  ].some(Boolean);
  const checkout = useMutation({
    mutationFn: () =>
      createMembershipCheckout({
        data: { referralCode: referralCode.trim() || undefined },
      }),
    onSuccess: (result) => window.location.assign(result.approveUrl),
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Could not start checkout")),
  });
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

  useEffect(() => {
    if (
      search.checkout === "success" &&
      search.subscriptionId &&
      verify.isIdle
    ) {
      verify.mutate(search.subscriptionId);
    }
  }, [search.checkout, search.subscriptionId, verify]);

  useEffect(() => {
    if (!shouldReturnToWorkspace) return;
    void navigate({ to: search.redirect ?? "/", replace: true });
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

  if (hasRecoverableMembership || hasLegacyPaidPlan) {
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
          {firstName
            ? `Welcome to SeoTool.im, ${firstName}!`
            : "SeoTool.im All Access"}
        </h1>
        <p className="text-sm text-base-content/70">
          One membership unlocks every SeoTool.im feature. Usage is paid from
          credits, with transparent Standard or BYOK pricing.
        </p>
      </div>

      {search.checkout === "cancelled" ? (
        <div className="alert alert-warning mx-auto max-w-3xl text-sm">
          Checkout was cancelled. No membership charge was created.
        </div>
      ) : null}
      {search.checkout === "success" ? (
        <div className="alert alert-info mx-auto max-w-3xl text-sm">
          PayPal approved the checkout. We are confirming your membership…
        </div>
      ) : null}

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-[0.8fr_1.2fr]">
        <section className="card border border-base-300 bg-base-100">
          <div className="card-body gap-5 p-6">
            <div>
              <span className="badge badge-ghost badge-sm">FREE</span>
              <h2 className="mt-2 text-xl font-semibold">Explore first</h2>
              <p className="mt-1 text-sm text-base-content/65">
                Browse your workspace and set up projects. Metered SEO tools
                unlock with All Access.
              </p>
            </div>
            <button
              className="btn btn-outline mt-auto"
              onClick={() => void navigate({ to: search.redirect ?? "/" })}
            >
              Continue to workspace
            </button>
          </div>
        </section>

        <section className="card border border-primary/40 bg-base-100 shadow-lg shadow-primary/10">
          <div className="card-body gap-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="badge badge-primary badge-sm">
                  LIFETIME PRICE LOCK
                </span>
                <h2 className="mt-2 text-xl font-semibold">All Access</h2>
                <p className="text-xs text-base-content/60">
                  {cohort?.label ?? "Current cohort"}
                  {cohort?.remaining == null
                    ? ""
                    : ` · ${cohort.remaining} spots left`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  ${((cohort?.priceUsdCents ?? 2_900) / 100).toFixed(0)}
                </div>
                <div className="text-xs text-base-content/60">USD / month</div>
              </div>
            </div>

            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                "Every current SeoTool.im feature",
                "Keyword Research Pro pipeline",
                "Live backlink competition",
                "Local Map Rank Tracker",
                "Standard +30% or BYOK +10%",
                "Referral rewards for 12 cycles",
              ].map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>

            <label className="form-control gap-1">
              <span className="text-xs font-medium">
                Referral code (optional)
              </span>
              <input
                className="input input-bordered input-sm"
                value={referralCode}
                maxLength={32}
                onChange={(event) =>
                  setReferralCode(event.target.value.toUpperCase())
                }
                placeholder="Friend's code"
              />
              <span className="text-xs text-base-content/50">
                You receive 5,000 usage credits after activation.
              </span>
            </label>

            <button
              className="btn btn-primary"
              disabled={checkout.isPending || !cohort?.configured}
              onClick={() => checkout.mutate()}
            >
              {checkout.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : null}
              Continue with PayPal
            </button>
            {!cohort?.configured ? (
              <p className="text-xs text-warning">
                PayPal plans are not configured yet. An admin can initialize
                them from Admin → Pricing.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-base-content/60">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> 30-day money-back guarantee
        </span>
        <span className="inline-flex items-center gap-1.5">
          <XCircle className="size-3.5" /> Cancel anytime; cancellation ends the
          price lock
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Lock className="size-3.5" /> Secure checkout via PayPal
        </span>
      </div>
      <p className="pb-6 text-center text-xs text-base-content/55">
        Already exploring?{" "}
        <Link to="/" className="link">
          Back to the app
        </Link>
      </p>
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
            <ThemePreferenceMenuItems />
          </li>
          <li>
            <button
              type="button"
              className="text-error"
              onClick={signOutAndRedirect}
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
