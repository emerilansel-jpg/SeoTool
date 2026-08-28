import { useMemo } from "react";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { BacklinksOverviewPanels } from "./BacklinksOverviewPanels";
import { BacklinksResultsCard } from "./BacklinksPageSections";
import {
  BacklinksErrorState,
  BacklinksLoadingState,
} from "./BacklinksPageStates";
import { BacklinksHistorySection } from "./BacklinksHistorySection";
import type { BacklinksSearchHistoryItem } from "@/client/hooks/useBacklinksSearchHistory";
import type {
  BacklinksAnchorsData,
  BacklinksOverviewData,
  BacklinksReferringDomainsData,
  BacklinksRowsPageData,
  BacklinksSearchState,
  BacklinksTabRows,
  BacklinksTopPagesData,
} from "./backlinksPageTypes";
import type { BacklinksRowsPageResult } from "@/server/features/backlinks/services/backlinksOverviewSchema";
import { buildSummaryStats } from "./backlinksPageUtils";
import type { BacklinksDomainExpansion } from "./useBacklinksDomainExpansion";
import type { BacklinksFiltersState } from "./useBacklinksFilters";
import {
  SearchTabStrip,
  type SearchTab,
} from "@/client/features/search-tabs/SearchTabStrip";

type BacklinksBodyProps = {
  projectId: string;
  history: BacklinksSearchHistoryItem[];
  historyLoaded: boolean;
  overviewData: BacklinksOverviewData | undefined;
  overviewError: string | null;
  overviewLoading: boolean;
  backlinksRowsPage: BacklinksRowsPageData | undefined;
  referringDomainsPage: BacklinksReferringDomainsData | undefined;
  topPagesPage: BacklinksTopPagesData | undefined;
  anchorsPage: BacklinksAnchorsData | undefined;
  toxicPage: BacklinksRowsPageResult | undefined;
  searchState: BacklinksSearchState;
  filters: BacklinksFiltersState;
  sorting: SortingState;
  domainExpansion: BacklinksDomainExpansion;
  tabErrorMessage: string | null;
  tabLoading: boolean;
  tabFetching: boolean;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
  onRemoveHistoryItem: (timestamp: number) => void;
  onRetryOverview: () => void;
  onSortingChange: OnChangeFn<SortingState>;
  onTabChange: (tab: BacklinksSearchState["tab"]) => void;
  onViewChange: (view: "all" | undefined) => void;
  searchTabs: {
    activeTabId: string | null;
    tabs: SearchTab[];
    onSelect: (tab: SearchTab) => void;
    onClose: (tabId: string) => void;
    onViewed: (tabId: string, when?: number) => void;
  } | null;
};

export function BacklinksBody({
  projectId,
  history,
  historyLoaded,
  overviewData,
  overviewError,
  overviewLoading,
  backlinksRowsPage,
  referringDomainsPage,
  topPagesPage,
  anchorsPage,
  toxicPage,
  searchState,
  filters,
  sorting,
  domainExpansion,
  tabErrorMessage,
  tabLoading,
  tabFetching,
  onPageChange,
  onPageSizeChange,
  onRemoveHistoryItem,
  onRetryOverview,
  onSortingChange,
  onTabChange,
  onViewChange,
  searchTabs,
}: BacklinksBodyProps) {
  const tabRows = useMemo<BacklinksTabRows>(
    () => ({
      backlinks: backlinksRowsPage?.rows ?? [],
      referringDomains: referringDomainsPage?.rows ?? [],
      topPages: topPagesPage?.rows ?? [],
      anchors: anchorsPage?.rows ?? [],
    }),
    [backlinksRowsPage, referringDomainsPage, topPagesPage, anchorsPage],
  );
  const activeTabPage =
    searchState.tab === "backlinks"
      ? backlinksRowsPage
      : searchState.tab === "domains"
        ? referringDomainsPage
        : searchState.tab === "pages"
          ? topPagesPage
          : searchState.tab === "anchors"
            ? anchorsPage
            : toxicPage;
  const summaryStats = useMemo(
    () => buildSummaryStats(overviewData),
    [overviewData],
  );
  const tabStrip = searchTabs ? (
    <SearchTabStrip
      projectId={projectId}
      activeTabId={searchTabs.activeTabId}
      tabs={searchTabs.tabs}
      onSelect={searchTabs.onSelect}
      onClose={searchTabs.onClose}
      onViewed={searchTabs.onViewed}
    />
  ) : null;

  if (!searchState.target) {
    return (
      <BacklinksHistorySection
        projectId={projectId}
        history={history}
        historyLoaded={historyLoaded}
        onRemoveHistoryItem={onRemoveHistoryItem}
      />
    );
  }

  if (overviewLoading) {
    return (
      <>
        {tabStrip}
        <BacklinksLoadingState />
      </>
    );
  }

  if (!overviewData) {
    return (
      <>
        {tabStrip}
        <BacklinksErrorState
          errorMessage={overviewError}
          onRetry={onRetryOverview}
        />
      </>
    );
  }

  return (
    <>
      {tabStrip}
      <BacklinksOverviewPanels
        projectId={projectId}
        data={overviewData}
        summaryStats={summaryStats}
      />
      {searchState.provider === "basic" ? (
        <div className="alert alert-info text-sm">
          <span>
            Basic mode intentionally shows aggregate domain signals only. It
            does not invent individual links, anchors, toxic scores or top
            pages. Switch to <strong>Live detailed</strong> for that evidence.
          </span>
        </div>
      ) : (
        <BacklinksResultsCard
          projectId={projectId}
          activeTab={searchState.tab}
          tabRows={tabRows}
          toxicRows={toxicPage?.rows ?? []}
          filters={filters}
          sorting={sorting}
          view={searchState.view}
          domainExpansion={domainExpansion}
          isTabLoading={tabLoading}
          tabErrorMessage={tabErrorMessage}
          exportTarget={overviewData.displayTarget || searchState.target}
          pagination={{
            page: searchState.page,
            pageSize: searchState.pageSize,
            totalCount: activeTabPage?.totalCount ?? null,
            hasNextPage: activeTabPage?.hasMore ?? false,
            isFetching: tabFetching,
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSortingChange={onSortingChange}
          onTabChange={onTabChange}
          onViewChange={onViewChange}
        />
      )}
    </>
  );
}
