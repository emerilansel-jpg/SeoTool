import type { BillingCustomerContext } from "@/server/billing/subscription";
import { createDataforseoClient } from "@/server/lib/dataforseo/client";
import type { SerpLiveItem } from "@/server/lib/dataforseo/serp";
import {
  calculateContentScore,
  calculateKgr,
  calculateLinkScore,
  calculateTotalScore,
  estimateKeywordResearchProCost,
  median,
  opportunityLabel,
  titleContainsKeyword,
  type KeywordResearchProCompetitor,
  type KeywordResearchProResult,
} from "@/shared/keyword-research-pro";
import type { ResolvedKeywordResearchProInput } from "@/types/schemas/keyword-research-pro";

const WEAK_CONTENT_DOMAINS = new Set([
  "reddit.com",
  "quora.com",
  "medium.com",
  "pinterest.com",
  "facebook.com",
  "linkedin.com",
  "youtube.com",
  "tripadvisor.com",
]);

type SerpResearch = {
  keyword: string;
  items: SerpLiveItem[];
  allintitleCount: number | null;
};

type MetricItem = { target: string; [key: string]: unknown };

function normalizeCredential(value: string | undefined) {
  if (!value) return undefined;
  return value.includes(":") ? btoa(value) : value;
}

function targetKey(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase().replace(/\/$/, "") ?? "";
}

function organicTopTen(items: SerpLiveItem[]) {
  return items.filter((item) => item.type === "organic").slice(0, 10);
}

function normalizedDomain(value: string | null | undefined) {
  return targetKey(value).replace(/^www\./, "");
}

function isWeakContentDomain(domain: string | null | undefined) {
  const normalized = normalizedDomain(domain);
  return [...WEAK_CONTENT_DOMAINS].some(
    (candidate) =>
      normalized === candidate || normalized.endsWith(`.${candidate}`),
  );
}

function metricMap<T extends MetricItem>(items: T[]) {
  return new Map(items.map((item) => [targetKey(item.target), item]));
}

function numberMetric(item: MetricItem | undefined, key: string) {
  const value = item?.[key];
  return typeof value === "number" ? value : null;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  execute: (value: T) => Promise<R>,
) {
  const results: R[] = [];
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await execute(values[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker()),
  );
  return results;
}

function buildBasicCompetitors(
  keyword: string,
  items: SerpLiveItem[],
): KeywordResearchProCompetitor[] {
  return organicTopTen(items).map((item, index) => {
    const exactTitleMatch = titleContainsKeyword(item.title ?? null, keyword);
    return {
      position: item.rank_group ?? item.rank_absolute ?? index + 1,
      title: item.title ?? null,
      url: item.url ?? null,
      domain: item.domain ?? null,
      exactTitleMatch,
      pageRank: null,
      domainRank: null,
      backlinks: null,
      referringDomains: null,
      spamScore: null,
      trustProxy: null,
      isWeak: !exactTitleMatch || isWeakContentDomain(item.domain),
    };
  });
}

function enrichCompetitors(
  competitors: KeywordResearchProCompetitor[],
  ranks: Map<string, MetricItem>,
  backlinks: Map<string, MetricItem>,
  spamScores: Map<string, MetricItem>,
  referringDomains: Map<string, MetricItem>,
) {
  return competitors.map((competitor) => {
    const urlKey = targetKey(competitor.url);
    const domainKey = normalizedDomain(competitor.domain);
    const pageRank = numberMetric(ranks.get(urlKey), "rank");
    const domainRank = numberMetric(ranks.get(domainKey), "rank");
    const backlinksCount = numberMetric(backlinks.get(urlKey), "backlinks");
    const referringDomainCount = numberMetric(
      referringDomains.get(urlKey),
      "referring_domains",
    );
    const spamScore = numberMetric(spamScores.get(urlKey), "spam_score");
    const trustProxy =
      domainRank == null
        ? null
        : Math.round(domainRank * (1 - Math.min(100, spamScore ?? 0) / 100));
    const hasWeakLinks =
      (pageRank != null && pageRank <= 20) ||
      (domainRank != null && domainRank <= 30) ||
      (referringDomainCount != null && referringDomainCount <= 10);
    return {
      ...competitor,
      pageRank,
      domainRank,
      backlinks: backlinksCount,
      referringDomains: referringDomainCount,
      spamScore,
      trustProxy,
      // High-spam pages are not treated as legitimate weak competitors.
      isWeak: competitor.isWeak || (hasWeakLinks && (spamScore ?? 0) <= 50),
    };
  });
}

