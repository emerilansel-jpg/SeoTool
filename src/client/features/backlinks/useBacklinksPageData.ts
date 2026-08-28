import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  BacklinksPageProps,
  BacklinksSearchState,
} from "./backlinksPageTypes";
import {
  getErrorCode,
  getStandardErrorMessage,
} from "@/client/lib/error-messages";
import {
  getBacklinksAnchors,
  getBacklinksOverview,
  getBacklinksReferringDomains,
  getBacklinksRows,
  getBacklinksTopPages,
} from "@/serverFunctions/backlinks";
import {
  BACKLINKS_DEFAULT_SORT,
  anchorsSortFieldSchema,
  backlinksRowsSortFieldSchema,
  referringDomainsSortFieldSchema,
  topPagesSortFieldSchema,
  type BacklinksSortOrder,
} from "@/types/schemas/backlinks";
import {
  toAnchorsFiltersPayload,
  toBacklinksFiltersPayload,
  toReferringDomainsFiltersPayload,
  toTopPagesFiltersPayload,
} from "./backlinksFilterTypes";
import type { BacklinksFiltersState } from "./useBacklinksFilters";
import { getPersistedBacklinksSearchScope } from "./backlinksSearchScope";

type UseBacklinksPageDataArgs = {
  projectId: string;
  searchState: BacklinksSearchState;
  filters: BacklinksFiltersState;
  billingMode: "standard" | "byok";
  byokCredential: string;
};

// Five-minute client staleness on top of the server's 6h R2 cache, so window
// refocus doesn't re-run the server functions for bytes that can't change.
const BACKLINKS_QUERY_STALE_TIME_MS = 5 * 60 * 1000;

function getBacklinksErrorMessage(
  error: unknown,
  fallback: string,
): string | null {
  if (!error) return null;
  if (getErrorCode(error) === "VALIDATION_ERROR") {
    return "Enter a valid domain or page URL.";
  }

  return getStandardErrorMessage(error, fallback);
}

/**
 * Maps the URL's sort/order params to a request's sortField/sortOrder pair.
 * The sort param is checked against the tab's allowed sort fields; anything
 * unexpected falls back to the tab's default sort.
 */
function toSort<T extends string>(
  sortParam: string | undefined,
  orderParam: BacklinksSortOrder | undefined,
  allowedFields: readonly T[],
  fallback: { field: T; order: BacklinksSortOrder },
): { field: T; order: BacklinksSortOrder } {
  const field = sortParam
    ? allowedFields.find((candidate) => candidate === sortParam)
    : undefined;
  if (!field) return fallback;
  return { field, order: orderParam ?? "desc" };
}

