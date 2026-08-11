import { describe, expect, it } from "vitest";
import {
  buildContentGap,
  clusterGapTopics,
  mapIntersectionItem,
  mergeGapKeywords,
  summarizeGap,
  type GapKeyword,
} from "@/server/features/content-intelligence/contentGap";
import type { DomainIntersectionItem } from "@/server/lib/dataforseo/labs";

function item(
  overrides: Partial<DomainIntersectionItem> = {},
): DomainIntersectionItem {
  return {
    keyword_data: {
      keyword: "espresso machine",
      keyword_info: { search_volume: 1200, cpc: 1.5 },
      keyword_properties: { keyword_difficulty: 64 },
    },
    first_domain_serp_element: {
      rank_absolute: 3,
      url: "https://competitor.com/guide/espresso",
      relative_url: "/guide/espresso",
      etv: 80,
    },
    ...overrides,
  };
}

function kw(keyword: string, volume: number | null): GapKeyword {
  return {
    keyword,
    searchVolume: volume,
    keywordDifficulty: null,
    cpc: null,
    competitors: [],
  };
}

describe("mapIntersectionItem", () => {
  it("maps a populated item into a single-competitor gap keyword", () => {
    const mapped = mapIntersectionItem(item(), "competitor.com");
    expect(mapped).toEqual({
      keyword: "espresso machine",
      searchVolume: 1200,
      keywordDifficulty: 64,
      cpc: 1.5,
      competitors: [
        {
          competitor: "competitor.com",
          position: 3,
          url: "https://competitor.com/guide/espresso",
          relativeUrl: "/guide/espresso",
          traffic: 80,
        },
      ],
    });
  });

  it("returns null when the item has no keyword", () => {
    expect(
      mapIntersectionItem(
        item({ keyword_data: { keyword_info: { search_volume: 10 } } }),
        "competitor.com",
      ),
    ).toBeNull();
  });

  it("derives relativeUrl from url and tolerates null numeric fields", () => {
    const mapped = mapIntersectionItem(
      item({
        first_domain_serp_element: {
          rank_absolute: null,
          url: "https://competitor.com/a",
          relative_url: null,
          etv: null,
        },
      }),
      "competitor.com",
    );
    expect(mapped?.competitors[0]).toMatchObject({
      position: null,
      relativeUrl: "/a",
      traffic: null,
    });
    expect(mapped?.searchVolume).toBe(1200);
  });
});

describe("mergeGapKeywords", () => {
  it("dedupes case-insensitively and accumulates competitor rankings", () => {
    const a = mapIntersectionItem(item(), "a.com");
    const b = mapIntersectionItem(
      item({
        keyword_data: {
          keyword: "Espresso Machine",
          keyword_info: { search_volume: 1500, cpc: 2 },
          keyword_properties: { keyword_difficulty: 70 },
        },
      }),
      "b.com",
    );
    const merged = mergeGapKeywords([
      { competitor: "a.com", keywords: a ? [a] : [] },
      { competitor: "b.com", keywords: b ? [b] : [] },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].keyword).toBe("espresso machine");
    // Higher non-null values win on conflict.
    expect(merged[0].searchVolume).toBe(1500);
    expect(merged[0].keywordDifficulty).toBe(70);
    expect(merged[0].cpc).toBe(2);
    expect(merged[0].competitors.map((c) => c.competitor)).toEqual([
      "a.com",
      "b.com",
    ]);
  });

  it("sorts by search volume desc with nulls last", () => {
    const kws: GapKeyword[] = [
      {
        keyword: "low",
        searchVolume: 50,
        keywordDifficulty: null,
        cpc: null,
        competitors: [],
      },
      {
        keyword: "high",
        searchVolume: 500,
        keywordDifficulty: null,
        cpc: null,
        competitors: [],
      },
      {
        keyword: "unknown",
        searchVolume: null,
        keywordDifficulty: null,
        cpc: null,
        competitors: [],
      },
    ];
    const merged = mergeGapKeywords([{ competitor: "x.com", keywords: kws }]);
    expect(merged.map((k) => k.keyword)).toEqual(["high", "low", "unknown"]);
  });

  it("returns an empty list for empty input", () => {
    expect(mergeGapKeywords([])).toEqual([]);
    expect(mergeGapKeywords([{ competitor: "x.com", keywords: [] }])).toEqual(
      [],
    );
  });
});

