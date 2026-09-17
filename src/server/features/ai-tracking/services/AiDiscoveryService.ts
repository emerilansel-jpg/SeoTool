import { generateText } from "ai";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { AppError } from "@/server/lib/errors";
import { AiTrackingRepository } from "../repositories/AiTrackingRepository";
import type { LlmPlatform, LlmTarget } from "@/server/lib/dataforseo/shared";

const DISCOVERY_PLATFORMS: LlmPlatform[] = ["chat_gpt", "google"];
const MIN_STRONG_ALIAS_LENGTH = 5;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizedDomain(value: string): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

function strongAliases(brandName: string, aliases: string[]): string[] {
  const brandNorm = normalize(brandName);
  return aliases
    .map((alias) => alias.trim())
    .filter((alias) => {
      const value = normalize(alias);
      return (
        value.length >= MIN_STRONG_ALIAS_LENGTH &&
        value !== brandNorm &&
        (value.includes(" ") || value.length >= 7)
      );
    });
}

function discoveryRelevance(input: {
  prompt: string;
  brandName: string;
  aliases: string[];
  domain: string;
  brandEntities: string[];
  sources: Array<{
    url?: string | null;
    title?: string | null;
    domain?: string | null;
  }>;
}): { relevant: boolean; hasMention: boolean; matchedTarget: string | null } {
  const brand = normalize(input.brandName);
  const aliases = strongAliases(input.brandName, input.aliases).map(normalize);
  const domain = normalizedDomain(input.domain);
  const haystacks = [
    normalize(input.prompt),
    ...input.brandEntities.map(normalize),
    ...input.sources.flatMap((source) => [
      normalize(source.title ?? ""),
      normalize(source.domain ?? ""),
      normalize(source.url ?? ""),
    ]),
  ];
  const domainMatch = input.sources.some((source) => {
    const sourceDomain = normalizedDomain(source.domain ?? source.url ?? "");
    return sourceDomain === domain || sourceDomain.endsWith(`.${domain}`);
  });
  const brandMatch =
    brand.length >= 3 && haystacks.some((text) => text.includes(brand));
  const aliasMatch = aliases.find((alias) =>
    haystacks.some((text) => text.includes(alias)),
  );
  const matchedTarget = domainMatch
    ? domain
    : brandMatch
      ? input.brandName
      : (aliasMatch ?? null);
  return {
    relevant: Boolean(matchedTarget),
    hasMention: brandMatch || Boolean(aliasMatch) || domainMatch,
    matchedTarget,
  };
}

export const AiTrackingDiscoveryInternals = {
  discoveryRelevance,
  strongAliases,
};