export const KeywordResearchProService = {
  async research(
    input: ResolvedKeywordResearchProInput,
    customer: BillingCustomerContext,
  ): Promise<KeywordResearchProResult> {
    const apiKey = normalizeCredential(input.byokCredential);
    const client = createDataforseoClient(customer, {
      billingMode: input.billingMode,
      apiKey,
      skipQuota: true,
    });
    const creditFeature = "keyword_research" as const;
    const keywordOverview = await client.labs.keywordOverview({
      keywords: input.keywords,
      locationCode: input.locationCode,
      languageCode: input.languageCode,
      includeSerpInfo: true,
      creditFeature,
      quotaUnits: input.keywords.length,
    });

    const serpResearch = await mapWithConcurrency(
      input.keywords,
      3,
      async (keyword): Promise<SerpResearch> => {
        const [serp, allintitle] = await Promise.all([
          client.serp.competition({
            keyword,
            locationCode: input.locationCode,
            languageCode: input.languageCode,
            creditFeature,
          }),
          client.serp.competition({
            keyword: `allintitle:"${keyword.replaceAll('"', "")}"`,
            locationCode: input.locationCode,
            languageCode: input.languageCode,
            creditFeature,
          }),
        ]);
        return {
          keyword,
          items: serp.items,
          allintitleCount: allintitle.seResultsCount,
        };
      },
    );

    const basicByKeyword = new Map(
      serpResearch.map((entry) => [
        entry.keyword.toLocaleLowerCase(),
        {
          ...entry,
          competitors: buildBasicCompetitors(entry.keyword, entry.items),
        },
      ]),
    );

    let ranks = new Map<string, MetricItem>();
    let backlinks = new Map<string, MetricItem>();
    let spamScores = new Map<string, MetricItem>();
    let referringDomains = new Map<string, MetricItem>();

    if (input.mode === "full") {
      const competitors = [...basicByKeyword.values()].flatMap(
        (entry) => entry.competitors,
      );
      const urls = [
        ...new Set(
          competitors
            .map((competitor) => competitor.url)
            .filter((value): value is string => Boolean(value)),
        ),
      ];
      const domains = [
        ...new Set(
          competitors
            .map((competitor) => normalizedDomain(competitor.domain))
            .filter(Boolean),
        ),
      ];
      if (urls.length > 0) {
        ranks = metricMap(
          await client.backlinks.bulkRanks({
            targets: [...urls, ...domains],
            creditFeature,
          }),
        );
        backlinks = metricMap(
          await client.backlinks.bulkBacklinks({
            targets: urls,
            creditFeature,
          }),
        );
        spamScores = metricMap(
          await client.backlinks.bulkSpamScores({
            targets: urls,
            creditFeature,
          }),
        );
        referringDomains = metricMap(
          await client.backlinks.bulkReferringDomains({
            targets: urls,
            creditFeature,
          }),
        );
      }
    }

    const overviewByKeyword = new Map(
      keywordOverview.map((item) => [item.keyword?.toLocaleLowerCase(), item]),
    );
    const rows = input.keywords.map((keyword) => {
      const overview = overviewByKeyword.get(keyword.toLocaleLowerCase());
      const serp = basicByKeyword.get(keyword.toLocaleLowerCase());
      const searchVolume = overview?.keyword_info?.search_volume ?? null;
      const allintitleCount = serp?.allintitleCount ?? null;
      const kgr = calculateKgr(allintitleCount, searchVolume);
      const competitors =
        input.mode === "full"
          ? enrichCompetitors(
              serp?.competitors ?? [],
              ranks,
              backlinks,
              spamScores,
              referringDomains,
            )
          : (serp?.competitors ?? []);
      const titleMatches = competitors.filter(
        (competitor) => competitor.exactTitleMatch,
      ).length;
      const weakSerpCount = competitors.filter(
        (competitor) => competitor.isWeak,
      ).length;
      const keywordDifficulty =
        overview?.keyword_properties?.keyword_difficulty ?? null;
      const contentScore = calculateContentScore({
        kgr,
        titleMatches,
        weakSerpCount,
        keywordDifficulty,
      });
      const medianPageRank = median(
        competitors.map((competitor) => competitor.pageRank),
      );
      const medianDomainRank = median(
        competitors.map((competitor) => competitor.domainRank),
      );
      const medianReferringDomains = median(
        competitors.map((competitor) => competitor.referringDomains),
      );
      const medianSpamScore = median(
        competitors.map((competitor) => competitor.spamScore),
      );
      const linkScore =
        input.mode === "full"
          ? calculateLinkScore({
              medianPageRank,
              medianDomainRank,
              medianReferringDomains,
              weakSerpCount,
              medianSpamScore,
            })
          : null;
      const totalScore = calculateTotalScore(contentScore, linkScore);
      return {
        keyword,
        searchVolume,
        cpc: overview?.keyword_info?.cpc ?? null,
        keywordDifficulty,
        intent: overview?.search_intent_info?.main_intent ?? null,
        allintitleCount,
        kgr,
        titleMatches,
        weakSerpCount,
        contentScore,
        linkScore,
        totalScore,
        opportunity: opportunityLabel(totalScore),
        medianPageRank,
        medianDomainRank,
        medianReferringDomains,
        medianSpamScore,
        competitors,
      };
    });
    const costs = estimateKeywordResearchProCost(
      input.keywords.length,
      input.mode,
      input.billingMode,
    );
    return {
      mode: input.mode,
      billingMode: input.billingMode,
      rows: rows.toSorted((left, right) => right.totalScore - left.totalScore),
      estimatedRawCostUsd: costs.raw,
      estimatedSeoToolChargeUsd: costs.seoToolCharge,
      estimatedTotalOutlayUsd: costs.totalOutlay,
      methodologyVersion: "krp-v1",
    };
  },
};
