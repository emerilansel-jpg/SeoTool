import type { SitemapUrl } from "./sitemapTypes";

const MAX_SITEMAP_SIZE = 5 * 1024 * 1024;
const MAX_CHILD_SITEMAPS = 50;
const MAX_URLS_TOTAL = 50000;
const FETCH_TIMEOUT_MS = 15000;

export async function fetchAndParseSitemap(url: string): Promise<{
  urls: SitemapUrl[];
  isSitemapIndex: boolean;
  childSitemaps: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const normalizedUrl = normalizeSitemapUrl(url);

  const { content, error } = await fetchSitemapContent(normalizedUrl);
  if (error || !content) {
    return {
      urls: [],
      isSitemapIndex: false,
      childSitemaps: 0,
      errors: [error ?? "Empty sitemap response"],
    };
  }

  if (isSitemapIndex(content)) {
    const childUrls = extractSitemapIndexUrls(content);
    if (childUrls.length > MAX_CHILD_SITEMAPS) {
      errors.push(
        `Sitemap index contains ${childUrls.length} child sitemaps; only first ${MAX_CHILD_SITEMAPS} will be processed.`,
      );
    }

    const allUrls: SitemapUrl[] = [];
    const toProcess = childUrls.slice(0, MAX_CHILD_SITEMAPS);

    const results = await Promise.allSettled(
      toProcess.map((childUrl) => fetchSitemapContent(childUrl)),
    );

    let processed = 0;
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.content) {
        const childUrlsParsed = parseSitemapUrls(result.value.content);
        allUrls.push(...childUrlsParsed);
        processed++;
      } else if (result.status === "fulfilled" && result.value.error) {
        errors.push(result.value.error);
      } else if (result.status === "rejected") {
        errors.push(`Failed to fetch child sitemap: ${result.reason}`);
      }
    }

    return {
      urls: allUrls.slice(0, MAX_URLS_TOTAL),
      isSitemapIndex: true,
      childSitemaps: processed,
      errors,
    };
  }

  const urls = parseSitemapUrls(content);
  return {
    urls: urls.slice(0, MAX_URLS_TOTAL),
    isSitemapIndex: false,
    childSitemaps: 0,
    errors,
  };
}

function normalizeSitemapUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  if (
    !normalized.includes("/sitemap") &&
    !normalized.endsWith(".xml") &&
    !normalized.endsWith(".xml.gz")
  ) {
    normalized = normalized.replace(/\/$/, "") + "/sitemap.xml";
  }
  return normalized;
}

async function fetchSitemapContent(
  url: string,
): Promise<{ content: string | null; error: string | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SeoTool.im Sitemap Validator/1.0" },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        content: null,
        error: `HTTP ${response.status} fetching ${url}`,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isGzip = url.endsWith(".gz") || contentType.includes("gzip");

    if (isGzip) {
      return {
        content: null,
        error: `Gzip-compressed sitemaps are not supported: ${url}`,
      };
    }

    const text = await response.text();
    if (text.length > MAX_SITEMAP_SIZE) {
      return {
        content: null,
        error: `Sitemap exceeds ${MAX_SITEMAP_SIZE / 1024 / 1024}MB limit: ${url}`,
      };
    }

    return { content: text, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return { content: null, error: `Failed to fetch ${url}: ${message}` };
  }
}

function isSitemapIndex(content: string): boolean {
  return content.includes("<sitemapindex");
}

function extractSitemapIndexUrls(content: string): string[] {
  const urls: string[] = [];
  const regex = /<loc>([\s\S]*?)<\/loc>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const url = match[1].trim();
    if (url) urls.push(url);
  }
  return urls;
}

export function parseSitemapUrls(content: string): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const urlBlockRegex = /<url>([\s\S]*?)<\/url>/gi;
  let blockMatch;

  while ((blockMatch = urlBlockRegex.exec(content)) !== null) {
    const block = blockMatch[1];
    const loc = extractTag(block, "loc");
    if (!loc) continue;

    urls.push({
      loc,
      lastmod: extractTag(block, "lastmod"),
      changefreq: extractTag(block, "changefreq"),
      priority: extractTag(block, "priority")
        ? parseFloat(extractTag(block, "priority")!)
        : null,
    });
  }

  if (urls.length === 0) {
    const locRegex = /<loc>([\s\S]*?)<\/loc>/gi;
    let locMatch;
    while ((locMatch = locRegex.exec(content)) !== null) {
      const loc = locMatch[1].trim();
      if (loc) {
        urls.push({ loc, lastmod: null, changefreq: null, priority: null });
      }
    }
  }

  return urls;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}
