import {
  type CreditFeature,
  mapDataforseoPathToCreditFeature,
} from "@/shared/billing-credit-features";
import type { BillingCustomerContext } from "@/server/billing/subscription";
// Type-only namespace import: erased at compile, so the section modules (and
// the SDK they pull in) still only load through loadDataforseoSections below.
import type * as sections from "@/server/lib/dataforseo/sections";
import type { DataforseoApiResponse } from "@/server/lib/dataforseo/envelope";
import type { DataforseoCostProfile } from "@/server/lib/dataforseo/cost-ceiling";
import {
  meterDataforseoCall,
  type DataforseoBillingMode,
} from "@/server/lib/dataforseo/metering";

export { mapDataforseoPathToCreditFeature };

/** The section-fetcher barrel (sections.ts), as a type for `meter` pickers. */
export type DataforseoSections = typeof sections;

let loadedSections: DataforseoSections | undefined;

/** Single lazy boundary for the DataForSEO subtree: the section fetchers and
 * the ~3 MB dataforseo-client SDK they statically import stay out of the
 * eager isolate startup graph and load once, on the first API call. */
export async function loadDataforseoSections(): Promise<DataforseoSections> {
  if (loadedSections) return loadedSections;

  // Do not retain an in-flight Promise at module scope. Cloudflare associates
  // Promises with the request that created them, so another request awaiting
  // the same Promise can fail with "Cannot perform I/O on behalf of a
  // different request". The resolved module namespace is safe to reuse.
  const sections = await import("@/server/lib/dataforseo/sections");
  loadedSections = sections;
  return sections;
}

/**
 * Wraps a section fetcher with billing metering. Each entry on the client is
 * `meter(customer, (s) => s.fetchX, defaultFeature?)`, which returns a function
 * with the fetcher's own input type and resolves to its unwrapped `.data`. The
 * picker indirection (rather than the fetcher itself) keeps the section
 * modules behind loadDataforseoSections.
 *
 * `defaultFeature` is the fallback credit feature; a caller can override it per
 * call by passing `creditFeature` in the input (e.g. an MCP tool attributing
 * spend to its own feature). The extra field is ignored by the fetchers, which
 * read named fields rather than spreading the input.
 */
type MeteringCustomer = BillingCustomerContext & {
  dataforseoBillingMode?: DataforseoBillingMode;
  dataforseoApiKey?: string;
  dataforseoSkipQuota?: boolean;
};

function meter<I, T>(
  customer: MeteringCustomer,
  pick: (
    sections: DataforseoSections,
  ) => (input: I) => Promise<DataforseoApiResponse<T>>,
  defaultFeature?: CreditFeature,
  costProfile: DataforseoCostProfile = "serp-live",
): (
  input: I & { creditFeature?: CreditFeature; quotaUnits?: number },
) => Promise<T> {
  return (input) =>
    meterDataforseoCall(
      customer,
      async () =>
        pick(await loadDataforseoSections())(
          customer.dataforseoApiKey
            ? { ...input, apiKey: customer.dataforseoApiKey }
            : input,
        ),
      {
        creditFeature: input.creditFeature ?? defaultFeature,
        quotaUnits: input.quotaUnits,
        billingMode: customer.dataforseoBillingMode,
        skipQuota: customer.dataforseoSkipQuota,
        costProfile,
        request: input,
      },
    );
}

export type { DataforseoBillingMode } from "@/server/lib/dataforseo/metering";

export type DataforseoClientOptions = {
  billingMode?: DataforseoBillingMode;
  /** Base64-encoded DataForSEO login:password. Kept request-scoped only. */
  apiKey?: string;
  /** Credit-metered add-ons can own their access gate independently of the
   * base-plan daily feature quota. */
  skipQuota?: boolean;
};

