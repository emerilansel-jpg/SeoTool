import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import { normalizeBacklinksTarget } from "@/server/lib/dataforseo";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import { backlinksOverviewSchema } from "./backlinksOverviewSchema";
import { buildOpenPageRankOverview } from "./openPageRankOverview";

const providerRowSchema = z
  .object({
    domain: z.string().optional(),
    found: z.boolean().optional(),
    open_page_rank: z.number().nullable().optional(),
    page_rank_decimal: z.number().nullable().optional(),
    page_rank_integer: z.number().nullable().optional(),
    rank: z.union([z.number(), z.string()]).nullable().optional(),
    referring_domains: z.number().nullable().optional(),
  })
  .passthrough();

const responseSchema = z
  .object({
    data: z.array(providerRowSchema).optional(),
    results: z.array(providerRowSchema).optional(),
    response: z.array(providerRowSchema).optional(),
  })
  .passthrough();

function firstRow(value: unknown) {
  const parsed = responseSchema.safeParse(value);
  if (!parsed.success) return null;
  return (
    parsed.data.data?.[0] ??
    parsed.data.results?.[0] ??
    parsed.data.response?.[0] ??
    null
  );
}

async function fetchProvider(domain: string, apiKey: string) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "API-OPR": apiKey,
  };
  const modern = await fetch(
    "https://openpagerank.keywordseverywhere.com/v1/domains/bulk",
    {
      method: "POST",
      headers,
      // Basic Snapshot only uses current aggregates. Disabling the provider's
      // default full history keeps the response small and avoids wasted work.
      body: JSON.stringify({ domains: [domain], include_history: false }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (modern.ok) return firstRow(await modern.json());

  // Compatibility with the provider's original endpoint while accounts are
  // migrated to the bulk API.
  if (modern.status === 404 || modern.status === 405) {
    const legacyUrl = new URL("https://openpagerank.com/api/v1.0/getPageRank");
    legacyUrl.searchParams.append("domains[]", domain);
    const legacy = await fetch(legacyUrl, {
      headers: { "API-OPR": apiKey },
      signal: AbortSignal.timeout(15_000),
    });
    if (legacy.ok) return firstRow(await legacy.json());
  }
  throw new AppError(
    "UPSTREAM_UNAVAILABLE",
    `OpenPageRank could not load this domain (HTTP ${modern.status}).`,
  );
}

export const OpenPageRankBacklinksService = {
  // OpenPageRank's Basic provider is domain-only. Exact-page research remains
  // available in the metered DataForSEO modes.
  async profileOverview(input: { target: string }) {
    const normalized = normalizeBacklinksTarget(input.target, {
      scope: "domain",
    });
    const cacheKey = await buildCacheKey("backlinks:basic-overview", {
      target: normalized.apiTarget,
      provider: "openpagerank",
    });
    const cached = backlinksOverviewSchema.safeParse(await getCached(cacheKey));
    if (cached.success) return { overview: cached.data };

    const apiKey = await getOptionalEnvValue("OPENPAGERANK_API_KEY");
    if (!apiKey) {
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        "Basic backlink snapshot is not configured. Add OPENPAGERANK_API_KEY in Admin → API Keys.",
      );
    }
    const row = await fetchProvider(normalized.apiTarget, apiKey);
    const overview = buildOpenPageRankOverview(normalized.displayTarget, row);
    await setCached(cacheKey, overview, 24 * 60 * 60).catch(() => undefined);
    return { overview };
  },
};
