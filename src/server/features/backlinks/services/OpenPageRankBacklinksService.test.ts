import { describe, expect, it } from "vitest";
import { buildOpenPageRankOverview } from "./openPageRankOverview";

describe("OpenPageRank basic backlink snapshot", () => {
  it("exposes only supported aggregate signals with low confidence", () => {
    const result = buildOpenPageRankOverview(
      "example.com",
      { open_page_rank: 5.4, referring_domains: 321 },
      "2026-08-27T00:00:00.000Z",
    );

    expect(result.summary.rank).toBe(5.4);
    expect(result.summary.referringDomains).toBe(321);
    expect(result.summary.backlinks).toBeNull();
    expect(result.summary.backlinksSpamScore).toBeNull();
    expect(result.trends).toEqual([]);
    expect(result.dataSource).toMatchObject({
      provider: "openpagerank",
      mode: "basic",
      confidence: "low",
    });
  });
});
