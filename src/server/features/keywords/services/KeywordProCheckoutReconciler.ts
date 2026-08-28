import { paypal, PayPalRequestError } from "@/server/billing/paypal";
import { KeywordProCohortSeatRepository } from "@/server/features/keywords/repositories/KeywordProCohortSeatRepository";
import { KeywordProRepository } from "@/server/features/keywords/repositories/KeywordProRepository";
import { syncKeywordProSubscription } from "./KeywordProSubscriptionLifecycle";

export async function reconcileExpiredCheckoutReservations() {
  const expired = await KeywordProRepository.listExpiredCheckoutReservations(
    new Date().toISOString(),
  );
  for (const membership of expired) {
    try {
      if (
        membership.status === "CHECKOUT_CREATING" &&
        membership.paypalSubscriptionId.startsWith("checkout:")
      ) {
        await KeywordProCohortSeatRepository.abandonCheckout(
          membership.organizationId,
          membership.paypalSubscriptionId,
        );
        await KeywordProRepository.deleteReleasedMembership(
          membership.organizationId,
        );
        continue;
      }

      const subscription = await paypal.subscriptions.get(
        membership.paypalSubscriptionId,
      );
      if (["APPROVAL_PENDING", "APPROVED"].includes(subscription.status)) {
        await paypal.subscriptions.cancel(
          subscription.id,
          "SeoTool All Access checkout approval expired",
        );
        await syncKeywordProSubscription({
          ...subscription,
          status: "CANCELLED",
        });
      } else {
        await syncKeywordProSubscription(subscription);
      }
    } catch (error) {
      if (error instanceof PayPalRequestError && error.status === 404) {
        await KeywordProCohortSeatRepository.abandonCheckout(
          membership.organizationId,
          membership.paypalSubscriptionId,
        );
        await KeywordProRepository.deleteReleasedMembership(
          membership.organizationId,
        );
        continue;
      }
      console.error(
        "Failed to reconcile an expired All Access checkout",
        membership.organizationId,
        error,
      );
    }
  }
}
