import type { DomainIntersectionItem } from "@/server/lib/dataforseo/labs";
import { toRelativePath } from "@/server/lib/domainUtils";

/**
 * Pure shaping/merge/cluster/summary logic for the content-gap feature.
 * No I/O — every function here is unit-testable. The service layer wires this
 * to the DataForSEO client and the R2 cache.
 *
 * A content gap = keywords one or more competitor domains rank for that the
 * project's own domain does not (DataForSEO Labs domain intersection,
 * intersections:false). Gap keywords are then clustered into "topics" by
 * shared significant tokens so the report reads as a topic/entity gap rather
 * than a flat keyword list.
 */

/** One competitor's ranking for a gap keyword. */
export type GapCompetitorRanking = {
  competitor: string;
  position: number | null;
  url: string | null;
  relativeUrl: string | null;
  traffic: number | null;
};

/** A single gap keyword aggregated across all competitors. */
export type GapKeyword = {
  keyword: string;
  searchVolume: number | null;
  keywordDifficulty: number | null;
  cpc: number | null;
  /** Competitors that rank for this keyword, in input order. */
  competitors: GapCompetitorRanking[];
};

/** A topic cluster built from a shared significant token. */
export type GapTopic = {
  topic: string;
  keywordCount: number;
  totalVolume: number;
  keywords: string[];
};

export type ContentGapSummary = {
  totalKeywords: number;
  /** Sum of search volumes (null treated as 0) — the addressable demand. */
  totalVolume: number;
  /** Mean keyword difficulty across keywords that report a value. */
  averageDifficulty: number | null;
  /** Mean number of competitors ranking per keyword (overlap signal). */
  averageCompetitorOverlap: number;
  topTopic: string | null;
};

export type ContentGapResult = {
  keywords: GapKeyword[];
  topics: GapTopic[];
  summary: ContentGapSummary;
};

export type ContentGapView = ContentGapResult & {
  domain: string;
  competitors: string[];
  locationCode: number;
  languageCode: string;
  fetchedAt: string;
  hasData: boolean;
};

/** Convert one DataForSEO intersection item into a single-competitor gap keyword. */
export function mapIntersectionItem(
  item: DomainIntersectionItem,
  competitor: string,
): GapKeyword | null {
  const keywordData = item.keyword_data;
  const keyword = keywordData?.keyword;
  if (!keyword) return null;

  const info = keywordData?.keyword_info;
  const props = keywordData?.keyword_properties;
  const serp = item.first_domain_serp_element;

  const position = serp?.rank_absolute ?? null;
  const url = serp?.url ?? null;
  const relativeUrl = serp?.relative_url ?? (url ? toRelativePath(url) : null);
  const traffic = serp?.etv ?? null;

  return {
    keyword,
    searchVolume:
      info?.search_volume != null ? Math.round(info.search_volume) : null,
    keywordDifficulty:
      props?.keyword_difficulty != null
        ? Math.round(props.keyword_difficulty)
        : null,
    cpc: info?.cpc ?? null,
    competitors: [
      {
        competitor,
        position: position != null ? Math.round(position) : null,
        url,
        relativeUrl,
        traffic,
      },
    ],
  };
}

/** Return the larger of two nullable numbers, preferring non-null; null if both null. */
function pickHigher(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null;
  if (a == null) return b;
  if (b == null) return a;
  return Math.max(a, b);
}

/**
 * Merge per-competitor gap keyword lists into one deduplicated list keyed by
 * keyword (case-insensitive). When the same keyword appears for multiple
 * competitors their rankings accumulate, and the higher non-null volume /
 * difficulty / cpc wins. Sorted by search volume desc (nulls last).
 */
export function mergeGapKeywords(
  perCompetitor: Array<{ competitor: string; keywords: GapKeyword[] }>,
): GapKeyword[] {
  const byKey = new Map<string, GapKeyword>();
  for (const entry of perCompetitor) {
    for (const kw of entry.keywords) {
      const key = kw.keyword.toLowerCase();
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, {
          ...kw,
          competitors: [...kw.competitors],
        });
        continue;
      }
      existing.competitors.push(...kw.competitors);
      existing.searchVolume = pickHigher(
        existing.searchVolume,
        kw.searchVolume,
      );
      existing.keywordDifficulty = pickHigher(
        existing.keywordDifficulty,
        kw.keywordDifficulty,
      );
      existing.cpc = pickHigher(existing.cpc, kw.cpc);
    }
  }
  return [...byKey.values()].toSorted(
    (a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0),
  );
}

