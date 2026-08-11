import {
  assertQuotaAvailable,
  assertGaugeLimit,
  getPlanTier,
} from "@/server/features/billing/services/QuotaService";
import { gaugeCount } from "@/server/features/billing/services/gaugeCounts";
import { PLAN_FEATURE_ACCESS, type QuotaFeature } from "@/shared/plans";
import { AppError } from "@/server/lib/errors";

// High-level quota gate for feature call sites. This is the single entry
// point feature services should call before performing a metered action.
// It routes windowed features through QuotaService.assertQuotaAvailable and
// gauge features through a live-count + assertGaugeLimit, and provides a
// feature-access gate for boolean on/off features (SAM agent, MCP tools).

/** Assert a windowed feature quota is available and increment it. For
 *  gauge features, use assertGaugeFeature instead. */
export async function assertFeatureQuota(
  organizationId: string,
  feature: QuotaFeature,
  count = 1,
): Promise<void> {
  await assertQuotaAvailable(organizationId, feature, count);
}

/** Assert a gauge feature (projects, saved_keywords, rank_tracking, reports)
 *  is within the plan limit, counting the live rows. `additional` is how many
 *  the caller is about to add (default 1). */
export async function assertGaugeFeature(
  organizationId: string,
  feature: QuotaFeature,
  additional = 1,
): Promise<void> {
  const current = await gaugeCount(organizationId, feature);
  await assertGaugeLimit(organizationId, feature, current, additional);
}

/** Assert a boolean feature (SAM agent, MCP tools, GA4, GSC) is available on
 *  the org's plan. Throws PLAN_LIMIT_REACHED if the plan doesn't grant
 *  access. */
export async function assertFeatureAccess(
  organizationId: string,
  feature: "samAgent" | "mcpTools" | "ga4" | "gsc",
): Promise<void> {
  const tier = await getPlanTier(organizationId);
  const allowed = PLAN_FEATURE_ACCESS[tier][feature];
  if (!allowed) {
    throw new AppError("PLAN_LIMIT_REACHED", undefined, {
      feature,
      planTier: tier,
    });
  }
}

/** Check-only (no increment) — for UI pre-flight warnings. Returns true if
 *  the feature is available and within quota on the org's plan. */
export async function isFeatureAvailable(
  organizationId: string,
  feature: QuotaFeature,
): Promise<boolean> {
  const { checkQuota } =
    await import("@/server/features/billing/services/QuotaService");
  const result = await checkQuota(organizationId, feature);
  return result.allowed;
}
