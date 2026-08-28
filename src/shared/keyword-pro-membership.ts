export const KEYWORD_PRO_COHORT_KEYS = [
  "krp_founder_10",
  "krp_early_20",
  "krp_growth_50",
  "krp_public",
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
import { hasPaymentStateAccess } from "./subscription-access";
