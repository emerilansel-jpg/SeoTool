import { QuotaRepository } from "../repositories/QuotaRepository";
import {
  QUOTA_FEATURE_PERIODS,
  getPlanLimit,
  type PlanTier,
  type QuotaFeature,
} from "@/shared/plans";
import { AppError } from "@/server/lib/errors";
import { isPlatformAdmin } from "@/server/lib/platform-admin";

// Cache orgId → is-admin-org so repeated quota checks don't re-query the
// owner email. Entries are small and orgs are few; no TTL needed.
const adminOrgCache = new Map<string, boolean>();

async function isPlatformAdminOrg(organizationId: string): Promise<boolean> {
  const cached = adminOrgCache.get(organizationId);
  if (cached !== undefined) return cached;

  const ownerEmail = await QuotaRepository.getOwnerEmail(organizationId);
  const isAdmin = ownerEmail
    ? await isPlatformAdmin({ userEmail: ownerEmail })
    : false;
  adminOrgCache.set(organizationId, isAdmin);
  return isAdmin;
}

// ---------------------------------------------------------------------------
// Window computation
// ---------------------------------------------------------------------------

/** Returns the [start, end) window for a quota period, anchored to now.
 *  - daily: [today 00:00 UTC, tomorrow 00:00 UTC)
 *  - monthly: [now, now + 30 days) — aligned to the subscription period when
 *    one is known. We use a 30-day rolling window as the fallback for the free
 *    tier, which has no Autumn subscription.
 */