export function useBacklinksPageData({
  projectId,
  searchState,
  filters,
  billingMode,
  byokCredential,
}: UseBacklinksPageDataArgs) {
  const searchCardInitialValues = useMemo(
    () => ({
      target: searchState.target,
      scope: searchState.scope,
    }),
    [searchState.scope, searchState.target],
  );

  const { target, scope, tab, page, pageSize, sort, order, view } = searchState;
  const rowsMode = view === "all" ? "as_is" : "one_per_domain";
  const targetReady = Boolean(target);
  const billingReady =
    searchState.provider === "basic" ||
    billingMode === "standard" ||
    byokCredential.trim().length >= 8;
  const baseQueryKeyParts = [
    projectId,
    searchState.provider,
    scope,
    target,
  ] as const;
  const pageInputBase = { projectId, target, scope, page, pageSize };
  const billingInput = {
    billingMode,
    byokCredential:
      billingMode === "byok" ? byokCredential.trim() || undefined : undefined,
  } as const;

  const overviewQuery = useQuery({
    queryKey: ["backlinksOverview", ...baseQueryKeyParts],
    enabled: targetReady && billingReady,
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () =>
      getBacklinksOverview({
        data: {
          projectId,
          target,
          scope,
          provider: searchState.provider,
          ...billingInput,
        },
      }),
  });

  const rowsSort = toSort(
    sort,
    order,
    backlinksRowsSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.backlinks,
  );
  const rowsFilters = useMemo(
    () => toBacklinksFiltersPayload(filters.backlinks.values),
    [filters.backlinks.values],
  );
  const rowsQuery = useQuery({
    queryKey: [
      "backlinksRows",
      ...baseQueryKeyParts,
      page,
      pageSize,
      rowsSort.field,
      rowsSort.order,
      rowsFilters,
      rowsMode,
    ],
    enabled:
      targetReady &&
      billingReady &&
      searchState.provider === "live" &&
      tab === "backlinks",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () =>
      getBacklinksRows({
        data: {
          ...pageInputBase,
          ...billingInput,
          sortField: rowsSort.field,
          sortOrder: rowsSort.order,
          filters: rowsFilters,
          mode: rowsMode,
        },
      }),
  });

  const domainsSort = toSort(
    sort,
    order,
    referringDomainsSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.domains,
  );
  const domainsFilters = useMemo(
    () => toReferringDomainsFiltersPayload(filters.domains.values),
    [filters.domains.values],
  );
  const referringDomainsQuery = useQuery({
    queryKey: [
      "backlinksReferringDomains",
      ...baseQueryKeyParts,
      page,
      pageSize,
      domainsSort.field,
      domainsSort.order,
      domainsFilters,
    ],
    enabled:
      targetReady &&
      billingReady &&
      searchState.provider === "live" &&
      tab === "domains",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () =>
      getBacklinksReferringDomains({
        data: {
          ...pageInputBase,
          ...billingInput,
          sortField: domainsSort.field,
          sortOrder: domainsSort.order,
          filters: domainsFilters,
        },
      }),
  });

  const pagesSort = toSort(
    sort,
    order,
    topPagesSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.pages,
  );
  const pagesFilters = useMemo(
    () => toTopPagesFiltersPayload(filters.pages.values),
    [filters.pages.values],
  );
  const topPagesQuery = useQuery({
    queryKey: [
      "backlinksTopPages",
      ...baseQueryKeyParts,
      page,
      pageSize,
      pagesSort.field,
      pagesSort.order,
      pagesFilters,
    ],
    enabled:
      targetReady &&
      billingReady &&
      searchState.provider === "live" &&
      tab === "pages",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () =>
      getBacklinksTopPages({
        data: {
          ...pageInputBase,
          ...billingInput,
          sortField: pagesSort.field,
          sortOrder: pagesSort.order,
          filters: pagesFilters,
        },
      }),
  });

  const anchorsSort = toSort(
    sort,
    order,
    anchorsSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.anchors,
  );
  const anchorsFilters = useMemo(
    () => toAnchorsFiltersPayload(filters.anchors.values),
    [filters.anchors.values],
  );
  const anchorsQuery = useQuery({
    queryKey: [
      "backlinksAnchors",
      ...baseQueryKeyParts,
      page,
      pageSize,
      anchorsSort.field,
      anchorsSort.order,
      anchorsFilters,
    ],
    enabled:
      targetReady &&
      billingReady &&
      searchState.provider === "live" &&
      tab === "anchors",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () =>
      getBacklinksAnchors({
        data: {
          ...pageInputBase,
          ...billingInput,
          sortField: anchorsSort.field,
          sortOrder: anchorsSort.order,
          filters: anchorsFilters,
        },
      }),
  });

  // Toxic tab: reuses backlinks rows with high spam score filter
  const toxicSort = toSort(
    sort,
    order,
    backlinksRowsSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.toxic as {
      field: (typeof backlinksRowsSortFieldSchema.options)[number];
      order: BacklinksSortOrder;
    },
  );
  const toxicQuery = useQuery({
    queryKey: [
      "backlinksToxic",
      ...baseQueryKeyParts,
      page,
      pageSize,
      toxicSort.field,
      toxicSort.order,
    ],
    enabled:
      targetReady &&
      billingReady &&
      searchState.provider === "live" &&
      tab === "toxic",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () =>
      getBacklinksRows({
        data: {
          ...pageInputBase,
          ...billingInput,
          sortField: toxicSort.field,
          sortOrder: toxicSort.order,
          filters: { minSpamScore: 70 },
          mode: "one_per_domain",
        },
      }),
  });

  const overviewErrorMessage = getBacklinksErrorMessage(
    overviewQuery.error,
    "Could not load backlinks data.",
  );
  const activeTabQuery =
    tab === "backlinks"
      ? rowsQuery
      : tab === "domains"
        ? referringDomainsQuery
        : tab === "pages"
          ? topPagesQuery
          : tab === "anchors"
            ? anchorsQuery
            : toxicQuery;
  const activeTabErrorMessage = getBacklinksErrorMessage(
    activeTabQuery.error,
    "Could not load this tab.",
  );

  return {
    activeTabErrorMessage,
    activeTabQuery,
    overviewErrorMessage,
    overviewQuery,
    referringDomainsQuery,
    rowsQuery,
    searchCardInitialValues,
    topPagesQuery,
    anchorsQuery,
    toxicQuery,
  };
}

export function navigateToBacklinksSearch(
  navigate: BacklinksPageProps["navigate"],
  values: Pick<BacklinksSearchState, "target" | "scope"> & {
    provider?: BacklinksSearchState["provider"];
  },
) {
  navigate({
    search: (prev) => ({
      ...prev,
      target: values.target,
      scope: getPersistedBacklinksSearchScope(values.target, values.scope),
      provider: values.provider === "live" ? "live" : undefined,
      tab: undefined,
      page: undefined,
      sort: undefined,
      order: undefined,
    }),
    replace: true,
  });
}
