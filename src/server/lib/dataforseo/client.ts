import {
  type CreditFeature,
  mapDataforseoPathToCreditFeature,
} from "@/shared/billing-credit-features";
import { creditFeatureToQuotaFeature } from "@/shared/plans";
import {
  assertUsageCreditsAvailable,
  getOrCreateOrganizationCustomer,
  trackUsageCreditSpend,
} from "@/server/billing/subscription";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { assertFeatureQuota } from "@/server/billing/quota-gate";
// Type-only namespace import: erased at compile, so the section modules (and
// the SDK they pull in) still only load through loadDataforseoSections below.
import type * as sections from "@/server/lib/dataforseo/sections";
import {
  DataforseoChargedTaskError,
  type DataforseoApiCallCost,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { AppError } from "@/server/lib/errors";
import { SEO_DATA_BYOK_FEE_MULTIPLIER } from "@/shared/billing";

export { mapDataforseoPathToCreditFeature };

/** The section-fetcher barrel (sections.ts), as a type for `meter` pickers. */
export type DataforseoSections = typeof sections;

let sectionsPromise: Promise<DataforseoSections> | undefined;

/** Single lazy boundary for the DataForSEO subtree: the section fetchers and
 * the ~3 MB dataforseo-client SDK they statically import stay out of the
 * eager isolate startup graph and load once, on the first API call. */
export function loadDataforseoSections(): Promise<DataforseoSections> {
  return (sectionsPromise ??= import("@/server/lib/dataforseo/sections"));
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

type MeteringOptions = {
  creditFeature?: CreditFeature;
  quotaUnits?: number;
  billingMode?: DataforseoBillingMode;
  skipQuota?: boolean;
};

function meter<I, T>(
  customer: MeteringCustomer,
  pick: (
    sections: DataforseoSections,
  ) => (input: I) => Promise<DataforseoApiResponse<T>>,
  defaultFeature?: CreditFeature,
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
      },
    );
}

export type DataforseoBillingMode = "standard" | "byok";

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
      ),
      questionsAnswers: meter(
        customer,
        (s) => s.fetchQuestionsAnswers,
        "local_seo",
      ),
    },
    backlinks: {
      summary: meter(customer, (s) => s.fetchBacklinksSummary),
      rows: meter(customer, (s) => s.fetchBacklinksRows),
      referringDomains: meter(customer, (s) => s.fetchReferringDomains),
      domainPages: meter(customer, (s) => s.fetchDomainPagesSummary),
      history: meter(customer, (s) => s.fetchBacklinksHistory),
      anchors: meter(customer, (s) => s.fetchAnchors),
      domainIntersection: meter(
        customer,
        (s) => s.fetchBacklinksDomainIntersection,
      ),
      bulkRanks: meter(customer, (s) => s.fetchBacklinksBulkRanks),
      bulkBacklinks: meter(customer, (s) => s.fetchBacklinksBulkBacklinks),
      bulkSpamScores: meter(customer, (s) => s.fetchBacklinksBulkSpamScores),
      bulkReferringDomains: meter(
        customer,
        (s) => s.fetchBacklinksBulkReferringDomains,
      ),
    },
    keywords: {
      related: meter(customer, (s) => s.fetchRelatedKeywords),
      suggestions: meter(customer, (s) => s.fetchKeywordSuggestions),
      ideas: meter(customer, (s) => s.fetchKeywordIdeas),
      // Google Ads endpoints for countries Labs doesn't support.
      adsIdeas: meter(customer, (s) => s.fetchAdsKeywordIdeas),
      adsSearchVolume: meter(customer, (s) => s.fetchAdsSearchVolume),
    },
    domain: {
      rankOverview: meter(customer, (s) => s.fetchDomainRankOverview),
      // domain_* credit features (domain_overview → keyword_search quota) so
      // rank-tracking keyword suggestions don't fall through to site_audit's
      // tiny monthly bucket via the empty-path default.
      rankedKeywords: meter(
        customer,
        (s) => s.fetchRankedKeywords,
        "domain_overview",
      ),
      relevantPages: meter(
        customer,
        (s) => s.fetchRelevantPages,
        "domain_overview",
      ),
    },
    serp: {
      live: meter(customer, (s) => s.fetchLiveSerp),
      competition: meter(
        customer,
        (s) => s.fetchCompetitionSerp,
        "keyword_research",
      ),
      rankCheck: meter(customer, (s) => s.fetchRankCheckSerp, "rank_tracking"),
      // Posts up to 100 queued rank check tasks; one metered charge covers the
      // whole batch (DataForSEO bills task_post at post time, collection is
      // free).
      rankCheckTaskPost: meter(
        customer,
        (s) => s.postRankCheckTasks,
        "rank_tracking",
      ),
      mapsTaskPost: meter(customer, (s) => s.postMapsTasks, "local_map_rank"),
      local: meter(customer, (s) => s.fetchLocalSerp, "local_seo"),
      bingRankCheck: meter(
        customer,
        (s) => s.fetchBingRankCheckSerp,
        "rank_tracking",
      ),
      bingRankCheckTaskPost: meter(
        customer,
        (s) => s.postBingRankCheckTasks,
        "rank_tracking",
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
      ),
      serpCompetitors: meter(customer, (s) => s.fetchSerpCompetitors),
      // Content gap: keywords a competitor ranks for that the project domain
      // does not. Attributed to content_intelligence for spend analytics.
      domainIntersection: meter(
        customer,
        (s) => s.fetchDomainIntersection,
        "content_intelligence",
      ),
    },
    lighthouse: {
      live: meter(customer, (s) => s.fetchLighthouseResult),
    },
    aiSearch: {
      mentionsSearch: meter(customer, (s) => s.fetchLlmMentionsSearch),
      aggregatedMetrics: meter(customer, (s) => s.fetchLlmAggregatedMetrics),
      topPages: meter(customer, (s) => s.fetchLlmTopPages),
      crossAggregatedMetrics: meter(
        customer,
        (s) => s.fetchLlmCrossAggregatedMetrics,
      ),
      llmResponse: meter(customer, (s) => s.fetchLlmResponse),
    },
  } as const;
}

