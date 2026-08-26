export const KEYWORD_PRO_COHORT_KEYS = [
  "krp_founder_10",
  "krp_early_20",
  "krp_growth_45",
  "krp_scale_75",
  "krp_public",
] as const;

export const KEYWORD_PRO_COHORTS = [
  {
    key: KEYWORD_PRO_COHORT_KEYS[0],
    label: "Founder 10",
    capacity: 10,
    defaultPriceUsdCents: 1_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[1],
    label: "Early 20",
    capacity: 20,
    defaultPriceUsdCents: 2_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[2],
    label: "Growth 45",
    capacity: 45,
    defaultPriceUsdCents: 3_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[3],
    label: "Scale 75",
    capacity: 75,
    defaultPriceUsdCents: 4_900,
  },
  {
    key: KEYWORD_PRO_COHORT_KEYS[4],
    label: "Public",
    capacity: null,
    defaultPriceUsdCents: 5_900,
  },
] as const;

export type KeywordProCohortKey = (typeof KEYWORD_PRO_COHORTS)[number]["key"];

export const KEYWORD_PRO_REFERRER_RATE = 0.2;
export const KEYWORD_PRO_REFERRER_MONTHS = 12;
export const KEYWORD_PRO_REFERRED_REWARD_CREDITS = 5_000;

export function isKeywordProCohortKey(
  value: string,
): value is KeywordProCohortKey {
  return KEYWORD_PRO_COHORTS.some((cohort) => cohort.key === value);
}

export function createKeywordProMarker(
  organizationId: string,
  cohortKey: KeywordProCohortKey,
) {
  return `krp:${organizationId}:${cohortKey}`;
}

export function parseKeywordProMarker(value: unknown): {
  organizationId: string;
  cohortKey: KeywordProCohortKey;
} | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^krp:([^:]+):(krp_[a-z0-9_]+)$/);
  if (!match || !isKeywordProCohortKey(match[2])) return null;
  return { organizationId: match[1], cohortKey: match[2] };
}
