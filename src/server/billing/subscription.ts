import type { EnsuredUserContext } from "@/middleware/ensure-user/types";
import {
  CREDITS_PER_USD,
  SEO_DATA_COST_MARKUP,
  roundUsdForBilling,
} from "@/shared/billing";
import type { CreditFeature } from "@/shared/billing-credit-features";
import { captureServerEvent } from "@/server/lib/posthog";
import { AppError } from "@/server/lib/errors";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import {
  getCreditBalance,
  deductCredits,
  grantMonthlyCredits,
} from "@/server/billing/credits";

export type BillingCustomerContext = Pick<
  EnsuredUserContext,
  "organizationId" | "userEmail" | "userId"
> & {
  projectId?: string;
};

/**
 * Ensure the org has a subscription row. With PayPal, there's no remote
 * customer object to create — we just guarantee the local subscription row
 * exists so QuotaService can read the tier. Idempotent: the upsert is a
 * no-op if the row already exists.
 */
export async function getOrCreateOrganizationCustomer(
  context: BillingCustomerContext,
): Promise<{ id: string }> {
  // Lazily create the default free-tier subscription row. Idempotent: if the
  // row already exists (from a prior request or webhook), the upsert is a
  // no-op. This ensures every org has a subscription row for QuotaService to
  // read, even before their first PayPal webhook fires.
  try {
    await QuotaRepository.upsertSubscription({
      organizationId: context.organizationId,
      planTier: "free",
      status: "active",
    });
  } catch (error) {
    // Non-fatal: the webhook will create it on first sync. Log and continue.
    console.warn("billing.subscription-default-create failed:", error);
  }

  // Ensure free-tier credits exist for new orgs
  try {
    await grantMonthlyCredits(context.organizationId, "free");
  } catch (error) {
    console.warn("billing.credits-default-grant failed:", error);
  }

  return { id: context.organizationId };
}

/** Returns true when the org is on a paid tier (lite/pro/agency), not free.
 *  Reads from the local subscription table (synced from PayPal webhooks) so
 *  it's fast and doesn't add a PayPal round-trip to the hot path. */
export async function customerHasPaidPlan(customerId: string) {
  const tier = await QuotaRepository.getPlanTier(customerId);
  return tier !== "free";
}

// Remaining shared usage credits — the monthly `usage_credits` balance plus the
// rolled-over `topup_credits` balance. Both DataForSEO and LLM spend draw from
// these.
async function getUsageCreditsRemaining(customerId: string): Promise<{
  monthlyRemaining: number;
  topupRemaining: number;
}> {
  const balance = await getCreditBalance(customerId);
  return {
    monthlyRemaining: balance.monthlyRemaining,
    topupRemaining: balance.topupRemaining,
  };
}

/**
 * Depletion check for the chat-agent gates. Returns whether credits are
 * exhausted and the monthly remaining balance.
 */
export async function checkUsageCreditsDepleted(
  customer: BillingCustomerContext,
): Promise<{ depleted: boolean; monthlyRemaining: number }> {
  const check = await getUsageCreditsRemaining(customer.organizationId);
  if (check.monthlyRemaining + check.topupRemaining > 0) {
    return { depleted: false, monthlyRemaining: check.monthlyRemaining };
  }

  // Double-check with a fresh read to avoid stale cache issues
  const confirmed = await getUsageCreditsRemaining(customer.organizationId);

  if (confirmed.monthlyRemaining + confirmed.topupRemaining > 0) {
    console.error(
      "billing.credits-gate disagreement: first read depleted but " +
        "fresh read shows credits; proceeding on the fresh reading",
      {
        organizationId: customer.organizationId,
        check,
        confirmed,
      },
    );
    return { depleted: false, monthlyRemaining: confirmed.monthlyRemaining };
  }

  await captureServerEvent({
    distinctId: customer.userId,
    event: "usage:credits_gate_refused",
    organizationId: customer.organizationId,
    properties: {
      project_id: customer.projectId,
      monthly_remaining: confirmed.monthlyRemaining,
      topup_remaining: confirmed.topupRemaining,
    },
  });
  return { depleted: true, monthlyRemaining: check.monthlyRemaining };
}

/**
 * Throws INSUFFICIENT_CREDITS when the org has no usage/topup credits left.
 * Returns the monthly remaining so a caller can split spend monthly-first.
 */
export async function assertUsageCreditsAvailable(
  customerId: string,
): Promise<{ monthlyRemaining: number }> {
  const { monthlyRemaining, topupRemaining } =
    await getUsageCreditsRemaining(customerId);

  if (monthlyRemaining + topupRemaining <= 0) {
    throw new AppError("INSUFFICIENT_CREDITS");
  }

  return { monthlyRemaining };
}

/**
 * Deducts a USD provider cost from the org's shared usage-credit pool: applies
 * the platform markup, converts to credits, spends monthly `usage_credits`
 * first then `topup_credits`, and emits the usage:credits_consume event. Both
 * DataForSEO and onboarding-LLM spend route through here, so they draw from the
 * one pool. Pass `monthlyRemaining` from the balance check that gated the call.
 */
export async function trackUsageCreditSpend(args: {
  customer: BillingCustomerContext;
  customerId: string;
  creditFeature: CreditFeature;
  costUsd: number;
  monthlyRemaining: number;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const totalCostUsd = roundUsdForBilling(args.costUsd * SEO_DATA_COST_MARKUP);
  const totalCostCredits = Math.ceil(totalCostUsd * CREDITS_PER_USD);
  if (totalCostCredits <= 0) return;

  const { monthlyDeducted, topupDeducted } = await deductCredits(
    args.customerId,
    totalCostCredits,
  );

  await captureServerEvent({
    distinctId: args.customer.userId,
    event: "usage:credits_consume",
    organizationId: args.customer.organizationId,
    properties: {
      project_id: args.customer.projectId,
      credit_feature: args.creditFeature,
      monthly_credits: monthlyDeducted,
      topup_credits: topupDeducted,
      total_credits: totalCostCredits,
      cost_usd: totalCostUsd,
    },
  });
}