describe("clusterGapTopics", () => {
  it("groups by significant token and ignores stopwords/short tokens", () => {
    // The shared subject word ("espresso") is the most frequent significant
    // token, so both espresso keywords anchor to it; the unrelated keyword
    // forms its own topic.
    const topics = clusterGapTopics([
      kw("best espresso machine", 100),
      kw("espresso grinder", 50),
      kw("pour over coffee", 30),
    ]);
    const labels = topics.map((t) => t.topic);
    expect(labels).toEqual(["espresso", "coffee"]);
    const espresso = topics.find((t) => t.topic === "espresso")!;
    expect(espresso.keywordCount).toBe(2);
    expect(espresso.totalVolume).toBe(150);
  });

  it("sends keywords with no significant token to (other)", () => {
    const topics = clusterGapTopics([kw("how to", 10), kw("a1", 5)]);
    const other = topics.find((t) => t.topic === "(other)");
    expect(other?.keywordCount).toBe(2);
  });

  it("caps to maxTopics and orders by count then volume", () => {
    const kws = [
      kw("alpha red", 10),
      kw("alpha blue", 5),
      kw("beta green", 100),
      kw("gamma gray", 1),
    ];
    const topics = clusterGapTopics(kws, 2);
    expect(topics).toHaveLength(2);
    // "alpha" anchors two keywords (most frequent token), so it leads; the
    // single-keyword topics tie on count and break on volume.
    expect(topics[0].topic).toBe("alpha");
    expect(topics[1].topic).toBe("beta");
  });
});

describe("summarizeGap", () => {
  it("aggregates totals, ignores null difficulty, and reports overlap", () => {
    const kws: GapKeyword[] = [
      {
        keyword: "a",
        searchVolume: 100,
        keywordDifficulty: 40,
        cpc: null,
        competitors: [
          {
            competitor: "a.com",
            position: 1,
            url: null,
            relativeUrl: null,
            traffic: null,
          },
        ],
      },
      {
        keyword: "b",
        searchVolume: null,
        keywordDifficulty: null,
        cpc: null,
        competitors: [
          {
            competitor: "a.com",
            position: 2,
            url: null,
            relativeUrl: null,
            traffic: null,
          },
          {
            competitor: "b.com",
            position: 4,
            url: null,
            relativeUrl: null,
            traffic: null,
          },
        ],
      },
    ];
    const summary = summarizeGap(kws, [
      { topic: "a", keywordCount: 2, totalVolume: 100, keywords: ["a", "b"] },
    ]);
    expect(summary.totalKeywords).toBe(2);
    expect(summary.totalVolume).toBe(100);
    expect(summary.averageDifficulty).toBe(40);
    expect(summary.averageCompetitorOverlap).toBe(1.5);
    expect(summary.topTopic).toBe("a");
  });

  it("returns null averageDifficulty and zero overlap for empty input", () => {
    const summary = summarizeGap([], []);
    expect(summary.totalKeywords).toBe(0);
    expect(summary.totalVolume).toBe(0);
    expect(summary.averageDifficulty).toBeNull();
    expect(summary.averageCompetitorOverlap).toBe(0);
    expect(summary.topTopic).toBeNull();
  });
});

describe("buildContentGap (end-to-end)", () => {
  it("merges two competitors, clusters, and summarizes", () => {
    const result = buildContentGap([
      {
        competitor: "a.com",
        items: [
          item(),
          item({
            keyword_data: {
              keyword: "coffee grinder",
              keyword_info: { search_volume: 300 },
            },
          }),
        ],
      },
      {
        competitor: "b.com",
        items: [
          item({
            keyword_data: {
              keyword: "Espresso Machine",
              keyword_info: { search_volume: 1500 },
            },
          }),
        ],
      },
    ]);
    // Two unique keywords after case-insensitive dedupe.
    expect(result.keywords).toHaveLength(2);
    expect(result.summary.totalKeywords).toBe(2);
    // espresso machine wins as the top-volume keyword.
    expect(result.keywords[0].keyword).toBe("espresso machine");
    expect(result.keywords[0].competitors).toHaveLength(2);
    expect(result.summary.topTopic).toBeTruthy();
  });

  it("handles empty input gracefully", () => {
    const result = buildContentGap([]);
    expect(result.keywords).toEqual([]);
    expect(result.topics).toEqual([]);
    expect(result.summary.totalKeywords).toBe(0);
  });
});
