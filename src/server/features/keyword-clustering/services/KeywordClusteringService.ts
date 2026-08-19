import { z } from "zod";
import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { clusterKeywords, extractSerpDomains } from "./clusteringEngine";
import { clusteringResultSchema } from "./clusteringTypes";
import type { ClusteringViewData } from "./clusteringTypes";

const CLUSTERING_CACHE_TTL = 24 * 60 * 60;
const MAX_KEYWORDS = 20;

const cachedSchema = clusteringResultSchema;

export async function getKeywordClusters(
  keywords: string[],
  locationCode: number,
  languageCode: string,
  billingCustomer: BillingCustomerContext,
  threshold?: number,
): Promise<ClusteringViewData> {
  const limited = keywords
    .slice(0, MAX_KEYWORDS)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const sorted = [...limited].sort();

  const cacheKey = await buildCacheKey("keyword-clustering", {
    organizationId: billingCustomer.organizationId,
    keywords: sorted,
    locationCode,
    languageCode,
    threshold: threshold ?? 0.3,
  });

  const cached = cachedSchema.safeParse(await getCached(cacheKey));
  if (cached.success) return cached.data;

  const dataforseo = createDataforseoClient(billingCustomer);
  const keywordDomains = new Map<string, string[]>();

  const results = await Promise.allSettled(
    limited.map(async (keyword) => {
      try {
        const serp = await dataforseo.serp.live({
          keyword,
          locationCode,
          languageCode,
        });
        const domains = extractSerpDomains(serp);
        return { keyword, domains };
      } catch {
        return { keyword, domains: [] };
      }
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.domains.length > 0) {
      keywordDomains.set(result.value.keyword, result.value.domains);
    }
  }

  const result = clusterKeywords(keywordDomains, threshold);
  const view: ClusteringViewData = {
    ...result,
    fetchedAt: new Date().toISOString(),
  };

  await setCached(cacheKey, view, CLUSTERING_CACHE_TTL).catch((err: unknown) =>
    console.error("clustering.cache-write failed:", err),
  );

  return view;
}