export const AiDiscoveryService = {
  async discoverPrompts(
    projectId: string,
    billingCustomer: BillingCustomerContext,
  ) {
    const config = await AiTrackingRepository.getConfig(projectId);
    if (!config) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Configure AI Tracking settings before discovering prompts.",
      );
    }

    const dataforseo = createDataforseoClient(billingCustomer);
    const domainLower = config.domain.toLowerCase().trim();
    const locationCode = config.locationCode ?? 2840;
    const languageCode = config.languageCode ?? "en";

    const brandAliases: string[] =
      typeof config.brandAliases === "string"
        ? (JSON.parse(config.brandAliases || "[]") as string[])
        : (config.brandAliases as string[]) || [];

    const targetsToSearch: LlmTarget[] = [{ domain: config.domain }];

    if (config.brandName && config.brandName.trim().length >= 2) {
      targetsToSearch.push({
        keyword: config.brandName.trim(),
        match_type: "word_match",
      });
    }

    for (const alias of strongAliases(config.brandName, brandAliases).slice(
      0,
      2,
    )) {
      targetsToSearch.push({
        keyword: alias,
        match_type: "word_match",
      });
    }

    const seenPrompts = new Set<string>();

    const allDiscoveredItems: Array<{
      prompt: string;
      platform: string;
      aiSearchVolume: number;
      hasMention: boolean;
      hasCitation: boolean;
      citationUrl: string | null;
      brandEntities: string[];
      sources: Array<{
        url?: string | null;
        title?: string | null;
        domain?: string | null;
      }>;
      isTracked?: boolean;
      firstResponseAt: string | null;
      lastResponseAt: string | null;
    }> = [];

    const allTopPages: Array<{
      url: string;
      platform: string;
      mentions: number;
      aiSearchVolume: number;
    }> = [];

    for (const platform of DISCOVERY_PLATFORMS) {
      for (const target of targetsToSearch) {
        try {
          const mentionsRes = await dataforseo.aiSearch.mentionsSearch({
            target,
            platform,
            locationCode,
            languageCode,
            limit: 50,
          });

          for (const item of mentionsRes) {
            if (!item.question) continue;
            const promptTrimmed = item.question.trim();
            const lowerPrompt = promptTrimmed.toLowerCase();
            if (seenPrompts.has(lowerPrompt)) continue;
            seenPrompts.add(lowerPrompt);

            const sources = (item.sources ?? []).map(
              (s: {
                url?: string | null;
                title?: string | null;
                domain?: string | null;
              }) => ({
                url: s.url ?? null,
                title: s.title ?? null,
                domain: s.domain ?? null,
              }),
            );

            const matchedCitation = sources.find(
              (s: { url: string | null; domain: string | null }) =>
                normalizedDomain(s.domain ?? s.url ?? "") ===
                  normalizedDomain(domainLower) ||
                normalizedDomain(s.domain ?? s.url ?? "").endsWith(
                  `.${normalizedDomain(domainLower)}`,
                ),
            );

            const brandEntities = (item.brand_entities ?? [])
              .map((b: { title?: string | null }) => b.title)
              .filter((t: string | null | undefined): t is string =>
                Boolean(t),
              );
            const relevance = discoveryRelevance({
              prompt: promptTrimmed,
              brandName: config.brandName,
              aliases: brandAliases,
              domain: config.domain,
              brandEntities,
              sources,
            });
            if (!relevance.relevant) continue;

            allDiscoveredItems.push({
              prompt: promptTrimmed,
              platform,
              aiSearchVolume: item.ai_search_volume ?? 0,
              hasMention: relevance.hasMention,
              hasCitation: Boolean(matchedCitation),
              citationUrl: matchedCitation?.url ?? null,
              brandEntities,
              sources,
              firstResponseAt: item.first_response_at ?? null,
              lastResponseAt: item.last_response_at ?? null,
            });
          }
        } catch (err) {
          // Continue to next target on error
          console.warn(
            `DataForSEO mentionsSearch skipped for target on ${platform}:`,
            err,
          );
        }
      }

      try {
        const topPagesRes = await dataforseo.aiSearch.topPages({
          target: { domain: config.domain },
          platform,
          locationCode,
          languageCode,
          itemsListLimit: 20,
        });

        for (const pageItem of topPagesRes) {
          if (!pageItem.key) continue;
          const totalMentions = (pageItem.platform ?? []).reduce(
            (acc: number, p: { mentions?: number | null }) =>
              acc + (p.mentions ?? 0),
            0,
          );
          const totalVolume = (pageItem.platform ?? []).reduce(
            (acc: number, p: { ai_search_volume?: number | null }) =>
              acc + (p.ai_search_volume ?? 0),
            0,
          );

          allTopPages.push({
            url: pageItem.key,
            platform,
            mentions: totalMentions,
            aiSearchVolume: totalVolume,
          });
        }
      } catch (err) {
        console.warn(`DataForSEO topPages skipped on ${platform}:`, err);
      }
    }

    // Fallback: If DataForSEO returned 0 mentions for new, local, or niche brands,
    // generate contextual search discovery prompts so users never get stuck with 0 results.
    if (allDiscoveredItems.length === 0) {
      const brand = config.brandName;
      const domain = config.domain;
      let fallbackPrompts: string[] = [];

      try {
        const model = await getChatAgentModel();
        const prompt = `You are an SEO & Answer Engine Optimization expert.
Generate 8 realistic, varied search questions that real users would ask ChatGPT, Claude, Gemini, or Perplexity when researching "${brand}" (website: "${domain}", aliases: "${brandAliases.join(", ")}").
Include questions asking what it is, its services, reviews, reputation, alternatives, and comparisons.
Return ONLY a valid JSON array of strings, e.g. ["Prompt 1", "Prompt 2"]. Do not include markdown code blocks or commentary.`;
        const res = await generateText({ model, prompt, maxOutputTokens: 600 });
        const clean = res.text
          .replace(/```(?:json)?/gi, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fallbackPrompts = parsed.filter(
            (p): p is string => typeof p === "string" && p.trim().length > 3,
          );
        }
      } catch {
        // Fall back to structured high-intent template prompts
      }

      if (fallbackPrompts.length === 0) {
        fallbackPrompts = [
          `What is ${brand} and what services do they provide?`,
          `Is ${brand} good and reliable? Customer reviews`,
          `Top alternatives and competitors to ${brand}`,
          `How much does ${brand} (${domain}) cost?`,
          `Features and capabilities of ${brand}`,
          `How does ${brand} compare to other industry providers?`,
          `Who is ${brand} best suited for?`,
          `Customer feedback and experience with ${brand}`,
        ];
      }

      for (const p of fallbackPrompts) {
        const trimmed = p.trim();
        if (seenPrompts.has(trimmed.toLowerCase())) continue;
        seenPrompts.add(trimmed.toLowerCase());
        allDiscoveredItems.push({
          prompt: trimmed,
          platform: "all",
          aiSearchVolume: 0,
          hasMention: false,
          hasCitation: false,
          citationUrl: null,
          brandEntities: [config.brandName],
          sources: [],
          firstResponseAt: null,
          lastResponseAt: null,
        });
      }
    }

    // Auto-promote top prompts into tracking list if active prompts is currently empty
    const currentActivePrompts = await AiTrackingRepository.getActivePrompts(
      config.id,
    );
    if (currentActivePrompts.length === 0 && allDiscoveredItems.length > 0) {
      const topPrompts = allDiscoveredItems.slice(0, 4).map((i) => i.prompt);
      await AiTrackingRepository.addPrompts(config.id, topPrompts);
      for (const item of allDiscoveredItems.slice(0, 4)) {
        item.isTracked = true;
      }
    }

    if (allDiscoveredItems.length > 0) {
      await AiTrackingRepository.upsertDiscoveredPrompts(
        config.id,
        allDiscoveredItems,
      );
    }

    if (allTopPages.length > 0) {
      await AiTrackingRepository.upsertTopPages(config.id, allTopPages);
    }

    const now = new Date().toISOString();
    await AiTrackingRepository.updateConfigDiscoveryDate(config.id, now);

    const stats = await AiTrackingRepository.getDiscoveryStats(config.id);
    return {
      success: true,
      discoveredCount: allDiscoveredItems.length,
      topPagesCount: allTopPages.length,
      stats,
    };
  },
};
