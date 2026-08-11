import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BacklinksPage } from "@/client/features/backlinks/BacklinksPage";
import { inferBacklinksSearchScopeFromTarget } from "@/client/features/backlinks/backlinksSearchScope";
import {
  DEFAULT_BACKLINKS_PAGE_SIZE,
  backlinksSearchSchema,
} from "@/types/schemas/backlinks";
import type { z } from "zod";

export const Route = createFileRoute("/_project/p/$projectId/backlinks")({
  validateSearch: backlinksSearchSchema,
  component: BacklinksRoute,
});

type Search = z.infer<typeof backlinksSearchSchema>;

function BacklinksRoute() {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
  const { projectId } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const {
    target = "",
    scope: rawScope,
    tab = "backlinks",
    page = 1,
    size = DEFAULT_BACKLINKS_PAGE_SIZE,
    sort,
    order,
    view,
  }: Search = Route.useSearch();
  const scope = rawScope ?? inferBacklinksSearchScopeFromTarget(target);

  return (
    <BacklinksPage
      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment
      projectId={projectId}
      navigate={navigate}
      searchState={{
        target,
        scope,
        tab,
        page,
        pageSize: size,
        sort,
        order,
        view,
      }}
    />
  );
}
