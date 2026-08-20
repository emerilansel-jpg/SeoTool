import { AppError } from "@/server/lib/errors";
import type { PlanTier } from "@/shared/plans";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import {
  addTopupCredits,
  deductCredits,
  grantMonthlyCredits,
} from "@/server/billing/credits";
import { syncPaypalCustomerStatus } from "@/server/billing/customer-status-sync";
import { AdminBillingRepository } from "../repositories/AdminBillingRepository";

export const AdminBillingService = {
  async listSubscriptions(input: {
    search?: string;
    page: number;
    pageSize: number;
  }) {
    return AdminBillingRepository.listSubscriptions({
      search: input.search,
      limit: input.pageSize,
      offset: (input.page - 1) * input.pageSize,
    });
  },

  async listWebhookEvents(limit = 50) {
    return AdminBillingRepository.listWebhookEvents(limit);
  },

  /** Manual plan tier override. Mirrors the webhook sync semantics: on a tier
   *  change the windowed quotas reset and monthly credits are re-granted. The
   *  linked PayPal subscription id is kept unless the org drops to free. */
  async setPlanTier(input: {
    organizationId: string;
    planTier: PlanTier;
  }): Promise<void> {
    const previous = await QuotaRepository.getSubscription(
      input.organizationId,
    );
    const previousTier = previous?.planTier ?? "free";

    await QuotaRepository.upsertSubscription({
      organizationId: input.organizationId,
      planTier: input.planTier,
      paypalSubscriptionId:
        input.planTier === "free"
          ? null
          : (previous?.paypalSubscriptionId ?? null),
      status: "active",
    });

    if (previousTier !== input.planTier) {
      await QuotaRepository.resetUsageQuotaForOrg(input.organizationId);
      await grantMonthlyCredits(input.organizationId, input.planTier);
    }
  },

  /** Positive delta adds topup credits; negative delta deducts from the
   *  monthly pool first, then topup. */
  async adjustCredits(input: {
    organizationId: string;
    delta: number;
  }): Promise<void> {
    if (input.delta === 0) {
      throw new AppError("VALIDATION_ERROR", "Credit delta cannot be zero.");
    }

    if (input.delta > 0) {
      await addTopupCredits(input.organizationId, input.delta);
      return;
    }

    try {
      await deductCredits(input.organizationId, -input.delta);
    } catch {
      throw new AppError(
        "VALIDATION_ERROR",
        "Insufficient credit balance for this deduction.",
      );
    }
  },

  /** Re-sync an org's billing state from PayPal (or fall back to free tier
   *  when no PayPal subscription is linked). */
  async resyncOrg(input: { organizationId: string }) {
    return syncPaypalCustomerStatus(input.organizationId);
  },
};
