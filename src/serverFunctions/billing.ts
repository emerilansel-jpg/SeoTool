import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import {
  getRequiredEnvValue,
  isHostedServerAuthMode,
} from "@/server/lib/runtime-env";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { getQuotaState } from "@/server/features/billing/services/QuotaService";
import { customerHasPaidPlan } from "@/server/billing/subscription";
import { getCreditBalance } from "@/server/billing/credits";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { paypal } from "@/server/billing/paypal";

const billingUsageRangeSchema = z.object({
  start: z.number(),
  end: z.number(),
});

export type BillingUsageEvent = {
  value: number;
  properties: Record<string, unknown>;
};

/** Fetch usage events from the local DB (replaces Autumn events.list). */
export const getBillingUsageEvents = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(billingUsageRangeSchema)
  .handler(async ({ data, context }) => {
    if (!(await isHostedServerAuthMode())) {
      return [];
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
    return getQuotaState(context.organizationId);
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
