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

function assertBacklinksBillingInput(input: {
  billingMode?: "standard" | "byok";
  byokCredential?: string;
}) {
  if (input.billingMode === "byok" && !input.byokCredential) {
    throw new AppError(
      "VALIDATION_ERROR",
      "DataForSEO credential is required for BYOK live backlink research.",
    );
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
    assertBacklinksBillingInput(data);
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
  .handler(({ data, context }) => {
    assertBacklinksBillingInput(data);
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
  .handler(({ data, context }) => {
    assertBacklinksBillingInput(data);
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
  .handler(({ data, context }) => {
    assertBacklinksBillingInput(data);
    return BacklinksService.profileTopPagesPage(data, context);
  });

export const getBacklinksAnchors = createServerFn({
  method: "POST",
})
  .middleware([requireProjectContext])
  .validator(anchorsPageRequestSchema)
  .handler(({ data, context }) => {
    assertBacklinksBillingInput(data);
    return BacklinksService.profileAnchorsPage(data, context, WEB_SPAM_OPTIONS);
  });