// Common English filler tokens — not useful as topic anchors.
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "for",
  "to",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "is",
  "are",
  "be",
  "how",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "best",
  "top",
  "buy",
  "near",
  "online",
  "your",
  "you",
  "can",
  "do",
  "does",
  "it",
  "this",
  "that",
  "these",
  "those",
  "my",
  "vs",
  "versus",
  "guide",
  "review",
  "reviews",
]);

/** Significant lowercase tokens (length >= 3, not a stopword) for clustering. */
function significantTokens(keyword: string): string[] {
  return keyword
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

/**
 * Cluster gap keywords into topics. Each keyword is assigned to its most
 * globally-frequent significant token (tie-broken alphabetically); keywords
 * with no significant token land in "(other)". Topics are sorted by keyword
 * count desc then total volume desc, and capped to `maxTopics`.
 */
export function clusterGapTopics(
  keywords: GapKeyword[],
  maxTopics = 8,
): GapTopic[] {
  const frequency = new Map<string, number>();
  for (const kw of keywords) {
    for (const token of new Set(significantTokens(kw.keyword))) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }

  const buckets = new Map<string, GapKeyword[]>();
  const OTHER = "(other)";
  for (const kw of keywords) {
    const tokens = significantTokens(kw.keyword);
    let anchor: string | null = null;
    let bestCount = 0;
    for (const token of tokens.toSorted()) {
      const count = frequency.get(token) ?? 0;
      if (count > bestCount) {
        bestCount = count;
        anchor = token;
      }
    }
    const key = anchor ?? OTHER;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(kw);
    else buckets.set(key, [kw]);
  }

  const topics: GapTopic[] = [];
  for (const [topic, group] of buckets) {
    const totalVolume = group.reduce(
      (sum, kw) => sum + (kw.searchVolume ?? 0),
      0,
    );
    // Surface a few example keywords per topic (highest volume first).
    const examples = group
      .toSorted((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
      .slice(0, 5)
      .map((kw) => kw.keyword);
    topics.push({
      topic,
      keywordCount: group.length,
      totalVolume,
      keywords: examples,
    });
  }

  topics.sort((a, b) => {
    if (b.keywordCount !== a.keywordCount)
      return b.keywordCount - a.keywordCount;
    return b.totalVolume - a.totalVolume;
  });
  return topics.slice(0, maxTopics);
}

/** Summarise a merged gap list + its topic clusters. */
export function summarizeGap(
  keywords: GapKeyword[],
  topics: GapTopic[],
): ContentGapSummary {
  const totalKeywords = keywords.length;
  let totalVolume = 0;
  let difficultySum = 0;
  let difficultyCount = 0;
  let competitorSum = 0;
  for (const kw of keywords) {
    totalVolume += kw.searchVolume ?? 0;
    if (kw.keywordDifficulty != null) {
      difficultySum += kw.keywordDifficulty;
      difficultyCount += 1;
    }
    competitorSum += kw.competitors.length;
  }
  return {
    totalKeywords,
    totalVolume,
    averageDifficulty:
      difficultyCount > 0 ? Math.round(difficultySum / difficultyCount) : null,
    averageCompetitorOverlap:
      totalKeywords > 0
        ? Math.round((competitorSum / totalKeywords) * 10) / 10
        : 0,
    topTopic: topics.length > 0 ? topics[0].topic : null,
  };
}

/** Build a full content-gap result from raw per-competitor intersection items. */
export function buildContentGap(
  perCompetitor: Array<{ competitor: string; items: DomainIntersectionItem[] }>,
): ContentGapResult {
  const mapped = perCompetitor.map(({ competitor, items }) => ({
    competitor,
    keywords: items
      .map((item) => mapIntersectionItem(item, competitor))
      .filter((kw): kw is GapKeyword => kw != null),
  }));
  const keywords = mergeGapKeywords(mapped);
  const topics = clusterGapTopics(keywords);
  const summary = summarizeGap(keywords, topics);
  return { keywords, topics, summary };
}
