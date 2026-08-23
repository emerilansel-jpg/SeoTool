import type {
  AccessLogEntry,
  BotType,
  CrawlBudgetReport,
  TopCrawledUrl,
} from "./logParserTypes";

const APACHE_COMBINED_REGEX =
  /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d{3}) (\d+|-) "([^"]*)" "([^"]*)"/;

const NGINX_DEFAULT_REGEX =
  /^(\S+) - \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d{3}) (\d+|-) "([^"]*)" "([^"]*)"/;

const DEFAULT_BOT_PATTERNS = [
  "googlebot",
  "bingbot",
  "yandexbot",
  "baiduspider",
  "duckduckbot",
  "slurp",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "petalbot",
  "bytespider",
  "gptbot",
  "chatgpt-user",
  "ccbot",
  "anthropic-ai",
  "claudebot",
];

export function parseAccessLogLines(lines: string[]): AccessLogEntry[] {
  const entries: AccessLogEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match =
      APACHE_COMBINED_REGEX.exec(trimmed) ?? NGINX_DEFAULT_REGEX.exec(trimmed);

    if (match) {
      entries.push({
        ip: match[1],
        timestamp: match[2],
        method: match[3],
        url: match[4],
        statusCode: parseInt(match[5], 10),
        responseSize: match[6] === "-" ? 0 : parseInt(match[6], 10),
        userAgent: match[8],
        referer: match[7],
      });
    }
  }

  return entries;
}

export function filterBotTraffic(
  entries: AccessLogEntry[],
  botPatterns?: string[],
): AccessLogEntry[] {
  const patterns = (botPatterns ?? DEFAULT_BOT_PATTERNS).map((p) =>
    p.toLowerCase(),
  );

  return entries.filter((entry) => {
    const ua = entry.userAgent.toLowerCase();
    return patterns.some((pattern) => ua.includes(pattern));
  });
}

export function analyzeCrawlBudget(
  botEntries: AccessLogEntry[],
  allEntries: AccessLogEntry[],
): CrawlBudgetReport {
  const botTypes = countBotTypes(botEntries);
  const topCrawledUrls = countTopUrls(botEntries, 20);
  const statusDistribution = countStatusCodes(allEntries);

  const wasted4xx = botEntries.filter(
    (e) => e.statusCode >= 400 && e.statusCode < 500,
  );
  const wasted5xx = botEntries.filter((e) => e.statusCode >= 500);
  const topWastedUrls = countTopUrls([...wasted4xx, ...wasted5xx], 10);

  return {
    totalRequests: allEntries.length,
    totalBotRequests: botEntries.length,
    botRatio:
      allEntries.length > 0
        ? Math.round((botEntries.length / allEntries.length) * 1000) / 10
        : 0,
    botTypes,
    topCrawledUrls,
    statusDistribution,
    wastedCrawlBudget: {
      total4xx: wasted4xx.length,
      total5xx: wasted5xx.length,
      topWastedUrls,
    },
    fetchedAt: new Date().toISOString(),
  };
}

function countBotTypes(entries: AccessLogEntry[]): BotType[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const name = identifyBot(entry.userAgent);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const total = entries.length;
  return [...counts.entries()]
    .map(([name, requests]) => ({
      name,
      requests,
      percentage: total > 0 ? Math.round((requests / total) * 1000) / 10 : 0,
    }))
    .toSorted((a, b) => b.requests - a.requests);
}

function identifyBot(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("googlebot")) return "Googlebot";
  if (ua.includes("bingbot")) return "Bingbot";
  if (ua.includes("yandexbot")) return "YandexBot";
  if (ua.includes("baiduspider")) return "BaiduSpider";
  if (ua.includes("gptbot")) return "GPTBot";
  if (ua.includes("chatgpt")) return "ChatGPT-User";
  if (ua.includes("ccbot")) return "CCBot";
  if (ua.includes("anthropic") || ua.includes("claudebot")) return "ClaudeBot";
  if (ua.includes("semrushbot")) return "SemrushBot";
  if (ua.includes("ahrefsbot")) return "AhrefsBot";
  if (ua.includes("bytespider")) return "ByteSpider";
  if (ua.includes("petalbot")) return "PetalBot";
  if (ua.includes("duckduckbot")) return "DuckDuckBot";
  if (ua.includes("applebot")) return "Applebot";

  const match = ua.match(/^(\S+)\//);
  return match ? match[1] : "Other";
}

function countTopUrls(
  entries: AccessLogEntry[],
  limit: number,
): TopCrawledUrl[] {
  const urlMap = new Map<string, Map<string, number>>();

  for (const entry of entries) {
    let urlCounts = urlMap.get(entry.url);
    if (!urlCounts) {
      urlCounts = new Map();
      urlMap.set(entry.url, urlCounts);
    }
    const code = String(entry.statusCode);
    urlCounts.set(code, (urlCounts.get(code) ?? 0) + 1);
  }

  return [...urlMap.entries()]
    .map(([url, codeMap]) => ({
      url,
      requests: [...codeMap.values()].reduce((a, b) => a + b, 0),
      statusCodes: Object.fromEntries(codeMap),
    }))
    .toSorted((a, b) => b.requests - a.requests)
    .slice(0, limit);
}

function countStatusCodes(entries: AccessLogEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const code = String(entry.statusCode);
    counts[code] = (counts[code] ?? 0) + 1;
  }
  return counts;
}
