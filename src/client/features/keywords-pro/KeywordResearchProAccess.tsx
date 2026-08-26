import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  cancelKeywordProMembership,
  createKeywordProCheckout,
} from "@/serverFunctions/keyword-pro-membership";
import type { getKeywordProMembershipStatus } from "@/serverFunctions/keyword-pro-membership";

function number(value: number) {
  return new Intl.NumberFormat().format(value);
}

export function MembershipOffer({
  projectId,
  status,
  checkout,
  initialReferralCode,
}: {
  projectId: string;
  status: Awaited<ReturnType<typeof getKeywordProMembershipStatus>> | undefined;
  checkout?: "success" | "cancelled";
  initialReferralCode?: string;
}) {
  const [referralCode, setReferralCode] = useState(initialReferralCode ?? "");
  const checkoutMutation = useMutation({
    mutationFn: () =>
      createKeywordProCheckout({
        data: {
          projectId,
          referralCode: referralCode.trim() || undefined,
        },
      }),
    onSuccess: (result) => window.location.assign(result.approveUrl),
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Could not start checkout")),
  });
  const cohort = status?.currentCohort;

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-base-100 p-6 shadow-sm md:p-8">
      {checkout === "cancelled" ? (
        <div className="alert alert-warning mb-5 text-sm">
          Checkout was cancelled. No membership charge was created.
        </div>
      ) : null}
      {checkout === "success" ? (
        <div className="alert alert-info mb-5 text-sm">
          PayPal approved the checkout. We are confirming your membership…
        </div>
      ) : null}
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="badge badge-primary badge-sm mb-3">
            LIFETIME PRICE LOCK
          </span>
          <h2 className="text-2xl font-semibold">
            Unlock Keyword Research Pro
          </h2>
          <p className="mt-2 max-w-xl text-sm text-base-content/70">
            Your monthly price stays the same for the lifetime of an
            uninterrupted membership—even when later cohorts pay more.
          </p>
        </div>
        <div className="rounded-xl bg-primary/10 px-5 py-4 text-center">
          <div className="text-3xl font-bold text-primary">
            ${((cohort?.priceUsdCents ?? 1_900) / 100).toFixed(0)}
          </div>
          <div className="text-xs text-base-content/60">USD / month</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          "KGR + live allintitle competition",
          "Weak page-one result detection",
          "Optional live backlink competition",
          "Standard or BYOK usage billing",
          "CSV opportunity reports",
          "Referral rewards in SeoTool credits",
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-success" /> {feature}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-base-300 bg-base-200/40 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">
            Current cohort: {cohort?.label ?? "Founder 10"}
          </span>
          {cohort?.remaining != null ? (
            <span className="text-base-content/60">
              {cohort.remaining} spot{cohort.remaining === 1 ? "" : "s"} left
            </span>
          ) : null}
        </div>
      </div>

      <label className="form-control mt-5 max-w-md gap-1">
        <span className="text-sm font-medium">Referral code (optional)</span>
        <input
          className="input input-bordered"
          value={referralCode}
          onChange={(event) =>
            setReferralCode(event.target.value.toUpperCase())
          }
          maxLength={32}
          placeholder="Enter a friend's code"
        />
        <span className="text-xs text-base-content/50">
          A valid code gives you $5 in SeoTool usage credits after activation.
        </span>
      </label>

      <button
        className="btn btn-primary mt-6 w-full sm:w-auto"
        disabled={checkoutMutation.isPending || !cohort?.configured}
        onClick={() => checkoutMutation.mutate()}
      >
        {checkoutMutation.isPending ? (
          <span className="loading loading-spinner loading-sm" />
        ) : null}
        Continue with PayPal
      </button>
      {!cohort?.configured ? (
        <p className="mt-2 text-xs text-warning">
          Checkout is being configured. Please contact support.
        </p>
      ) : null}
      <p className="mt-3 text-xs text-base-content/50">
        Usage credits are billed separately. Cancel any time; cancelling ends
        the lifetime price lock.
      </p>
    </div>
  );
}

export function ReferralPanel({
  projectId,
  referral,
}: {
  projectId: string;
  referral: { code: string; referrals: number; rewardCredits: number };
}) {
  const queryClient = useQueryClient();
  const cancel = useMutation({
    mutationFn: () => cancelKeywordProMembership({ data: { projectId } }),
    onSuccess: () => {
      toast.success("Keyword Research Pro membership cancelled.");
      void queryClient.invalidateQueries({
        queryKey: ["keyword-pro-membership", projectId],
      });
    },
    onError: (error) =>
      toast.error(
        getStandardErrorMessage(error, "Could not cancel membership"),
      ),
  });
  const copy = async () => {
    await navigator.clipboard.writeText(referral.code);
    toast.success("Referral code copied");
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <Users className="size-5 text-primary" />
        <div>
          <div className="font-medium">Refer & earn 20% in credits</div>
          <div className="text-xs text-base-content/60">
            {referral.referrals} referrals · {number(referral.rewardCredits)}{" "}
            credits earned
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-sm" onClick={() => void copy()}>
          <code>{referral.code}</code> <Copy className="size-3.5" />
        </button>
        <button
          className="btn btn-ghost btn-sm text-error"
          disabled={cancel.isPending}
          onClick={() => {
            if (
              window.confirm(
                "Cancel Keyword Research Pro? Your lifetime price lock will end.",
              )
            ) {
              cancel.mutate();
            }
          }}
        >
          Cancel membership
        </button>
      </div>
    </div>
  );
}
