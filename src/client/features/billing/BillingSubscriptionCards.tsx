import { Link } from "@tanstack/react-router";
import { Copy, CreditCard, Users } from "lucide-react";
import { toast } from "sonner";
import { PLAN_TIER_LABELS, type PlanTier } from "@/shared/plans";

type ReferralSummary = {
  code: string;
  referrals: number;
  rewardCredits: number;
};

type BillingSubscriptionCardsProps = {
  planTier: PlanTier;
  currentPrice: number;
  hasAccess: boolean;
  canManageAllAccess: boolean;
  isPortalLoading: boolean;
  isCancelPending: boolean;
  referral: ReferralSummary | null | undefined;
  onManageSubscription: () => void;
  onCancelMembership: () => void;
};

function ReferralProgramCard({ referral }: { referral: ReferralSummary }) {
  function copyReferralLink() {
    const url = `${window.location.origin}/subscribe?ref=${encodeURIComponent(referral.code)}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Referral link copied"));
  }

  return (
    <div className="flex flex-col justify-between rounded-lg border border-base-300 bg-base-100 p-4 gap-4">
      <div>
        <span className="flex items-center gap-2 font-medium">
          <Users className="size-4 text-primary" /> Refer & earn
        </span>
        <p className="mt-2 text-sm text-base-content/70">
          Invite another user. They receive 5,000 credits and you earn 20% of
          their membership payments in credits for up to 12 successful billing
          cycles.
        </p>
        <p className="mt-2 text-xs text-base-content/55">
          {referral.referrals} referrals · {referral.rewardCredits} credits
          earned
        </p>
      </div>
      <button
        type="button"
        className="btn btn-soft w-full"
        onClick={copyReferralLink}
      >
        <Copy className="size-4" /> Copy referral link
      </button>
    </div>
  );
}

function ManageSubscriptionButton({
  isLoading,
  legacy = false,
  onClick,
}: {
  isLoading: boolean;
  legacy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm w-full"
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      {legacy ? "Manage Legacy Subscription" : "Manage Subscription"}
    </button>
  );
}

export function BillingSubscriptionCards({
  planTier,
  currentPrice,
  hasAccess,
  canManageAllAccess,
  isPortalLoading,
  isCancelPending,
  referral,
  onManageSubscription,
  onCancelMembership,
}: BillingSubscriptionCardsProps) {
  const isFreePlan = planTier === "free";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="flex flex-col justify-between rounded-lg border border-primary/50 bg-primary/5 p-4 gap-4 ring-1 ring-primary/30">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Current Plan</span>
            <span className="badge border-none bg-base-100 font-medium">
              {hasAccess
                ? "All Access"
                : canManageAllAccess
                  ? "All Access · action needed"
                  : PLAN_TIER_LABELS[planTier]}
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold tabular-nums">
            ${currentPrice.toFixed(2)}{" "}
            <span className="text-sm font-normal text-base-content/50">
              / month
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {canManageAllAccess ? (
            <div className="space-y-2">
              <ManageSubscriptionButton
                isLoading={isPortalLoading}
                onClick={onManageSubscription}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full text-error"
                disabled={isCancelPending}
                onClick={onCancelMembership}
              >
                Cancel All Access
              </button>
            </div>
          ) : isFreePlan ? (
            <Link
              to="/subscribe"
              search={{ upgrade: true }}
              className="btn btn-primary w-full"
            >
              Upgrade Plan
            </Link>
          ) : (
            <ManageSubscriptionButton
              legacy
              isLoading={isPortalLoading}
              onClick={onManageSubscription}
            />
          )}
        </div>
      </div>

      {referral ? (
        <ReferralProgramCard referral={referral} />
      ) : isFreePlan && !canManageAllAccess ? (
        <div className="flex flex-col justify-between rounded-lg border border-base-300 bg-base-100 p-4 gap-4">
          <div>
            <span className="font-medium">Unlock full features</span>
            <p className="mt-2 text-sm text-base-content/70">
              All Access includes high daily quotas, on-demand AI agents, and
              the account-wide referral program.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
