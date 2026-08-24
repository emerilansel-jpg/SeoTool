// Plan tier definitions for the hosted SaaS (Ahrefs/Semrush-style model).
//
// Four tiers gate every metered feature: Free, Lite, Pro, Agency. Each tier
// carries a monthly price and a per-feature limit map. Limits are read by the
// QuotaService at enforcement time and by the billing UI for display.
//
// `Infinity` means "unlimited" — the QuotaService short-circuits without
// touching the DB for unlimited limits, so those rows never accrue usage.
// `0` means "not available on this plan" — the QuotaService throws
// PLAN_LIMIT_REACHED before any work runs.
//
// Keep this file as the single source of truth: the marketing pricing page,
// the in-app billing page, the QuotaService, and the quota gate all import
// from here so the numbers can't drift.

export const PLAN_TIERS = ["free", "lite", "pro", "agency"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

/** PayPal Billing Plan ID for each tier. Maps 1:1 to plans configured in the
 *  PayPal dashboard. The free tier has no subscription plan id. */
export const PAYPAL_PLAN_IDS: Record<PlanTier, string | null> = {
  free: null,
  lite: "lite-plan",
  pro: "pro-plan",
  agency: "agency-plan",
};

/** Reverse lookup: PayPal plan id → our tier. Used by the webhook handler to
 *  resolve a subscription update to a tier. */
const PAYPAL_PLAN_ID_TO_TIER = new Map<string, PlanTier>(
  (["lite", "pro", "agency"] as const).map((tier) => [
    PAYPAL_PLAN_IDS[tier]!,
    tier,
  ]),
);

export function planTierFromPaypalPlanId(
  planId: string | null | undefined,
): PlanTier | null {
  if (!planId) return null;
  return PAYPAL_PLAN_ID_TO_TIER.get(planId) ?? null;
}

// Backward-compatible aliases
export const AUTUMN_PLAN_IDS = PAYPAL_PLAN_IDS;
export const planTierFromAutumnPlanId = planTierFromPaypalPlanId;

/** Display price in USD per month. Free is $0. */
export const PLAN_PRICES_USD: Record<PlanTier, number> = {
  free: 0,
  lite: 49,
  pro: 149,
  agency: 499,
};

/** Human-readable tier names for UI. */
export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  free: "Free",
  lite: "Lite",
  pro: "Pro",
  agency: "Agency",
};

/** Quota feature ids. These are the keys used in the `usage_quota` table and
 *  the limits map below. Keep them stable — they're stored in the DB. */
export const QUOTA_FEATURES = [
  "projects", // count of projects (gauge, not windowed)
  "keyword_search", // keyword research searches (daily)
  "saved_keywords", // saved keywords count (gauge)
  "rank_tracking", // tracked keywords count (gauge)
  "local_map_points", // geo-grid points checked (daily)
  "backlink_check", // backlink profile lookups (daily)
  "site_audit", // audit launches (monthly)
  "audit_pages", // max pages per audit (gauge, per-audit cap)
  "ai_brand_lookup", // AI brand citation scans (monthly)
  "ai_prompt", // AI prompt explorer runs (monthly)
  "content_intelligence", // content gap + entity extraction (monthly)
  "reports", // report configs count (gauge)
] as const;

export type QuotaFeature = (typeof QUOTA_FEATURES)[number];

/** Quota window for each feature: "daily" resets at UTC midnight, "monthly"
 *  resets at the subscription period boundary, "gauge" is a standing count
 *  that never resets (enforced by checking the live count, e.g. "how many
 *  projects do you have right now"). */
export type QuotaPeriod = "daily" | "monthly" | "gauge";

export const QUOTA_FEATURE_PERIODS: Record<QuotaFeature, QuotaPeriod> = {
  projects: "gauge",
  keyword_search: "daily",
  saved_keywords: "gauge",
  rank_tracking: "gauge",
  local_map_points: "daily",
  backlink_check: "daily",
  site_audit: "monthly",
  audit_pages: "gauge",
  ai_brand_lookup: "monthly",
  ai_prompt: "monthly",
  content_intelligence: "monthly",
  reports: "gauge",
};

/** Per-tier feature limits. `Infinity` = unlimited (no DB tracking), `0` =
 *  not available (gate throws PLAN_LIMIT_REACHED). Gauge features are checked
 *  against live counts, not a usage_quota row. */
