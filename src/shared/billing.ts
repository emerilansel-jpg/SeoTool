import type { PlanTier } from "@/shared/plans";

export const BILLING_ROUTE = "/billing";
export const SUBSCRIBE_ROUTE = "/subscribe";

// PayPal plan ids live in shared/plans.ts (typed) and are resolved at runtime
// through the effective plan config (server/billing/plan-config.ts).

// The shared usage-credit pool. Both DataForSEO and onboarding-LLM spend deduct
// from these (monthly usage_credits first, then rolled-over topup_credits).
export const PAYPAL_CREDITS_FEATURE_ID = "usage_credits";
export const PAYPAL_TOPUP_CREDITS_FEATURE_ID = "topup_credits";
export const CREDITS_PER_USD = 1000;
/** Hosted DataForSEO requests use the platform credential and include a 30%
 * service margin. BYOK requests are paid to DataForSEO by the customer and
 * only deduct the 10% SeoTool service fee from usage credits. */
export const SEO_DATA_COST_MARKUP = 1.3;
export const SEO_DATA_BYOK_FEE_MULTIPLIER = 0.1;
export const LOW_CREDITS_THRESHOLD_USD = 0.25;

/** Monthly credit grant per tier. Must stay importable from client code, so
 *  it lives here rather than in the server-only credits service. */
export const MONTHLY_CREDIT_GRANTS: Record<PlanTier, number> = {
  free: 100,
  starter: 3_000,
  lite: 25_000,
  standard: 70_000,
  pro: 125_000,
  agency: 190_000,
  byok: 500,
};

/** Monthly credit packs convert every successful payment into permanent
 *  `topup_credits`. Credits roll over forever instead of expiring at month end. */
export const RETAINER_TIERS: readonly PlanTier[] = [
  "starter",
  "lite",
  "standard",
  "pro",
  "agency",
];

export function isRetainerTier(tier: PlanTier): boolean {
  return (RETAINER_TIERS as readonly string[]).includes(tier);
}

export type MonthlyPlanTier =
  | "starter"
  | "lite"
  | "standard"
  | "pro"
  | "agency";

export interface MonthlyCreditPack {
  key: string;
  tier: MonthlyPlanTier;
  name: string;
  priceUsd: number;
  credits: number;
}

export const MONTHLY_CREDIT_PACKS: readonly MonthlyCreditPack[] = [
  {
    key: "micro",
    tier: "starter",
    name: "Micro",
    priceUsd: 1,
    credits: 3_000,
  },
  {
    key: "builder",
    tier: "lite",
    name: "Builder",
    priceUsd: 7,
    credits: 25_000,
  },
  {
    key: "business",
    tier: "standard",
    name: "Business",
    priceUsd: 17,
    credits: 70_000,
  },
  {
    key: "scale",
    tier: "pro",
    name: "Scale",
    priceUsd: 27,
    credits: 125_000,
  },
  {
    key: "power",
    tier: "agency",
    name: "Power",
    priceUsd: 37,
    credits: 190_000,
  },
] as const;

export type MonthlyCreditPackKey =
  | "micro"
  | "builder"
  | "business"
  | "scale"
  | "power";

export function getMonthlyCreditPack(key: string): MonthlyCreditPack | null {
  return MONTHLY_CREDIT_PACKS.find((pack) => pack.key === key) ?? null;
}

export function retainerCreditsForUsd(amountUsd: number): number {
  return (
    MONTHLY_CREDIT_PACKS.find((pack) => pack.priceUsd === amountUsd)?.credits ??
    Math.round(amountUsd * CREDITS_PER_USD)
  );
}

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
