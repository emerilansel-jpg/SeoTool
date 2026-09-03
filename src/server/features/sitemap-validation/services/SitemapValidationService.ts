import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import { fetchAndParseSitemap } from "@/server/lib/sitemap/fetchSitemap";
import { validateSitemapUrls } from "@/server/lib/sitemap/validateSitemap";
import { validationReportSchema } from "@/server/lib/sitemap/sitemapTypes";
import type { ValidationReport } from "@/server/lib/sitemap/sitemapTypes";

const SITEMAP_CACHE_TTL_SECONDS = 60 * 60;

const cachedReportSchema = validationReportSchema;

export async function validateSitemap(
  url: string,
  organizationId: string,
): Promise<ValidationReport> {
  const cacheKey = await buildCacheKey("sitemap:validate", {
    organizationId,
    url,
  });

  const cached = cachedReportSchema.safeParse(await getCached(cacheKey));
  if (cached.success) {
    return cached.data;
  }

  const result = await fetchAndParseSitemap(url);
  const report = validateSitemapUrls(
    url,
    result.urls,
    result.errors,
    result.isSitemapIndex,
    result.childSitemaps,
  );

  const MAX_URLS_IN_REPORT = 100;
  const totalUrls = report.urls.length;
  const truncated = totalUrls > MAX_URLS_IN_REPORT;

  const reportWithUrls = {
    ...report,
    urls: report.urls.slice(0, MAX_URLS_IN_REPORT),
    totalUrls,
    truncated,
  };

  await setCached(cacheKey, reportWithUrls, SITEMAP_CACHE_TTL_SECONDS).catch(
    (error: unknown) => {
      console.error("sitemap.cache-write failed:", error);
    },
  );

  return reportWithUrls;
}
