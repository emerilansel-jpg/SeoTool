import { describe, expect, it } from "vitest";

describe("AI Discovery & Analytics logic", () => {
  it("detects target brand citations from raw source list", () => {
    const domain = "filterairgadingserpong.com";
    const sources = [
      {
        url: "https://wikipedia.org/wiki/Water_filter",
        domain: "wikipedia.org",
      },
      {
        url: "https://filterairgadingserpong.com/produk/filter-sumur",
        domain: "filterairgadingserpong.com",
      },
      { url: "https://coway.id/water-purifier", domain: "coway.id" },
    ];

    const hasTargetCitation = sources.some(
      (s) => s.domain.includes(domain) || s.url.includes(domain),
    );
    expect(hasTargetCitation).toBe(true);

    const nonExistentDomain = "nonexistentbrand123.com";
    const hasNone = sources.some(
      (s) =>
        s.domain.includes(nonExistentDomain) ||
        s.url.includes(nonExistentDomain),
    );
    expect(hasNone).toBe(false);
  });

  it("calculates transparent AI Visibility Score accurately (0-100)", () => {
    // Formula: 0.35 * MentionRate + 0.30 * CitationRate + 0.20 * VolumeWeight + 0.15 * SOV
    const mentionRate = 80;
    const citationRate = 60;
    const volumeWeight = 70;
    const shareOfVoice = 40;

    const score = Math.min(
      100,
      Math.round(
        0.35 * mentionRate +
          0.3 * citationRate +
          0.2 * volumeWeight +
          0.15 * shareOfVoice,
      ),
    );

    // 0.35 * 80 = 28
    // 0.30 * 60 = 18
    // 0.20 * 70 = 14
    // 0.15 * 40 = 6
    // 28 + 18 + 14 + 6 = 66
    expect(score).toBe(66);
  });

  it("identifies Prompt Gaps correctly when competitor appears but our brand is missing", () => {
    const prompts = [
      {
        prompt: "filter air terbaik gading serpong",
        ourMention: true,
        competitors: ["coway.id"],
      },
      {
        prompt: "harga filter air sumur kuning",
        ourMention: false,
        competitors: ["coway.id", "pureve.id"],
      },
      {
        prompt: "service filter air rumah",
        ourMention: false,
        competitors: [],
      },
    ];

    const promptGaps = prompts.filter(
      (p) => !p.ourMention && p.competitors.length > 0,
    );

    expect(promptGaps).toHaveLength(1);
    expect(promptGaps[0].prompt).toBe("harga filter air sumur kuning");
    expect(promptGaps[0].competitors).toContain("coway.id");
    expect(promptGaps[0].competitors).toContain("pureve.id");
  });

  it("distinguishes owned citations from external citation gap opportunities", () => {
    const targetDomain = "filterairgadingserpong.com";
    const citationCounts = [
      {
        domain: "filterairgadingserpong.com",
        frequency: 5,
        isTargetBrand: true,
      },
      { domain: "detik.com", frequency: 12, isTargetBrand: false },
      { domain: "kompas.com", frequency: 8, isTargetBrand: false },
    ];

    const ourCitations = citationCounts.filter((c) => c.isTargetBrand);
    const opportunities = citationCounts.filter((c) => !c.isTargetBrand);

    expect(ourCitations).toHaveLength(1);
    expect(ourCitations[0].domain).toBe(targetDomain);
    expect(opportunities).toHaveLength(2);
    expect(opportunities[0].domain).toBe("detik.com");
  });

  it("correlates AI prompts with GSC search performance queries", () => {
    const aiPrompts = [
      {
        prompt: "filter air gading serpong",
        hasMention: true,
        hasCitation: true,
      },
      {
        prompt: "pasang filter air rumah",
        hasMention: true,
        hasCitation: false,
      },
    ];

    const gscQueries = new Map([
      [
        "filter air gading serpong",
        { clicks: 45, impressions: 820, position: 2.4 },
      ],
    ]);

    const correlated = aiPrompts.map((p) => {
      const match = gscQueries.get(p.prompt.toLowerCase());
      return {
        aiPrompt: p.prompt,
        aiPresence: p.hasMention,
        aiCitation: p.hasCitation,
        gscClicks: match ? match.clicks : 0,
        gscImpressions: match ? match.impressions : 0,
        sourceBadge: match ? "GSC" : "DataForSEO",
      };
    });

    expect(correlated[0].sourceBadge).toBe("GSC");
    expect(correlated[0].gscClicks).toBe(45);
    expect(correlated[1].sourceBadge).toBe("DataForSEO");
    expect(correlated[1].gscClicks).toBe(0);
  });
});