export function createDataforseoClient(
  customerInput: BillingCustomerContext,
  options?: DataforseoClientOptions,
) {
  const customer: MeteringCustomer = {
    ...customerInput,
    dataforseoBillingMode: options?.billingMode,
    dataforseoApiKey: options?.apiKey,
    dataforseoSkipQuota: options?.skipQuota,
  };
  return {
    business: {
      businessListings: meter(
        customer,
        (s) => s.fetchBusinessListingsSearch,
        "local_seo",
        "business-list",
      ),
      questionsAnswers: meter(
        customer,
        (s) => s.fetchQuestionsAnswers,
        "local_seo",
        "business-depth",
      ),
    },
    backlinks: {
      summary: meter(
        customer,
        (s) => s.fetchBacklinksSummary,
        undefined,
        "backlinks-summary",
      ),
      rows: meter(
        customer,
        (s) => s.fetchBacklinksRows,
        undefined,
        "backlinks-list",
      ),
      referringDomains: meter(
        customer,
        (s) => s.fetchReferringDomains,
        undefined,
        "backlinks-list",
      ),
      domainPages: meter(
        customer,
        (s) => s.fetchDomainPagesSummary,
        undefined,
        "backlinks-list",
      ),
      history: meter(
        customer,
        (s) => s.fetchBacklinksHistory,
        undefined,
        "backlinks-list",
      ),
      anchors: meter(
        customer,
        (s) => s.fetchAnchors,
        undefined,
        "backlinks-list",
      ),
      domainIntersection: meter(
        customer,
        (s) => s.fetchBacklinksDomainIntersection,
        undefined,
        "backlinks-list",
      ),
      bulkRanks: meter(
        customer,
        (s) => s.fetchBacklinksBulkRanks,
        undefined,
        "backlinks-bulk",
      ),
      bulkBacklinks: meter(
        customer,
        (s) => s.fetchBacklinksBulkBacklinks,
        undefined,
        "backlinks-bulk",
      ),
      bulkSpamScores: meter(
        customer,
        (s) => s.fetchBacklinksBulkSpamScores,
        undefined,
        "backlinks-bulk",
      ),
      bulkReferringDomains: meter(
        customer,
        (s) => s.fetchBacklinksBulkReferringDomains,
        undefined,
        "backlinks-bulk",
      ),
    },
    keywords: {
      related: meter(
        customer,
        (s) => s.fetchRelatedKeywords,
        undefined,
        "labs-list",
      ),
      suggestions: meter(
        customer,
        (s) => s.fetchKeywordSuggestions,
        undefined,
        "labs-list",
      ),
      ideas: meter(
        customer,
        (s) => s.fetchKeywordIdeas,
        undefined,
        "labs-list",
      ),
      // Google Ads endpoints for countries Labs doesn't support.
      adsIdeas: meter(
        customer,
        (s) => s.fetchAdsKeywordIdeas,
        undefined,
        "google-ads",
      ),
      adsSearchVolume: meter(
        customer,
        (s) => s.fetchAdsSearchVolume,
        undefined,
        "google-ads",
      ),
    },
    domain: {
      rankOverview: meter(
        customer,
        (s) => s.fetchDomainRankOverview,
        undefined,
        "labs-list",
      ),
      // domain_* credit features (domain_overview → keyword_search quota) so
      // rank-tracking keyword suggestions don't fall through to site_audit's
      // tiny monthly bucket via the empty-path default.
      rankedKeywords: meter(
        customer,
        (s) => s.fetchRankedKeywords,
        "domain_overview",
        "labs-list",
      ),
      relevantPages: meter(
        customer,
        (s) => s.fetchRelevantPages,
        "domain_overview",
        "labs-list",
      ),
    },
    serp: {
      live: meter(customer, (s) => s.fetchLiveSerp, undefined, "serp-live"),
      competition: meter(
        customer,
        (s) => s.fetchCompetitionSerp,
        "keyword_research",
        "serp-live",
      ),
      rankCheck: meter(
        customer,
        (s) => s.fetchRankCheckSerp,
        "rank_tracking",
        "serp-live",
      ),
      // Posts up to 100 queued rank check tasks; one metered charge covers the
      // whole batch (DataForSEO bills task_post at post time, collection is
      // free).
      rankCheckTaskPost: meter(
        customer,
        (s) => s.postRankCheckTasks,
        "rank_tracking",
        "serp-task-batch",
      ),
      mapsTaskPost: meter(
        customer,
        (s) => s.postMapsTasks,
        "local_map_rank",
        "serp-task-batch",
      ),
      local: meter(customer, (s) => s.fetchLocalSerp, "local_seo", "serp-live"),
      bingRankCheck: meter(
        customer,
        (s) => s.fetchBingRankCheckSerp,
        "rank_tracking",
        "serp-live",
      ),
      bingRankCheckTaskPost: meter(
        customer,
        (s) => s.postBingRankCheckTasks,
        "rank_tracking",
        "serp-task-batch",
      ),
    },
    labs: {
      // Callers (e.g. the keyword-metrics MCP tool) can attribute the spend to
      // their own feature by passing `creditFeature` in the input; defaults to
      // rank_tracking when omitted.
      keywordOverview: meter(
        customer,
        (s) => s.fetchKeywordOverview,
        "rank_tracking",
        "labs-keywords",
      ),
      serpCompetitors: meter(
        customer,
        (s) => s.fetchSerpCompetitors,
        undefined,
        "labs-list",
      ),
      // Content gap: keywords a competitor ranks for that the project domain
      // does not. Attributed to content_intelligence for spend analytics.
      domainIntersection: meter(
        customer,
        (s) => s.fetchDomainIntersection,
        "content_intelligence",
        "labs-list",
      ),
    },
    lighthouse: {
      live: meter(
        customer,
        (s) => s.fetchLighthouseResult,
        undefined,
        "lighthouse",
      ),
    },
    aiSearch: {
      mentionsSearch: meter(
        customer,
        (s) => s.fetchLlmMentionsSearch,
        undefined,
        "ai-mentions",
      ),
      aggregatedMetrics: meter(
        customer,
        (s) => s.fetchLlmAggregatedMetrics,
        undefined,
        "ai-mentions",
      ),
      topPages: meter(
        customer,
        (s) => s.fetchLlmTopPages,
        undefined,
        "ai-mentions",
      ),
      crossAggregatedMetrics: meter(
        customer,
        (s) => s.fetchLlmCrossAggregatedMetrics,
        undefined,
        "ai-mentions",
      ),
      llmResponse: meter(
        customer,
        (s) => s.fetchLlmResponse,
        undefined,
        "ai-llm-response",
      ),
    },
  } as const;
}
