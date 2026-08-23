export type ToxicLink = {
  domainFrom: string;
  urlFrom: string | null;
  spamScore: number;
  rank: number | null;
};

export type ToxicSummary = {
  totalToxic: number;
  totalAnalyzed: number;
  toxicPercentage: number;
  topToxicDomains: { domain: string; count: number; avgSpamScore: number }[];
};

const DEFAULT_TOXIC_THRESHOLD = 70;

export function identifyToxicLinks(
  links: {
    domainFrom: string | null;
    urlFrom: string | null;
    spamScore: number | null;
    rank: number | null;
  }[],
  options?: { threshold?: number },
): { toxic: ToxicLink[]; summary: ToxicSummary } {
  const threshold = options?.threshold ?? DEFAULT_TOXIC_THRESHOLD;

  const toxic: ToxicLink[] = [];
  for (const link of links) {
    if (!link.domainFrom) continue;
    const score = link.spamScore ?? 0;
    if (score >= threshold) {
      toxic.push({
        domainFrom: link.domainFrom,
        urlFrom: link.urlFrom,
        spamScore: score,
        rank: link.rank,
      });
    }
  }

  toxic.sort((a, b) => b.spamScore - a.spamScore);

  const domainCounts = new Map<string, { count: number; totalSpam: number }>();
  for (const link of toxic) {
    const existing = domainCounts.get(link.domainFrom);
    if (existing) {
      existing.count++;
      existing.totalSpam += link.spamScore;
    } else {
      domainCounts.set(link.domainFrom, {
        count: 1,
        totalSpam: link.spamScore,
      });
    }
  }

  const topToxicDomains = [...domainCounts.entries()]
    .map(([domain, data]) => ({
      domain,
      count: data.count,
      avgSpamScore: Math.round((data.totalSpam / data.count) * 10) / 10,
    }))
    .toSorted((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    toxic,
    summary: {
      totalToxic: toxic.length,
      totalAnalyzed: links.length,
      toxicPercentage:
        links.length > 0
          ? Math.round((toxic.length / links.length) * 1000) / 10
          : 0,
      topToxicDomains,
    },
  };
}
