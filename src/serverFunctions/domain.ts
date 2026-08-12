import { createServerFn } from "@tanstack/react-start";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  domainOverviewSchema,
  domainKeywordSuggestionsSchema,
  domainKeywordsPageRequestSchema,
  domainPagesPageRequestSchema,
} from "@/types/schemas/domain";
import { DomainService } from "@/server/features/domain/services/DomainService";
import { resolveLabsMarket } from "@/shared/keyword-locations";

function shouldUseDomainE2eFixtures() {
  // During E2E testing (BYPASS_AUTH=true), always use fixtures to avoid
  // hitting the real DataForSEO API and burning credits.
  return (
    import.meta.env.VITE_E2E_DOMAIN_FIXTURES === "1" ||
    import.meta.env.BYPASS_AUTH === "true"
  );
}

async function getDomainE2eFixtures() {
  return import("../../e2e/fixtures/domain-overview-fixtures");
}

export const getDomainOverview = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(domainOverviewSchema)
  .handler(async ({ data, context }) => {
    const input = {
      ...data,
      ...resolveLabsMarket(data, context.project),
      projectId: context.projectId,
    };
    const useFixtures = shouldUseDomainE2eFixtures();
    console.log(
      `[getDomainOverview] domain=${input.domain} useFixtures=${useFixtures} BYPASS_AUTH=${import.meta.env.BYPASS_AUTH} VITE_E2E=${import.meta.env.VITE_E2E_DOMAIN_FIXTURES}`,
    );
    if (useFixtures) {
      const fixtures = await getDomainE2eFixtures();
      return fixtures.getFixtureOverview(input.domain);
    }

    return DomainService.getOverview(input, context);
  });

export const getDomainKeywordSuggestions = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(domainKeywordSuggestionsSchema)
  .handler(async ({ data, context }) =>
    DomainService.getSuggestedKeywords(
      {
        ...data,
        ...resolveLabsMarket(data, context.project),
        organizationId: context.organizationId,
        projectId: context.projectId,
      },
      context,
    ),
  );

export const getDomainKeywordsPage = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(domainKeywordsPageRequestSchema)
  .handler(async ({ data, context }) => {
    const input = {
      ...data,
      ...resolveLabsMarket(data, context.project),
      projectId: context.projectId,
    };
    if (shouldUseDomainE2eFixtures()) {
      const fixtures = await getDomainE2eFixtures();
      return fixtures.getFixtureKeywordsPage(input);
    }

    return DomainService.getKeywordsPage(input, context);
  });

export const getDomainPagesPage = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(domainPagesPageRequestSchema)
  .handler(async ({ data, context }) => {
    const input = {
      ...data,
      ...resolveLabsMarket(data, context.project),
      projectId: context.projectId,
    };
    if (shouldUseDomainE2eFixtures()) {
      const fixtures = await getDomainE2eFixtures();
      return fixtures.getFixturePagesPage(input);
    }

    return DomainService.getPagesPage(input, context);
  });
