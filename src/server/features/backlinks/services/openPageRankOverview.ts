import { backlinksOverviewSchema } from "./backlinksOverviewSchema";

export type OpenPageRankRow = {
  open_page_rank?: number | null;
  page_rank_decimal?: number | null;
  page_rank_integer?: number | null;
  referring_domains?: number | null;
};

export function buildOpenPageRankOverview(
  domain: string,
  row: OpenPageRankRow | null,
  fetchedAt = new Date().toISOString(),
) {
  const authority =
    row?.open_page_rank ??
    row?.page_rank_decimal ??
    row?.page_rank_integer ??
    null;
  return backlinksOverviewSchema.parse({
    target: domain,
    displayTarget: domain,
    scope: "domain",
    summary: {
      rank: authority,
      backlinks: null,
      referringPages: null,
      referringDomains: row?.referring_domains ?? null,
      brokenBacklinks: null,
      brokenPages: null,
      backlinksSpamScore: null,
      targetSpamScore: null,
      newBacklinks: null,
      lostBacklinks: null,
      newReferringDomains: null,
      lostReferringDomains: null,
    },
    trends: [],
    newLostTrends: [],
    dataSource: {
      provider: "openpagerank",
      mode: "basic",
      confidence: "low",
      capabilities: ["domain-authority", "referring-domain-aggregate"],
      note: "Low-cost aggregate snapshot. It does not claim individual links, anchors, spam, or page-level evidence.",
    },
    fetchedAt,
  });
}
