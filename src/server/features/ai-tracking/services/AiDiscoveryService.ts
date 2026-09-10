import type { BillingCustomerContext } from "@/server/billing/subscription";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";
import { AiTrackingRepository } from "../repositories/AiTrackingRepository";
import type { LlmPlatform } from "@/server/lib/dataforseo/shared";

const DISCOVERY_PLATFORMS: LlmPlatform[] = ["chat_gpt", "google"];

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
      try {
        const [mentionsRes, topPagesRes] = await Promise.all([
          dataforseo.aiSearch.mentionsSearch({
            target: { domain: config.domain },
            platform,
            locationCode,
            languageCode,
            limit: 100,
          }),
          dataforseo.aiSearch.topPages({
            target: { domain: config.domain },
            platform,
            locationCode,
            languageCode,
            itemsListLimit: 20,
          }),
        ]);

        for (const item of mentionsRes) {
          if (!item.question) continue;
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
              (s.domain && s.domain.toLowerCase().includes(domainLower)) ||
              (s.url && s.url.toLowerCase().includes(domainLower)),
          );

          const brandEntities = (item.brand_entities ?? [])
            .map((b: { title?: string | null }) => b.title)
            .filter((t: string | null | undefined): t is string => Boolean(t));

          allDiscoveredItems.push({
            prompt: item.question.trim(),
            platform,
            aiSearchVolume: item.ai_search_volume ?? 0,
            hasMention: true,
            hasCitation: Boolean(matchedCitation),
            citationUrl: matchedCitation?.url ?? null,
            brandEntities,
            sources,
            firstResponseAt: item.first_response_at ?? null,
            lastResponseAt: item.last_response_at ?? null,
          });
        }

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
        // Log individual platform failure without failing entire discovery
        console.error(`AI Discovery failed for platform ${platform}:`, err);
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
