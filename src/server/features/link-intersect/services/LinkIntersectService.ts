import { waitUntil } from "cloudflare:workers";
import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { normalizeBacklinksTarget } from "@/server/lib/dataforseo";
import type { IntersectItem } from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";
import {
  linkIntersectViewSchema,
  type IntersectDomain,
  type IntersectSummary,
  type LinkIntersectView,
} from "./linkIntersectTypes";

/** Link intersect results are refreshed every 12 hours. */
const LINK_INTERSECT_TTL_SECONDS = 12 * 60 * 60;

/** Max domains returned per request. DataForSEO allows up to 1000. */
const DEFAULT_LIMIT = 100;

function buildSummary(domains: IntersectDomain[]): IntersectSummary {
  if (domains.length === 0) {
    return {
      totalDomains: 0,
      avgRank: null,
      avgBacklinks: null,
      medianBacklinks: null,
    };
  }

  const ranks = domains
    .map((d) => d.rank)
    .filter((r): r is number => r != null);
  const backlinks = domains
    .map((d) => d.backlinks)
    .filter((b): b is number => b != null);

  const avgRank =
    ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : null;
  const avgBacklinks =
    backlinks.length > 0
      ? backlinks.reduce((a, b) => a + b, 0) / backlinks.length
      : null;

  let medianBacklinks: number | null = null;
  if (backlinks.length > 0) {
    const sorted = [...backlinks].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianBacklinks =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
  }

  return {
    totalDomains: domains.length,
    avgRank: avgRank != null ? Math.round(avgRank * 10) / 10 : null,
    avgBacklinks: avgBacklinks != null ? Math.round(avgBacklinks) : null,
    medianBacklinks,
  };
}

/**
 * Transform raw DataForSEO intersection items into our view model.
 * Each item has a `competitors` record keyed by the original competitor domain.
 */
function transformItems(
  items: IntersectItem[],
  competitors: string[],
): IntersectDomain[] {
  return items
    .filter((item) => item.domain != null)
    .map((item) => {
      const competitorEntries: IntersectDomain["competitors"] = {};
      const rawIntersection = item.intersection ?? {};

      for (const comp of competitors) {
        const entry = rawIntersection[comp];
        if (entry) {
          competitorEntries[comp] = {
            rank: entry.rank ?? null,
            backlinks: entry.backlinks ?? null,
            referring_domains: entry.referring_domains ?? null,
            referring_pages: entry.referring_pages ?? null,
            first_seen: entry.first_seen ?? null,
            backlinks_spam_score: entry.backlinks_spam_score ?? null,
          };
        }
      }

      return {
        domain: item.domain!,
        competitors: competitorEntries,
        rank: item.summary_rank ?? null,
        backlinks: item.summary_backlinks ?? null,
      };
    });
}

async function getIntersect(
  input: {
    projectId: string;
    target: string;
    competitors: string[];
    limit?: number;
  },
  billingCustomer: BillingCustomerContext,
): Promise<LinkIntersectView> {
  const normalizedTarget = normalizeBacklinksTarget(input.target, {
    scope: "domain",
  }).apiTarget;

  // Normalize and deduplicate competitors; drop any that equal the target.
  const seen = new Set<string>();
  const competitors: string[] = [];
  for (const raw of input.competitors) {
    const normalized = normalizeBacklinksTarget(raw, {
      scope: "domain",
    }).apiTarget;
    if (normalized !== normalizedTarget && !seen.has(normalized)) {
      seen.add(normalized);
      competitors.push(normalized);
    }
  }

  const emptyView: LinkIntersectView = {
    target: normalizedTarget,
    competitors,
    domains: [],
    summary: buildSummary([]),
    totalCount: null,
    fetchedAt: new Date().toISOString(),
    hasData: false,
  };
  if (competitors.length === 0) return emptyView;

  const cacheKey = await buildCacheKey("backlinks:link-intersect", {
    organizationId: billingCustomer.organizationId,
    projectId: input.projectId,
    target: normalizedTarget,
    competitors,
    limit: input.limit ?? DEFAULT_LIMIT,
  });

  const cachedRaw = await getCached(cacheKey);
  const cached = linkIntersectViewSchema.safeParse(cachedRaw);
  if (cached.success) return cached.data;

  const dataforseo = createDataforseoClient(billingCustomer);

  let result;
  try {
    result = await dataforseo.backlinks.domainIntersection({
      targets: competitors,
      excludeTarget: normalizedTarget,
      limit: input.limit ?? DEFAULT_LIMIT,
      orderBy: ["1.rank,desc"],
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
      throw error;
    }
    throw error;
  }

  const domains = transformItems(result.items, competitors);
  const summary = buildSummary(domains);

  const view: LinkIntersectView = {
    target: normalizedTarget,
    competitors,
    domains,
    summary,
    totalCount: result.totalCount,
    fetchedAt: new Date().toISOString(),
    hasData: domains.length > 0,
  };

  if (view.hasData) {
    waitUntil(
      setCached(cacheKey, view, LINK_INTERSECT_TTL_SECONDS).catch((error) => {
        console.error("link-intersect.cache-write failed:", error);
      }),
    );
  }

  return view;
}

export const LinkIntersectService = {
  getIntersect,
} as const;
