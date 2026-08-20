import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import {
  adjustAdminCredits,
  resyncAdminOrg,
  setAdminPlanTier,
} from "@/serverFunctions/admin-billing";
import {
  PLAN_TIERS,
  PLAN_TIER_LABELS,
  isPlanTier,
  type PlanTier,
} from "@/shared/plans";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

export function AdminOrgActions({
  organizationId,
  planTier,
}: {
  organizationId: string;
  planTier: string;
}) {
  const setTier = useServerFn(setAdminPlanTier);
  const adjustCredits = useServerFn(adjustAdminCredits);
  const resync = useServerFn(resyncAdminOrg);
  const queryClient = useQueryClient();

  const [selectedTier, setSelectedTier] = useState<PlanTier>(
    isPlanTier(planTier) ? planTier : "free",
  );
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [creditDelta, setCreditDelta] = useState("");
  const [creditReason, setCreditReason] = useState("");

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-user"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-subs"] });
  };

  const tierMutation = useMutation({
    mutationFn: (tier: PlanTier) =>
      setTier({
        data: {
          organizationId,
          planTier: tier,
        },
      }),
    onSuccess: () => {
      toast.success("Plan tier updated. Quotas reset and credits re-granted.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Could not change plan tier."),
      );
    },
  });

  const creditsMutation = useMutation({
    mutationFn: (delta: number) =>
      adjustCredits({
        data: { organizationId, delta, reason: creditReason || undefined },
      }),
    onSuccess: () => {
      toast.success("Credit balance adjusted.");
      setCreditsOpen(false);
      setCreditDelta("");
      setCreditReason("");
      invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not adjust credits."));
    },
  });

  const resyncMutation = useMutation({
    mutationFn: () => resync({ data: { organizationId } }),
    onSuccess: () => {
      toast.success("Billing state re-synced from PayPal.");
      invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Re-sync failed."));
    },
  });

  const parsedDelta = Number(creditDelta);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="select select-bordered select-sm"
        value={selectedTier}
        disabled={tierMutation.isPending}
        onChange={(event) => {
          const value = event.target.value;
          if (isPlanTier(value)) setSelectedTier(value);
        }}
        aria-label="Plan tier"
      >
        {PLAN_TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {PLAN_TIER_LABELS[tier]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-primary btn-xs"
        disabled={selectedTier === planTier || tierMutation.isPending}
        onClick={() => tierMutation.mutate(selectedTier)}
      >
        Apply tier
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        onClick={() => setCreditsOpen(true)}
      >
        Adjust credits
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square"
        aria-label="Re-sync from PayPal"
        disabled={resyncMutation.isPending}
        onClick={() => resyncMutation.mutate()}
      >
        <RefreshCw
          className={`size-3.5 ${resyncMutation.isPending ? "animate-spin" : ""}`}
        />
      </button>

      {creditsOpen ? (
        <Modal
          labelledBy="adjust-credits-title"
          onClose={() => setCreditsOpen(false)}
        >
          <h3 id="adjust-credits-title" className="font-semibold text-base">
            Adjust credits
          </h3>
          <p className="text-xs text-base-content/60">
            Positive values add topup credits; negative values deduct from the
            monthly pool first, then topup.
          </p>
          <input
            type="number"
            className="input input-bordered w-full font-mono text-sm"
            placeholder="e.g. 5000 or -1000"
            value={creditDelta}
            onChange={(event) => setCreditDelta(event.target.value)}
          />
          <input
            type="text"
            className="input input-bordered w-full text-sm"
            placeholder="Reason (optional, for your records)"
            value={creditReason}
            onChange={(event) => setCreditReason(event.target.value)}
          />
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setCreditsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={
                creditDelta === "" ||
                !Number.isInteger(parsedDelta) ||
                parsedDelta === 0 ||
                creditsMutation.isPending
              }
              onClick={() => creditsMutation.mutate(parsedDelta)}
            >
              Apply
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
