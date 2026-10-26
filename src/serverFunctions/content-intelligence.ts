import { createServerFn } from "@tanstack/react-start";
import { ContentIntelligenceService } from "@/server/features/content-intelligence/services/ContentIntelligenceService";
import { ContentGapService } from "@/server/features/content-intelligence/services/ContentGapService";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { resolveLabsMarket } from "@/shared/keyword-locations";
import {
  contentGapInputSchema,
  contentScoreSummaryInputSchema,
  contentScoresInputSchema,
  pageEntitiesInputSchema,
  polishGapKeywordsInputSchema,
} from "@/types/schemas/content-intelligence";

// Read-only content scores are available to any project member (viewer+).
// Scoring itself runs automatically inside the site-audit workflow.
export const getContentScores = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(contentScoresInputSchema)
  .handler(async ({ data, context }) => {
    return ContentIntelligenceService.getScoresForAudit(
      data.auditId,
      context.projectId,
    );
  });

export const getContentScoreSummary = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(contentScoreSummaryInputSchema)
  .handler(async ({ data, context }) => {
    if (data.auditId) {
      return ContentIntelligenceService.getSummaryForAudit(
        data.auditId,
        context.projectId,
      );
    }
    return ContentIntelligenceService.getSummaryForProject(context.projectId);
  });

function shouldUseE2eFixtures() {
  return (
    import.meta.env.VITE_E2E_KEYWORD_FIXTURES === "1" ||
    import.meta.env.BYPASS_AUTH === "true"
  );
}

// Content gap is a metered DataForSEO Labs lookup (keywords competitors rank for
// that the project domain does not), so it is a POST available to any project
// member (viewer+) — credit availability gates spend, as with domain/backlinks.
export const getContentGap = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(contentGapInputSchema)
  .handler(async ({ data, context }) => {
    const market = resolveLabsMarket(data, context.project);
    if (shouldUseE2eFixtures()) {
      const compRanks = data.competitors.map((c) => ({
        competitor: c,
        position: 4,
        url: null,
        relativeUrl: null,
        traffic: 250,
      }));
      return {
        keywords: [
          {
            keyword: "best payment gateway saas",
            searchVolume: 4200,
            cpc: 3.5,
            keywordDifficulty: 42,
            competitors: compRanks,
          },
          {
            keyword: "online store payment processing",
            searchVolume: 1800,
            cpc: 2.1,
            keywordDifficulty: 35,
            competitors: compRanks,
          },
          {
            keyword: "competitor portal account signin",
            searchVolume: 85000,
            cpc: 0.1,
            keywordDifficulty: 80,
            competitors: compRanks.slice(0, 1),
          },
          {
            keyword: "privacy policy terms template",
            searchVolume: 12000,
            cpc: 0.05,
            keywordDifficulty: 10,
            competitors: compRanks,
          },
          {
            keyword: "checkout integration guide",
            searchVolume: 3100,
            cpc: 1.8,
            keywordDifficulty: 28,
            competitors: compRanks.slice(0, 1),
          },
        ],
        topics: [
          {
            topic: "Payments",
            keywordCount: 2,
            totalVolume: 6000,
            keywords: ["best payment gateway saas", "online store payment processing"],
          },
          {
            topic: "Brand Noise",
            keywordCount: 1,
            totalVolume: 85000,
            keywords: ["competitor portal account signin"],
          },
          {
            topic: "Junk Noise",
            keywordCount: 1,
            totalVolume: 12000,
            keywords: ["privacy policy terms template"],
          },
        ],
        summary: {
          totalKeywords: 5,
          totalVolume: 106100,
          averageDifficulty: 39,
          averageCompetitorOverlap: 1.6,
          topTopic: "Payments",
        },
        domain: data.domain,
        competitors: data.competitors,
        locationCode: market.locationCode,
        languageCode: market.languageCode,
        fetchedAt: new Date().toISOString(),
        hasData: true,
      };
    }

    return ContentGapService.getGap(
      {
        projectId: context.projectId,
        domain: data.domain,
        competitors: data.competitors,
        locationCode: market.locationCode,
        languageCode: market.languageCode,
      },
      context,
    );
  });

// Polish gap keywords with AI to filter out junk / irrelevant terms.
export const polishGapKeywords = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(polishGapKeywordsInputSchema)
  .handler(async ({ data, context }) => {
    if (shouldUseE2eFixtures()) {
      // In E2E / bypass mode, clean out noisy brand/junk keywords deterministically
      const cleaned = data.keywords.filter(
        (kw) =>
          !kw.toLowerCase().includes("signin") &&
          !kw.toLowerCase().includes("terms") &&
          !kw.toLowerCase().includes("portal") &&
          !kw.toLowerCase().includes("noise"),
      );
      return cleaned;
    }

    return ContentGapService.polishKeywords({
      domain: data.domain,
      keywords: data.keywords,
      organizationId: context.organizationId,
    });
  });

// Read-only per-page entity/topic extraction results. Entity extraction runs
// automatically in the site-audit workflow (best-effort). Available to any
// project member (viewer+).
export const getPageEntities = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(pageEntitiesInputSchema)
  .handler(async ({ data, context }) => {
    return ContentIntelligenceService.getEntitiesForAudit(
      data.auditId,
      context.projectId,
    );
  });
