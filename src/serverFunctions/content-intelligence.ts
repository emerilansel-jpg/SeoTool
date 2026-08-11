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

// Content gap is a metered DataForSEO Labs lookup (keywords competitors rank for
// that the project domain does not), so it is a POST available to any project
// member (viewer+) — credit availability gates spend, as with domain/backlinks.
export const getContentGap = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(contentGapInputSchema)
  .handler(async ({ data, context }) => {
    const market = resolveLabsMarket(data, context.project);
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
