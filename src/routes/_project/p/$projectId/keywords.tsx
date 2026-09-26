import { createFileRoute, redirect } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { KeywordResearchPage } from "@/client/features/keywords/page/KeywordResearchPage";
import {
  isResultLimit,
  normalizeKeywordMode,
  normalizeLegacyKeywordSearch,
  normalizeSortDir,
  normalizeSortField,
} from "@/client/features/keywords/keywordSearchParams";
import { keywordsSearchSchema } from "@/types/schemas/keywords";
import type { z } from "zod";
import { KeywordResearchProPage } from "@/client/features/keywords-pro/KeywordResearchProPage";
import { KeywordResearchViewTabs } from "@/client/features/keywords/page/KeywordResearchViewTabs";

export const Route = createFileRoute("/_project/p/$projectId/keywords")({
  validateSearch: keywordsSearchSchema,
  beforeLoad: ({ params, search }) => {
    const { normalized, changed } = normalizeLegacyKeywordSearch(search);
    if (!changed) return;

    throw redirect({
      to: "/p/$projectId/keywords",
      params: { projectId: params.projectId },
      search: normalized,
      replace: true,
    });
  },
  component: KeywordResearchPageRoute,
});

type Search = z.infer<typeof keywordsSearchSchema>;

function KeywordResearchPageRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment -- TanStack Router params are typed via routeTree.gen.ts
  const { projectId } = Route.useParams();
  const search: Search = Route.useSearch();
  const {
    q: keywordInput = "",
    loc: locationCode,
    kLimit: resultLimit = 150,
    mode: keywordMode = "auto",
    sort: sortField = "searchVolume",
    order: sortDir = "desc",
  } = search;
  if (search.view === "pro") {
    return (
      <div className="overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
        <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
          <FeatureHeader
            icon={Search}
            title="Keyword Research"
            badge="Keyword Golden Ratio & Deep SERP"
            description="Combine KGR, weak page-one signals and optional live backlink competition in one opportunity report."
          />
          <KeywordResearchViewTabs projectId={projectId} active="pro" />
          <KeywordResearchProPage projectId={projectId} />
        </div>
      </div>
    );
  }
  return (
    <KeywordResearchPage
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment -- typed via routeTree.gen.ts
      projectId={projectId}
      keywordInput={keywordInput}
      locationCode={locationCode}
      resultLimit={isResultLimit(resultLimit) ? resultLimit : 150}
      keywordMode={normalizeKeywordMode(keywordMode)}
      clickstream={search.cs ?? false}
      sortField={normalizeSortField(sortField)}
      sortDir={normalizeSortDir(sortDir)}
    />
  );
}