function computeWindow(
  period: "daily" | "monthly",
  now: Date = new Date(),
  periodEndIso?: string | null,
): { windowStart: string; windowEnd: string } {
  const windowStart = now.toISOString();

  if (period === "daily") {
    // Start of the current UTC day, end = start + 1 day.
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { windowStart: start.toISOString(), windowEnd: end.toISOString() };
  }

  // Monthly: if we have a subscription period end, the window runs from now
  // until that boundary. Otherwise, 30 days from now.
  if (periodEndIso) {
    const periodEnd = new Date(periodEndIso);
    if (periodEnd.getTime() > now.getTime()) {
      return { windowStart, windowEnd: periodEndIso };
    }
    // Period end is in the past — fall through to the 30-day default.
  }

  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { windowStart, windowEnd: end.toISOString() };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type QuotaCheckResult = {
  allowed: boolean;
  used: number;
  limit: number;
  resetAt: string | null;
};

/** Returns the org's current plan tier. Defaults to "free" when no
 *  subscription row exists yet. Platform-admin-owned orgs get the agency
 *  tier so admins can test every feature without a paid subscription. */
export async function getPlanTier(organizationId: string): Promise<PlanTier> {
  if (await isPlatformAdminOrg(organizationId)) {
    return "agency";
  }
  return QuotaRepository.getPlanTier(organizationId);
}

/** Returns the full subscription row (plan tier, status, period end). */
async function _getSubscription(organizationId: string) {
  return QuotaRepository.getSubscription(organizationId);
}

/** Check whether a feature is allowed on the org's plan WITHOUT
 *  incrementing. Use this for UI display and pre-flight warnings. For
 *  enforcement that blocks the operation, use assertQuotaAvailable (which
 *  increments atomically). */
export async function checkQuota(
  organizationId: string,
  feature: QuotaFeature,
): Promise<QuotaCheckResult> {
  const tier = await getPlanTier(organizationId);
  const limit = getPlanLimit(tier, feature);

  // Unlimited — always allowed, no DB tracking.
  if (limit === Number.POSITIVE_INFINITY) {
    return { allowed: true, used: 0, limit, resetAt: null };
  }

  // Not available on this plan.
  if (limit === 0) {
    return { allowed: false, used: 0, limit, resetAt: null };
  }

  const period = QUOTA_FEATURE_PERIODS[feature];

  // Gauge features: the caller counts live rows (e.g. projects, saved
  // keywords). We return the plan limit; the caller compares against the
  // live count. No usage_quota row is consulted.
  if (period === "gauge") {
    return { allowed: true, used: 0, limit, resetAt: null };
  }

  // Windowed feature: read the current usage row.
  const { used, windowEnd } = await QuotaRepository.peekUsageQuota(
    organizationId,
    feature,
    period,
  );
  return {
    allowed: used < limit,
    used,
    limit,
    resetAt: windowEnd,
  };
}

/** Assert that the org can perform `count` units of `feature` on their plan,
 *  and atomically increment the usage counter. Throws:
 *  - PLAN_LIMIT_REACHED if the feature is not available (limit 0) or the
 *    plan tier doesn't grant access.
 *  - QUOTA_EXCEEDED if the windowed usage would exceed the limit.
 *
 *  Gauge features are NOT incremented here — the caller is responsible for
 *  counting the live rows and calling assertGaugeLimit separately. */
export async function assertQuotaAvailable(
  organizationId: string,
  feature: QuotaFeature,
  count = 1,
): Promise<void> {
  const tier = await getPlanTier(organizationId);
  const limit = getPlanLimit(tier, feature);

  // Not available on this plan.
  if (limit === 0) {
    throw new AppError("PLAN_LIMIT_REACHED", undefined, {
      feature,
      planTier: tier,
    });
  }

  // Unlimited — skip DB tracking entirely.
  if (limit === Number.POSITIVE_INFINITY) {
    return;
  }

  const period = QUOTA_FEATURE_PERIODS[feature];
  if (period === "gauge") {
    // Gauge features shouldn't reach here via the windowed path. The caller
    // should use assertGaugeLimit. If they do call this, treat the limit as
    // a hard cap and let the caller enforce it.
    return;
  }

  // Windowed feature: atomically increment and check.
  const sub = await QuotaRepository.getSubscription(organizationId);
  const { windowStart, windowEnd } = computeWindow(
    period,
    new Date(),
    sub?.currentPeriodEnd,
  );

  const row = await QuotaRepository.incrementUsageQuota({
    organizationId,
    feature,
    period,
    delta: count,
    windowStart,
    windowEnd,
  });

  // The increment already happened in the DB. If it exceeded the limit, we
  // can't roll it back atomically across both backends, but we throw so the
  // caller knows to abort. The over-count is at most 1 per request and gets
  // reset at the next window — acceptable for a metering system.
  if (row.used > limit) {
    throw new AppError("QUOTA_EXCEEDED", undefined, {
      feature,
      used: String(row.used),
      limit: String(limit),
      resetAt: row.windowEnd,
      planTier: tier,
    });
  }
}

/** Assert a gauge feature is within its limit. Gauge features (projects,
 *  saved_keywords, rank_tracking, reports, audit_pages) are checked against
 *  a live count the caller provides. Throws PLAN_LIMIT_REACHED if the count
 *  is at or over the plan's limit. */
export async function assertGaugeLimit(
  organizationId: string,
  feature: QuotaFeature,
  currentCount: number,
  additional = 1,
): Promise<void> {
  const tier = await getPlanTier(organizationId);
  const limit = getPlanLimit(tier, feature);

  if (limit === 0) {
    throw new AppError("PLAN_LIMIT_REACHED", undefined, {
      feature,
      planTier: tier,
    });
  }

  if (limit === Number.POSITIVE_INFINITY) {
    return;
  }

  if (currentCount + additional > limit) {
    throw new AppError("QUOTA_EXCEEDED", undefined, {
      feature,
      used: String(currentCount),
      limit: String(limit),
      planTier: tier,
    });
  }
}

/** Returns a summary of all feature quotas for the billing UI. Gauge
 *  features return used=0 (the UI counts live rows client-side or via a
 *  separate query); windowed features return the real used/limit/reset. */
export async function getQuotaState(organizationId: string): Promise<
  Array<{
    feature: QuotaFeature;
    limit: number;
    used: number;
    resetAt: string | null;
  }>
> {
  const tier = await getPlanTier(organizationId);
  const windowedRows = await QuotaRepository.listUsageQuota(organizationId);
  const windowedMap = new Map(windowedRows.map((r) => [r.feature, r] as const));

  const allFeatures: QuotaFeature[] = [
    "projects",
    "keyword_search",
    "saved_keywords",
    "rank_tracking",
    "local_map_points",
    "backlink_check",
    "site_audit",
    "audit_pages",
    "ai_brand_lookup",
    "ai_prompt",
    "content_intelligence",
    "reports",
  ];
  return allFeatures.map((feature) => {
    const limit = getPlanLimit(tier, feature);
    const period = QUOTA_FEATURE_PERIODS[feature];

    if (limit === Number.POSITIVE_INFINITY || period === "gauge") {
      return { feature, limit, used: 0, resetAt: null };
    }

    const row = windowedMap.get(feature);
    return {
      feature,
      limit,
      used: row?.used ?? 0,
      resetAt: row?.windowEnd ?? null,
    };
  });
}

/** Called by the billing webhook when a subscription is updated. Resets
 *  windowed usage quotas on plan change so the user starts fresh on the new
 *  tier's limits. */
async function _resetQuotasOnPlanChange(organizationId: string): Promise<void> {
  await QuotaRepository.resetUsageQuotaForOrg(organizationId);
}
