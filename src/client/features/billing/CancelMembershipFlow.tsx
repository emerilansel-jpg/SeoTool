import { useEffect, useState } from "react";
import { Modal } from "@/client/components/Modal";
import { captureClientEvent } from "@/client/lib/posthog";
import {
  CANCELLATION_REASON_LABELS,
  CANCELLATION_REASONS,
  isCancellationReason,
  saveOfferForReason,
  type CancellationReason,
} from "@/shared/cancellation";

export type CancelSurvey = {
  reason: CancellationReason;
  reasonDetail?: string;
};

type Step = "survey" | "offer" | "confirm";

/** Exit-survey cancel flow for All Access: survey → reason-matched save
 *  offer → confirmation. "Keep my subscription" stays visible on every step
 *  so cancelling is never trapped (no dark patterns). */
export function CancelMembershipFlow({
  priceUsd,
  isPending,
  onConfirmed,
  onClose,
}: {
  priceUsd: number;
  isPending: boolean;
  onConfirmed: (survey: CancelSurvey) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("survey");
  const [reason, setReason] = useState<CancellationReason | "">("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    captureClientEvent("billing:cancel_flow_opened");
  }, []);

  const offer = reason ? saveOfferForReason(reason, priceUsd) : null;

  function keepMembership(from: Step) {
    captureClientEvent("billing:cancel_kept", { from, reason: reason || null });
    onClose();
  }

  function continueFromSurvey() {
    if (!reason) return;
    captureClientEvent("billing:cancel_survey_continued", { reason });
    setStep(offer ? "offer" : "confirm");
  }

  return (
    <Modal maxWidth="max-w-lg" onClose={onClose} labelledBy="cancel-flow-title">
      <div className="space-y-4">
        {step === "survey" ? (
          <>
            <div>
              <h2 id="cancel-flow-title" className="text-lg font-semibold">
                We're sorry to see you go
              </h2>
              <p className="mt-1 text-sm text-base-content/70">
                What's the main reason you're cancelling? It helps us decide
                what to fix next.
              </p>
            </div>
            <div className="space-y-1.5">
              {CANCELLATION_REASONS.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md border border-base-300 px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="cancel-reason"
                    className="radio radio-primary radio-xs"
                    checked={reason === value}
                    onChange={() => setReason(value)}
                  />
                  {CANCELLATION_REASON_LABELS[value]}
                </label>
              ))}
            </div>
            <label className="block">
              <span className="mb-1 block text-sm">
                Anything more you can tell us? (optional)
              </span>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                maxLength={500}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Tell us more (optional)"
              />
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => keepMembership("survey")}
              >
                Never mind, keep my subscription
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!reason}
                onClick={continueFromSurvey}
              >
                Continue
              </button>
            </div>
          </>
        ) : null}

        {step === "offer" && offer ? (
          <>
            <div>
              <h2 id="cancel-flow-title" className="text-lg font-semibold">
                {offer.title}
              </h2>
              <div className="mt-2 rounded-lg border border-primary/40 bg-primary/5 p-4">
                <p className="text-sm leading-relaxed text-base-content/80">
                  {offer.body}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a
                className="btn btn-primary"
                href={offer.ctaHref}
                onClick={() => keepMembership("offer")}
              >
                {offer.ctaLabel}
              </a>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => keepMembership("offer")}
              >
                Keep my subscription
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                onClick={() => setStep("confirm")}
              >
                No thanks, continue cancelling
              </button>
            </div>
          </>
        ) : null}

        {step === "confirm" ? (
          <>
            <div>
              <h2 id="cancel-flow-title" className="text-lg font-semibold">
                Cancel All Access?
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-base-content/70">
                <li>Your membership and tool access end immediately.</li>
                <li>
                  Your ${priceUsd.toFixed(0)}/month cohort price lock is lost;
                  rejoining later costs the then-current price.
                </li>
                <li>
                  Your projects, keywords, and reports are kept, but paid tools
                  lock until you resubscribe.
                </li>
              </ul>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-primary"
                disabled={isPending}
                onClick={() => keepMembership("confirm")}
              >
                Keep my subscription
              </button>
              <button
                type="button"
                className="btn btn-error"
                disabled={isPending}
                onClick={() => {
                  captureClientEvent("billing:cancel_confirmed", {
                    reason: reason || null,
                  });
                  if (!reason || !isCancellationReason(reason)) return;
                  onConfirmed({
                    reason,
                    reasonDetail: detail.trim() || undefined,
                  });
                }}
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                Cancel membership
              </button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
