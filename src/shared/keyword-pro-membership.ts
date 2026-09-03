import type { PlanTier } from "./plans";
import {
  hasPaymentStateAccess,
  hasSubscriptionAccess,
} from "./subscription-access";

export const KEYWORD_PRO_COHORT_KEYS = [
  "krp_founder_10",
  "krp_early_20",
  "krp_growth_50",
  "krp_public",
  "krp_standard",
  "krp_byok",
] as const;

export const KEYWORD_PRO_COHORTS = [
  {
    key: KEYWORD_PRO_COHORT_KEYS[0],
    label: "Founder 10",
    capacity: 10,
    defaultPriceUsdCents: 2_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[1],
    label: "Early 20",
    capacity: 20,
    defaultPriceUsdCents: 3_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[2],
    label: "Growth 50",
    capacity: 50,
    defaultPriceUsdCents: 4_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[3],
    label: "Public",
    capacity: null,
    defaultPriceUsdCents: 5_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[4],
    label: "Standard",
    capacity: null,
    defaultPriceUsdCents: 900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[5],
    label: "BYOK",
    capacity: null,
    defaultPriceUsdCents: 400,
  },
] as const;

export type KeywordProCohortKey = (typeof KEYWORD_PRO_COHORTS)[number]["key"];

export const KEYWORD_PRO_REFERRER_RATE = 0.2;
export const KEYWORD_PRO_REFERRED_REWARD_CREDITS = 5_000;

export type KeywordProMarkerCohortKey =
  | KeywordProCohortKey
  | "krp_growth_45"
  | "krp_scale_75";

/**
 * Product-level access check. Suspended memberships retain access through a
 * short payment-recovery grace period; cancelled/expired memberships lose the
 * grandfathered price immediately.
 */
export function hasMembershipAccess(
  status: string | null | undefined,
  currentPeriodEnd: string | null | undefined,
  now = new Date(),
) {
  return hasPaymentStateAccess(status, currentPeriodEnd, now);
}

type LegacySubscriptionAccessState = {
  planTier: PlanTier;
  status: string | null | undefined;
  currentPeriodEnd: string | null | undefined;
};

/**
 * Resolve feature access during the migration from legacy paid tiers to the
 * account-wide All Access membership. Existing paid customers keep the tools
 * they already paid for and are not sent into an impossible upgrade loop.
 */
export function resolveAllAccessFeatureEntitlement(
  input: {
    membershipStatus: string | null | undefined;
    membershipCurrentPeriodEnd: string | null | undefined;
    subscription: LegacySubscriptionAccessState | null | undefined;
  },
  now = new Date(),
) {
  const hasAccess = hasMembershipAccess(
    input.membershipStatus,
    input.membershipCurrentPeriodEnd,
    now,
  );
  const hasLegacyPaidPlan =
    !hasAccess && hasSubscriptionAccess(input.subscription, now);
  return {
    hasAccess,
    hasLegacyPaidPlan,
    hasFeatureAccess: hasAccess || hasLegacyPaidPlan,
  };
}

export function isKeywordProCohortKey(
  value: string,
): value is KeywordProCohortKey {
  return KEYWORD_PRO_COHORTS.some((cohort) => cohort.key === value);
}

export function createKeywordProMarker(
  organizationId: string,
  cohortKey: KeywordProCohortKey,
) {
  return `membership:${organizationId}:${cohortKey}`;
}

export function parseKeywordProMarker(value: unknown): {
  organizationId: string;
  cohortKey: KeywordProMarkerCohortKey;
} | null {
  if (typeof value !== "string") return null;
  // `krp:` remains readable for subscriptions created before membership was
  // promoted from an add-on to the account-wide All Access product.
  const match = value.match(/^(?:membership|krp):([^:]+):(krp_[a-z0-9_]+)$/);
  if (!match) return null;
  const cohortKey = match[2];
  if (
    !isKeywordProCohortKey(cohortKey) &&
    cohortKey !== "krp_growth_45" &&
    cohortKey !== "krp_scale_75"
  ) {
    return null;
  }
  return { organizationId: match[1], cohortKey };
}
