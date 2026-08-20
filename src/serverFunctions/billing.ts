import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import {
  getQuotaState,
  getPlanTier,
} from "@/server/features/billing/services/QuotaService";
import { customerHasPaidPlan } from "@/server/billing/subscription";
import {
  getCreditBalance,
  grantMonthlyCredits,
} from "@/server/billing/credits";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { isPlatformAdmin } from "@/server/lib/platform-admin";
import { paypal } from "@/server/billing/paypal";

const billingUsageRangeSchema = z.object({
  start: z.number(),
  end: z.number(),
});

export type BillingUsageEvent = {
  value: number;
  properties: Record<
    string,
    | string
    | number
    | boolean
    | null
    | undefined
    | (string | number | boolean | null)[]
  >;
};

/** Fetch usage events from the local DB (replaces Autumn events.list). */
export const getBillingUsageEvents = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(billingUsageRangeSchema)
  .handler(async ({ data: _data, context }): Promise<BillingUsageEvent[]> => {
    if (!(await isHostedServerAuthMode())) {
      return [] as BillingUsageEvent[];
    }

    // Read credit consumption from the usage_quota table.
    // Monthly credits row tracks remaining balance; we reconstruct events
    // from the balance history. For now, return the current balance state
    // as a single event (sufficient for the billing UI chart).
    const balance = await getCreditBalance(context.organizationId);
    const events: BillingUsageEvent[] = [];

    if (balance.totalRemaining > 0) {
      events.push({
        value: balance.totalRemaining,
        properties: {
          feature: "usage_credits",
          monthly_remaining: balance.monthlyRemaining,
          topup_remaining: balance.topupRemaining,
        },
      });
    }

    return events;
  });

export const getQuotaStateSummary = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    const isAdmin = await isPlatformAdmin({
      userId: context.userId,
      userEmail: context.userEmail,
    });

    const [tier, quotas] = await Promise.all([
      getPlanTier(context.organizationId),
      getQuotaState(context.organizationId),
    ]);

    if (isAdmin) {
      if (tier === "free") {
        try {
          await QuotaRepository.upsertSubscription({
            organizationId: context.organizationId,
            planTier: "agency",
            status: "active",
          });
          await grantMonthlyCredits(context.organizationId, "agency");
        } catch (e) {
          console.warn("Failed to auto-upgrade admin subscription row:", e);
        }
        return { planTier: "agency" as const, quotas };
      }
    }

    return { planTier: tier, quotas };
  });

/** Open the PayPal customer billing portal for subscription management. */
export const getCustomerPortalUrl = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    if (!(await isHostedServerAuthMode())) {
      throw new AppError(
        "AUTH_CONFIG_MISSING",
        "Customer portal is only available in hosted mode",
      );
    }

    // Only paid customers can access the billing portal — free tier has
    // nothing to manage there.
    const hasPaidPlan = await customerHasPaidPlan(context.organizationId);
    if (!hasPaidPlan) {
      throw new AppError(
        "PLAN_LIMIT_REACHED",
        "No active paid subscription to manage",
      );
    }

    // Get the PayPal subscription id from the local subscription table
    const sub = await QuotaRepository.getSubscription(context.organizationId);
    if (!sub?.paypalSubscriptionId) {
      throw new AppError(
        "PLAN_LIMIT_REACHED",
        "No active PayPal subscription found",
      );
    }

    const result = await paypal.billingPortal.createSession(
      sub.paypalSubscriptionId,
    );

    return result.urls.billing_portal;
  });
