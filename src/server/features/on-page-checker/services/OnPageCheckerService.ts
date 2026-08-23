import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import { analyzeOnPage } from "./onPageAnalysis";
import { onPageReportSchema } from "./onPageTypes";
import type { OnPageReport } from "./onPageTypes";

const ON_PAGE_CACHE_TTL_SECONDS = 6 * 60 * 60;
const FETCH_TIMEOUT_MS = 15000;
const MAX_HTML_SIZE = 2 * 1024 * 1024;

const cachedReportSchema = onPageReportSchema;

export async function checkOnPageSeo(
  url: string,
  organizationId: string,
): Promise<OnPageReport> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const cacheKey = await buildCacheKey("on-page:check", {
    organizationId,
    url: normalizedUrl,
  });

  const cached = cachedReportSchema.safeParse(await getCached(cacheKey));
  if (cached.success) {
    return cached.data;
  }

  const { html, statusCode, responseTimeMs, error } =
    await fetchPage(normalizedUrl);

  if (error) {
    return {
      url: normalizedUrl,
      statusCode,
      overallScore: 0,
      grade: "F",
      title: null,
      metaDescription: null,
      wordCount: null,
      categories: [],
      issues: [{ category: "technical", severity: "error", message: error }],
      fetchedAt: new Date().toISOString(),
    };
  }

  const analysis = await analyzeHtml(
    normalizedUrl,
    html,
    statusCode,
    responseTimeMs,
  );

  await setCached(cacheKey, analysis, ON_PAGE_CACHE_TTL_SECONDS).catch(
    (err: unknown) => {
      console.error("on-page.cache-write failed:", err);
    },
  );

  return analysis;
}

async function fetchPage(url: string): Promise<{
  html: string;
  statusCode: number;
  responseTimeMs: number;
  error: string | null;
}> {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SeoTool.im On-Page Checker/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;

    if (!response.ok && response.status >= 400) {
      return {
        html: "",
        statusCode: response.status,
        responseTimeMs,
        error: `HTTP ${response.status} fetching ${url}`,
      };
    }

    const text = await response.text();
    const html = text.slice(0, MAX_HTML_SIZE);

    return { html, statusCode: response.status, responseTimeMs, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return {
      html: "",
      statusCode: 0,
      responseTimeMs: 0,
      error: `Failed to fetch ${url}: ${message}`,
    };
  }
}

async function analyzeHtml(
  url: string,
  html: string,
  statusCode: number,
  responseTimeMs: number,
): Promise<OnPageReport> {
  const { analyzeHtml: pageAnalyzeHtml } =
    await import("@/server/lib/audit/page-analyzer");

  const result = pageAnalyzeHtml(html, url, statusCode, responseTimeMs);

  return analyzeOnPage({
    url,
    statusCode,
    title: result.title || null,
    metaDescription: result.metaDescription || null,
    h1: result.h1s,
    headings: result.headingOrder,
    images: result.images.map((img) => ({
      src: img.src ?? "",
      alt: img.alt,
    })),
    links: result.links.map((link) => ({
      targetUrl: link.targetUrl,
      anchor: link.anchor,
      isInternal: link.isInternal,
      isNofollow: link.isNofollow,
    })),
    wordCount: result.wordCount,
    hasStructuredData: result.hasStructuredData,
    canonical: result.canonical,
    robotsMeta: result.robotsMeta,
    responseTimeMs,
  });
}
