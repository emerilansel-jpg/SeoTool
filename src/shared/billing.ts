import type { PlanTier } from "@/shared/plans";

export const BILLING_ROUTE = "/billing";
export const SUBSCRIBE_ROUTE = "/subscribe";

/** PayPal Billing Plan ID for each paid tier. Configured in the PayPal
 *  dashboard under Products > Billing Plans. The free tier has no plan. */
export const PAYPAL_PLAN_IDS: Record<string, string | null> = {
  free: null,
  lite: "lite-plan",
  pro: "pro-plan",
  agency: "agency-plan",
};

// The shared usage-credit pool. Both DataForSEO and onboarding-LLM spend deduct
// from these (monthly usage_credits first, then rolled-over topup_credits).
export const PAYPAL_CREDITS_FEATURE_ID = "usage_credits";
export const PAYPAL_TOPUP_CREDITS_FEATURE_ID = "topup_credits";
export const CREDITS_PER_USD = 1000;
export const SEO_DATA_COST_MARKUP = 1.28;
export const LOW_CREDITS_THRESHOLD_USD = 0.25;

/** Monthly credit grant per tier. Must stay importable from client code, so
 *  it lives here rather than in the server-only credits service. */
export const MONTHLY_CREDIT_GRANTS: Record<PlanTier, number> = {
  free: 100,
  lite: 5_000,
  pro: 25_000,
  agency: 100_000,
};

export function roundUsdForBilling(value: number) {
  return Math.round(value * 100000) / 100000;
}

export function creditsToUsd(credits: number) {
  return credits / CREDITS_PER_USD;
}

// Backward-compatible alias for files not yet migrated
export const AUTUMN_SEO_DATA_CREDITS_PER_USD = CREDITS_PER_USD;
export const autumnSeoDataCreditsToUsd = creditsToUsd;

/**
 * Convert a raw DataForSEO USD cost into the USD amount a hosted customer is
 * actually billed, applying the platform markup. Use this when displaying
 * cost estimates so the number matches what the user will be charged.
 *
 * Self-hosted deployments pay DataForSEO directly at the raw rate and should
 * show the raw number — gate at the call site with `isHostedClientAuthMode`.
 */
export function applyBillingMarkupUsd(rawUsd: number): number {
  return roundUsdForBilling(rawUsd * SEO_DATA_COST_MARKUP);
}
