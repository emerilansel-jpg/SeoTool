export type KeywordResearchProMode = "basic" | "full";
export type KeywordResearchProBillingMode = "standard" | "byok";

export type KeywordResearchProCompetitor = {
  position: number;
  title: string | null;
  url: string | null;
  domain: string | null;
  exactTitleMatch: boolean;
  pageRank: number | null;
  domainRank: number | null;
  backlinks: number | null;
  referringDomains: number | null;
  spamScore: number | null;
  /** SeoTool proxy derived from DataForSEO rank and spam. It is deliberately
   * not presented as Majestic Trust Flow. */
  trustProxy: number | null;
  isWeak: boolean;
};

export type KeywordResearchProRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  keywordDifficulty: number | null;
  intent: string | null;
  allintitleCount: number | null;
  kgr: number | null;
  titleMatches: number;
  weakSerpCount: number;
  contentScore: number;
  linkScore: number | null;
  totalScore: number;
  opportunity: "Very easy" | "Easy" | "Possible" | "Competitive";
  medianPageRank: number | null;
  medianDomainRank: number | null;
  medianReferringDomains: number | null;
  medianSpamScore: number | null;
  competitors: KeywordResearchProCompetitor[];
};

export type KeywordResearchProResult = {
  mode: KeywordResearchProMode;
  billingMode: KeywordResearchProBillingMode;
  rows: KeywordResearchProRow[];
  estimatedRawCostUsd: number;
  estimatedSeoToolChargeUsd: number;
  estimatedTotalOutlayUsd: number;
  methodologyVersion: "krp-v1";
};

export function normalizeKeywordPhrase(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function titleContainsKeyword(title: string | null, keyword: string) {
  if (!title) return false;
  const phrase = normalizeKeywordPhrase(keyword);
  return phrase.length > 0 && normalizeKeywordPhrase(title).includes(phrase);
}

export function calculateKgr(
  allintitleCount: number | null,
  searchVolume: number | null,
) {
  if (allintitleCount == null || searchVolume == null || searchVolume <= 0) {
    return null;
  }
  return allintitleCount / searchVolume;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function kgrOpportunityScore(kgr: number | null) {
  if (kgr == null) return 0;
  if (kgr <= 0.25) return 100;
  if (kgr <= 1) return 70 - ((kgr - 0.25) / 0.75) * 30;
  return Math.max(0, 40 - Math.min(1, (kgr - 1) / 4) * 40);
}

export function calculateContentScore(input: {
  kgr: number | null;
  titleMatches: number;
  weakSerpCount: number;
  keywordDifficulty: number | null;
}) {
  const titleGap = ((10 - Math.min(10, input.titleMatches)) / 10) * 100;
  const weakResults = (Math.min(10, input.weakSerpCount) / 10) * 100;
  const difficulty = 100 - (input.keywordDifficulty ?? 50);
  return clampScore(
    kgrOpportunityScore(input.kgr) * 0.35 +
      titleGap * 0.3 +
      weakResults * 0.2 +
      difficulty * 0.15,
  );
}

export function calculateLinkScore(input: {
  medianPageRank: number | null;
  medianDomainRank: number | null;
  medianReferringDomains: number | null;
  weakSerpCount: number;
  medianSpamScore: number | null;
}) {
  const pageEase = 100 - (input.medianPageRank ?? 50);
  const domainEase = 100 - (input.medianDomainRank ?? 50);
  const referringEase =
    100 -
    Math.min(
      100,
      (Math.log10((input.medianReferringDomains ?? 100) + 1) / 3) * 100,
    );
  const weakResults = (Math.min(10, input.weakSerpCount) / 10) * 100;
  const spamPenalty = Math.max(0, (input.medianSpamScore ?? 0) - 30) * 0.25;
  return clampScore(
    pageEase * 0.35 +
      domainEase * 0.25 +
      referringEase * 0.25 +
      weakResults * 0.15 -
      spamPenalty,
  );
}

export function calculateTotalScore(
  contentScore: number,
  linkScore: number | null,
) {
  return linkScore == null
    ? contentScore
    : clampScore(contentScore * 0.6 + linkScore * 0.4);
}

export function opportunityLabel(
  score: number,
): KeywordResearchProRow["opportunity"] {
  if (score >= 75) return "Very easy";
  if (score >= 60) return "Easy";
  if (score >= 45) return "Possible";
  return "Competitive";
}

export function median(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => value != null);
  if (numbers.length === 0) return null;
  numbers.sort((left, right) => left - right);
  const midpoint = Math.floor(numbers.length / 2);
  return numbers.length % 2 === 0
    ? (numbers[midpoint - 1] + numbers[midpoint]) / 2
    : numbers[midpoint];
}

export function estimateKeywordResearchProCost(
  keywordCount: number,
  mode: KeywordResearchProMode,
  billingMode: KeywordResearchProBillingMode,
) {
  // Conservative live endpoint estimates; actual credit deductions always use
  // DataForSEO's task-level cost response.
  const keywordOverview = 0.0201;
  const pageOneSerps = keywordCount * 0.002;
  const allintitleSerps = keywordCount * 0.01;
  const backlinkBulkCalls = mode === "full" ? 4 * 0.0205 : 0;
  const raw =
    keywordOverview + pageOneSerps + allintitleSerps + backlinkBulkCalls;
  const seoToolCharge = billingMode === "standard" ? raw * 1.3 : raw * 0.1;
  const totalOutlay =
    billingMode === "standard" ? seoToolCharge : raw + seoToolCharge;
  return {
    raw: Math.round(raw * 100000) / 100000,
    seoToolCharge: Math.round(seoToolCharge * 100000) / 100000,
    totalOutlay: Math.round(totalOutlay * 100000) / 100000,
  };
}