export const PLAN_LIMITS: Record<PlanTier, Record<QuotaFeature, number>> = {
  free: {
    projects: 1,
    keyword_search: 10,
    saved_keywords: 50,
    rank_tracking: 0,
    local_map_points: 0,
    backlink_check: 0,
    site_audit: 1,
    audit_pages: 50,
    ai_brand_lookup: 0,
    ai_prompt: 0,
    content_intelligence: 0,
    reports: 0,
  },
  lite: {
    projects: 5,
    keyword_search: 100,
    saved_keywords: 500,
    rank_tracking: 50,
    local_map_points: 100,
    backlink_check: 10,
    site_audit: 3,
    audit_pages: 500,
    ai_brand_lookup: 10,
    ai_prompt: 20,
    content_intelligence: 20,
    reports: 5,
  },
  pro: {
    projects: 25,
    keyword_search: 500,
    saved_keywords: 5000,
    rank_tracking: 500,
    local_map_points: 500,
    backlink_check: 100,
    site_audit: 10,
    audit_pages: 5000,
    ai_brand_lookup: 50,
    ai_prompt: 100,
    content_intelligence: 100,
    reports: 25,
  },
  agency: {
    projects: Number.POSITIVE_INFINITY,
    keyword_search: Number.POSITIVE_INFINITY,
    saved_keywords: Number.POSITIVE_INFINITY,
    rank_tracking: 5000,
    local_map_points: 2500,
    backlink_check: 500,
    site_audit: 50,
    audit_pages: 10000,
    ai_brand_lookup: 200,
    ai_prompt: 500,
    content_intelligence: 500,
    reports: Number.POSITIVE_INFINITY,
  },
};

/** Max concurrent running audits per tier. Abuse control on our compute. */
export const PLAN_AUDIT_CONCURRENCY: Record<PlanTier, number> = {
  free: 1,
  lite: 3,
  pro: 10,
  agency: 50,
};

/** Feature access gates — boolean on/off, not quota-counted. */
export const PLAN_FEATURE_ACCESS: Record<
  PlanTier,
  { samAgent: boolean; mcpTools: boolean; ga4: boolean; gsc: boolean }
> = {
  free: { samAgent: false, mcpTools: false, ga4: true, gsc: true },
  lite: { samAgent: true, mcpTools: true, ga4: true, gsc: true },
  pro: { samAgent: true, mcpTools: true, ga4: true, gsc: true },
  agency: { samAgent: true, mcpTools: true, ga4: true, gsc: true },
};

/** Ordered tiers for UI rendering (lowest to highest). */
export const ORDERED_PLAN_TIERS: PlanTier[] = ["free", "lite", "pro", "agency"];

/** The default tier assigned at signup. Autumn's Default (free) is attached
 *  at customer creation; our subscription row defaults to "free". */
export const DEFAULT_PLAN_TIER: PlanTier = "free";

/** Returns true if the tier is paid (non-free). */
export function isPaidTier(tier: PlanTier): boolean {
  return tier !== "free";
}

/** Narrows a runtime string (e.g. a DB plan_tier column) to a PlanTier. */
export function isPlanTier(value: string): value is PlanTier {
  return (PLAN_TIERS as readonly string[]).includes(value);
}

/** Returns the limit for a feature on a tier, or Infinity for unlimited. */
export function getPlanLimit(tier: PlanTier, feature: QuotaFeature): number {
  return PLAN_LIMITS[tier][feature];
}

/** Maps a CreditFeature (billing-credit-features) to the QuotaFeature it gates.
 *  Returns null when the credit feature is not quota-gated (e.g. onboarding
 *  LLM spend, which has no per-feature limit). Used by meterDataforseoCall to
 *  resolve the quota feature for a DataForSEO API path before enforcement. */
export function creditFeatureToQuotaFeature(
  creditFeature: string,
): QuotaFeature | null {
  switch (creditFeature) {
    case "keyword_research":
    case "domain_overview":
    case "local_seo":
      return "keyword_search";
    case "local_map_rank":
      return "local_map_points";
    case "backlinks":
      return "backlink_check";
    case "site_audit":
      return "site_audit";
    case "rank_tracking":
      return "rank_tracking";
    case "ai_citations":
      return "ai_brand_lookup";
    case "ai_prompt_responses":
      return "ai_prompt";
    case "content_intelligence":
      return "content_intelligence";
    default:
      return null;
  }
}
