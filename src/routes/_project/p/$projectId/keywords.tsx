import { createFileRoute, redirect } from "@tanstack/react-router";
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
        <div className="mx-auto max-w-7xl space-y-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Keyword Research</h1>
              <span className="badge badge-primary badge-sm">PRO</span>
            </div>
            <p className="max-w-3xl text-sm text-base-content/70">
              Combine KGR, weak page-one signals and optional live backlink
              competition in one opportunity report.
            </p>
          </div>
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
