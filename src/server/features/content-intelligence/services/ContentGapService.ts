import { waitUntil } from "cloudflare:workers";
import { z } from "zod";
import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import type { CreditFeature } from "@/shared/billing-credit-features";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { normalizeDomainInput } from "@/server/lib/domainUtils";
import {
  buildContentGap,
  summarizeGap,
  type ContentGapView,
} from "@/server/features/content-intelligence/contentGap";

// Lets a caller attribute spend to its own feature (e.g. onboarding). Applied
// to the DataForSEO call, not the cache key, so cached results are shared
// across callers — mirrors DomainService.
type MeteringOverrides = {
  creditFeature?: CreditFeature;
};

/** Content-gap results are refreshed every 12 hours. */
const CONTENT_GAP_TTL_SECONDS = 12 * 60 * 60;

/** Max keywords requested per competitor. Caps per-call cost; DataForSEO Labs
 *  domain intersection accepts up to 1000. */
const KEYWORDS_PER_COMPETITOR = 300;

// Cache validation schema — guards against schema drift between write and read.
const gapCompetitorRankingSchema = z.object({
  competitor: z.string(),
  position: z.number().nullable(),
  url: z.string().nullable(),
  relativeUrl: z.string().nullable(),
  traffic: z.number().nullable(),
});

const gapKeywordSchema = z.object({
  keyword: z.string(),
  searchVolume: z.number().nullable(),
  keywordDifficulty: z.number().nullable(),
  cpc: z.number().nullable(),
  competitors: z.array(gapCompetitorRankingSchema),
});

const gapTopicSchema = z.object({
  topic: z.string(),
  keywordCount: z.number(),
  totalVolume: z.number(),
  keywords: z.array(z.string()),
});

const contentGapSummarySchema = z.object({
  totalKeywords: z.number(),
  totalVolume: z.number(),
  averageDifficulty: z.number().nullable(),
  averageCompetitorOverlap: z.number(),
  topTopic: z.string().nullable(),
});

const contentGapViewSchema = z.object({
  keywords: z.array(gapKeywordSchema),
  topics: z.array(gapTopicSchema),
  summary: contentGapSummarySchema,
  domain: z.string(),
  competitors: z.array(z.string()),
  locationCode: z.number(),
  languageCode: z.string(),
  fetchedAt: z.string(),
  hasData: z.boolean(),
});

async function getGap(
  input: {
    projectId: string;
    domain: string;
    competitors: string[];
    locationCode: number;
    languageCode: string;
  },
  billingCustomer: BillingCustomerContext,
  metering: MeteringOverrides = {},
): Promise<ContentGapView> {
  const selfDomain = normalizeDomainInput(input.domain, true);
  // Normalize competitors and drop any that equal the project's own domain —
  // a self-vs-self intersection never yields a gap.
  const competitors = input.competitors
    .map((c) => normalizeDomainInput(c, true))
    .filter((c) => c !== selfDomain);

  const emptyView: ContentGapView = {
    keywords: [],
    topics: [],
    summary: summarizeGap([], []),
    domain: selfDomain,
    competitors,
    locationCode: input.locationCode,
    languageCode: input.languageCode,
    fetchedAt: new Date().toISOString(),
    hasData: false,
  };
  if (competitors.length === 0) return emptyView;

  const cacheKey = await buildCacheKey("content:gap", {
    organizationId: billingCustomer.organizationId,
    projectId: input.projectId,
    domain: selfDomain,
    competitors,
    locationCode: input.locationCode,
    languageCode: input.languageCode,
  });

  const cachedRaw = await getCached(cacheKey);
  const cached = contentGapViewSchema.safeParse(cachedRaw);
  if (cached.success) return cached.data;

  const dataforseo = createDataforseoClient(billingCustomer);

  // One metered intersection call per competitor; Promise.all preserves input
  // order so competitor rankings stay deterministic. A credit/transport error
  // propagates so the UI can surface it; a competitor that returns no organic
  // overlap simply contributes zero items.
  const perCompetitor = await Promise.all(
    competitors.map(async (competitor) => {
      const items = await dataforseo.labs.domainIntersection({
        target1: competitor,
        target2: selfDomain,
        locationCode: input.locationCode,
        languageCode: input.languageCode,
        limit: KEYWORDS_PER_COMPETITOR,
        includeSubdomains: true,
        ...metering,
      });
      return { competitor, items };
    }),
  );

  const result = buildContentGap(perCompetitor);
  const view: ContentGapView = {
    ...result,
    domain: selfDomain,
    competitors,
    locationCode: input.locationCode,
    languageCode: input.languageCode,
    fetchedAt: new Date().toISOString(),
    hasData: result.keywords.length > 0,
  };

  if (view.hasData) {
    // waitUntil, not void: workerd cancels unregistered pending I/O once the
    // response is sent, so a fire-and-forget put never persists the cache.
    waitUntil(
      setCached(cacheKey, view, CONTENT_GAP_TTL_SECONDS).catch((error) => {
        console.error("content-gap.cache-write failed:", error);
      }),
    );
  }

  return view;
}

export const ContentGapService = {
  getGap,
} as const;
