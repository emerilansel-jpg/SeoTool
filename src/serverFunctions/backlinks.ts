import { createServerFn } from "@tanstack/react-start";
import { BacklinksService } from "@/server/features/backlinks/services/BacklinksService";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  anchorsPageRequestSchema,
  backlinksOverviewInputSchema,
  backlinksRowsPageRequestSchema,
  referringDomainsPageRequestSchema,
  topPagesPageRequestSchema,
} from "@/types/schemas/backlinks";
import { OpenPageRankBacklinksService } from "@/server/features/backlinks/services/OpenPageRankBacklinksService";
import { AppError } from "@/server/lib/errors";

// The web UI exposes spam score as a regular user filter, so the implicit
// DataForSEO spam-score cutoff stays off for all web requests.
const WEB_SPAM_OPTIONS = { hideSpam: false };

async function resolveBacklinksCredential(
  input: { billingMode?: "standard" | "byok"; byokCredential?: string },
  organizationId: string,
): Promise<void> {
  if (input.billingMode === "byok" && !input.byokCredential?.trim()) {
    const { ByokRepository } = await import(
      "@/server/features/byok/repositories/ByokRepository"
    );
    const saved = await ByokRepository.getByOrganizationId(organizationId);
    if (!saved?.dataforseoApiKey) {
      throw new AppError(
        "VALIDATION_ERROR",
        "DataForSEO credential is required for BYOK live backlink research. Please save it in Settings > BYOK Integrations or provide it here.",
      );
    }
    input.byokCredential = saved.dataforseoApiKey;
  }
}

export const getBacklinksOverview = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(backlinksOverviewInputSchema)
  .handler(async ({ data, context }) => {
    if (data.provider === "basic") {
      const profile = await OpenPageRankBacklinksService.profileOverview({
        target: data.target,
      });
      return profile.overview;
    }
    await resolveBacklinksCredential(data, context.organizationId);
    const profile = await BacklinksService.profileOverview(
      {
        target: data.target,
        scope: data.scope,
        billingMode: data.billingMode,
        byokCredential: data.byokCredential,
      },
      context,
    );
    return profile.overview;
  });

export const getBacklinksRows = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(backlinksRowsPageRequestSchema)
  .handler(async ({ data, context }) => {
    await resolveBacklinksCredential(data, context.organizationId);
    return BacklinksService.profileBacklinksPage(
      data,
      context,
      WEB_SPAM_OPTIONS,
    );
  });

export const getBacklinksReferringDomains = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(referringDomainsPageRequestSchema)
  .handler(async ({ data, context }) => {
    await resolveBacklinksCredential(data, context.organizationId);
    return BacklinksService.profileReferringDomainsPage(
      data,
      context,
      WEB_SPAM_OPTIONS,
    );
  });

export const getBacklinksTopPages = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(topPagesPageRequestSchema)
  .handler(async ({ data, context }) => {
    await resolveBacklinksCredential(data, context.organizationId);
    return BacklinksService.profileTopPagesPage(data, context);
  });

export const getBacklinksAnchors = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(anchorsPageRequestSchema)
  .handler(async ({ data, context }) => {
    await resolveBacklinksCredential(data, context.organizationId);
    return BacklinksService.profileAnchorsPage(data, context, WEB_SPAM_OPTIONS);
  });