async function meterDataforseoCall<T>(
  customer: BillingCustomerContext,
  execute: () => Promise<DataforseoApiResponse<T>>,
  options: MeteringOptions,
): Promise<T> {
  const {
    creditFeature,
    quotaUnits = 1,
    billingMode = "standard",
    skipQuota = false,
  } = options;
  const isHostedMode = await isHostedServerAuthMode();

  if (!isHostedMode) {
    const result = await execute();
    return result.data;
  }

  const billingCustomer = await getOrCreateOrganizationCustomer(customer);

  // Enforce per-feature quota (tiered plan limits). This throws QUOTA_EXCEEDED
  // or PLAN_LIMIT_REACHED before the API call runs. Only windowed features are
  // gated here — gauge features (projects, rank_tracking count) are checked at
  // creation time in their respective services.
  const creditFeatureForQuota =
    creditFeature ?? mapDataforseoPathToCreditFeature([]);
  const quotaFeature = creditFeatureToQuotaFeature(creditFeatureForQuota);
  if (!skipQuota && quotaFeature && quotaFeature !== "rank_tracking") {
    await assertFeatureQuota(customer.organizationId, quotaFeature, quotaUnits);
  }

  const { monthlyRemaining } = await assertUsageCreditsAvailable(
    billingCustomer.id,
  );

  let result: DataforseoApiResponse<T>;
  try {
    result = await execute();
  } catch (error) {
    if (error instanceof DataforseoChargedTaskError) {
      // A malformed request (DataForSEO "Invalid Field: ...") that DataForSEO
      // did not bill returns no value to the customer, so don't charge — surface
      // it as a non-reportable VALIDATION_ERROR. If DataForSEO still billed us
      // (costUsd > 0), fall through to the normal charge + capture path so the
      // spend stays metered and visible instead of silently eaten.
      if (error.isInvalidField && error.billing.costUsd <= 0) {
        throw new AppError("VALIDATION_ERROR", error.message);
      }
      await trackDataforseoCost({
        customer,
        customerId: billingCustomer.id,
        billing: error.billing,
        monthlyRemaining,
        creditFeature,
        billingMode,
      });
    }
    throw error;
  }

  await trackDataforseoCost({
    customer,
    customerId: billingCustomer.id,
    billing: result.billing,
    monthlyRemaining,
    creditFeature,
    billingMode,
  });

  return result.data;
}

async function trackDataforseoCost(args: {
  customer: BillingCustomerContext;
  customerId: string;
  billing: DataforseoApiCallCost;
  monthlyRemaining: number;
  creditFeature?: CreditFeature;
  billingMode: DataforseoBillingMode;
}) {
  await trackUsageCreditSpend({
    customer: args.customer,
    customerId: args.customerId,
    creditFeature:
      args.creditFeature ?? mapDataforseoPathToCreditFeature(args.billing.path),
    costUsd: args.billing.costUsd,
    monthlyRemaining: args.monthlyRemaining,
    billingMultiplier:
      args.billingMode === "byok" ? SEO_DATA_BYOK_FEE_MULTIPLIER : undefined,
    properties: {
      provider: "dataforseo",
      billing_mode: args.billingMode,
      paths: [args.billing.path.join("/")],
      fromCache: false,
    },
  });
}
