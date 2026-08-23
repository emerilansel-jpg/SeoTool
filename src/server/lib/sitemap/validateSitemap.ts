import type {
  SitemapIssue,
  SitemapUrl,
  ValidationReport,
} from "./sitemapTypes";

const MAX_URLS_SITEMAP = 50000;

export function validateSitemapUrls(
  url: string,
  urls: SitemapUrl[],
  fetchErrors: string[],
  isSitemapIndex: boolean,
  childSitemaps: number,
): ValidationReport {
  const issues: SitemapIssue[] = [];

  for (const error of fetchErrors) {
    issues.push({ severity: "error", message: error });
  }

  if (urls.length === 0 && fetchErrors.length === 0) {
    issues.push({
      severity: "error",
      message: "Sitemap contains no URLs.",
    });
  }

  if (urls.length > MAX_URLS_SITEMAP) {
    issues.push({
      severity: "warning",
      message: `Sitemap contains ${urls.length} URLs, exceeding the ${MAX_URLS_SITEMAP} limit.`,
    });
  }

  const duplicates = findDuplicateUrls(urls);
  if (duplicates.length > 0) {
    issues.push({
      severity: "warning",
      message: `Found ${duplicates.length} duplicate URL(s).`,
      url: duplicates[0],
    });
  }

  const invalidUrls = findInvalidUrls(urls);
  for (const invalid of invalidUrls.slice(0, 5)) {
    issues.push({
      severity: "error",
      message: `Invalid URL format: ${invalid}`,
      url: invalid,
    });
  }
  if (invalidUrls.length > 5) {
    issues.push({
      severity: "error",
      message: `...and ${invalidUrls.length - 5} more invalid URLs.`,
    });
  }

  const badLastmod = findBadLastmod(urls);
  if (badLastmod.length > 0) {
    issues.push({
      severity: "warning",
      message: `Found ${badLastmod.length} URL(s) with invalid lastmod format.`,
    });
  }

  const staleUrls = findStaleUrls(urls);
  if (staleUrls.length > 0) {
    issues.push({
      severity: "info",
      message: `${staleUrls.length} URL(s) have lastmod older than 1 year.`,
    });
  }

  const lowPriority = urls.filter(
    (u) => u.priority !== null && u.priority < 0.3,
  );
  if (lowPriority.length > 0) {
    issues.push({
      severity: "info",
      message: `${lowPriority.length} URL(s) have very low priority (< 0.3).`,
    });
  }

  if (isSitemapIndex) {
    issues.push({
      severity: "info",
      message: `Sitemap index with ${childSitemaps} child sitemap(s).`,
    });
  }

  const uniqueUrls = new Set(urls.map((u) => u.loc));
  const validCount = uniqueUrls.size - invalidUrls.length;

  return {
    url,
    totalUrls: urls.length,
    validUrls: Math.max(0, validCount),
    errorCount: issues.filter((i) => i.severity === "error").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
    infoCount: issues.filter((i) => i.severity === "info").length,
    issues,
    urls,
    isSitemapIndex,
    childSitemaps,
    fetchedAt: new Date().toISOString(),
  };
}

function findDuplicateUrls(urls: SitemapUrl[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const url of urls) {
    if (seen.has(url.loc)) {
      duplicates.push(url.loc);
    } else {
      seen.add(url.loc);
    }
  }
  return duplicates;
}

function findInvalidUrls(urls: SitemapUrl[]): string[] {
  const invalid: string[] = [];
  for (const url of urls) {
    try {
      const parsed = new URL(url.loc);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        invalid.push(url.loc);
      }
    } catch {
      invalid.push(url.loc);
    }
  }
  return invalid;
}

function findBadLastmod(urls: SitemapUrl[]): SitemapUrl[] {
  return urls.filter((url) => {
    if (!url.lastmod) return false;
    const date = new Date(url.lastmod);
    return Number.isNaN(date.getTime());
  });
}

function findStaleUrls(urls: SitemapUrl[]): SitemapUrl[] {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return urls.filter((url) => {
    if (!url.lastmod) return false;
    const date = new Date(url.lastmod);
    return !Number.isNaN(date.getTime()) && date < oneYearAgo;
  });
}
