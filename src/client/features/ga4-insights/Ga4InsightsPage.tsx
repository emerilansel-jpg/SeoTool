import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Download, Loader2, Sheet } from "lucide-react";
import { toast } from "sonner";
import { TableExportMenu } from "@/client/components/table/TableBulkActionBar";
import { TablePagination } from "@/client/components/table/TablePagination";
import { Ga4ConnectionCard } from "@/client/features/ga4/Ga4ConnectionCard";
import { Ga4InsightsLoadingState } from "@/client/features/ga4-insights/Ga4InsightsLoadingState";
import {
  BreakdownCard,
  DimensionTable,
  exportDimensionRows,
  SessionsTrendChart,
  TabButton,
  TotalsCards,
  type ExportTarget,
  type Tab,
} from "@/client/features/ga4-insights/Ga4InsightsParts";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  exportGa4ReportTable,
  getGa4Report,
  getGa4ReportTable,
} from "@/serverFunctions/ga4Report";
import {
  GA4_INSIGHTS_DEVICES,
  GA4_DEFAULT_PAGE_SIZE,
  GA4_PAGE_SIZES,
  GA4_INSIGHTS_RANGES,
  type Ga4InsightsDateRange,
  type Ga4InsightsDevice,
  type Ga4TableDimension,
} from "@/types/schemas/ga4";

const RANGE_LABELS: Record<Ga4InsightsDateRange, string> = {
  last_7_days: "Last 7 days",
  last_28_days: "Last 28 days",
  last_3_months: "Last 3 months",
};

const RANGE_OPTIONS = GA4_INSIGHTS_RANGES.map((value) => ({
  value,
  label: RANGE_LABELS[value],
}));

const DEVICE_LABELS: Record<Ga4InsightsDevice, string> = {
  DESKTOP: "Desktop",
  MOBILE: "Mobile",
  TABLET: "Tablet",
};

const DEVICE_OPTIONS = GA4_INSIGHTS_DEVICES.map((value) => ({
  value,
  label: DEVICE_LABELS[value],
}));

// Sentinel "no filter" value for the selects; never sent to the server.
const ALL = "ALL";

function isDateRange(value: string): value is Ga4InsightsDateRange {
  return GA4_INSIGHTS_RANGES.some((option) => option === value);
}

function isDevice(value: string): value is Ga4InsightsDevice {
  return GA4_INSIGHTS_DEVICES.some((option) => option === value);
}

function tabDimension(tab: Tab): Ga4TableDimension {
  return tab;
}

function tabKeyLabel(tab: Tab): string {
  return tab === "pages" ? "Landing page" : "Channel";
}

type FilterInput = {
  dateRange: Ga4InsightsDateRange;
  device?: Ga4InsightsDevice;
  country?: string;
};

// Build the server filter payload: drop device/country when set to the ALL sentinel.
function buildFilterInput(
  range: Ga4InsightsDateRange,
  device: Ga4InsightsDevice | typeof ALL,
  country: string,
): FilterInput {
  return {
    dateRange: range,
    ...(device === ALL ? {} : { device }),
    ...(country === ALL ? {} : { country }),
  };
}

// Single source for the paginated table query, shared with the live query
// warm-on-connect prefetch so the keys can never drift apart.
function tableQueryOptions(
  projectId: string,
  dimension: Ga4TableDimension,
  page: number,
  pageSize: number,
  filterInput: FilterInput,
) {
  return queryOptions({
    queryKey: [
      "ga4ReportTable",
      projectId,
      dimension,
      page,
      pageSize,
      filterInput,
    ],
    queryFn: () =>
      getGa4ReportTable({
        data: { projectId, dimension, page, pageSize, ...filterInput },
      }),
  });
}

export function Ga4InsightsPage({ projectId }: { projectId: string }) {
  const [isChangingProperty, setIsChangingProperty] = React.useState(false);
  const queryClient = useQueryClient();
  const [range, setRange] = useState<Ga4InsightsDateRange>("last_28_days");
  const [device, setDevice] = useState<Ga4InsightsDevice | typeof ALL>(ALL);
  const [country, setCountry] = useState<string>(ALL);
  const [tab, setTab] = useState<Tab>("pages");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(GA4_DEFAULT_PAGE_SIZE);

  // Any change to the queryset (tab, filters, page size) restarts at page 1.
  useEffect(() => {
    setPage(1);
  }, [tab, range, device, country, pageSize]);

  const filterInput = buildFilterInput(range, device, country);

  const reportQuery = useQuery({
    queryKey: ["ga4Report", projectId, range, device, country],
    queryFn: () => getGa4Report({ data: { projectId, ...filterInput } }),
    placeholderData: keepPreviousData,
  });
  const report = reportQuery.data;

  const dimension = tabDimension(tab);
  const tableQuery = useQuery({
    ...tableQueryOptions(projectId, dimension, page, pageSize, filterInput),
    enabled: report?.connected === true,
    placeholderData: keepPreviousData,
  });
  const tableData = tableQuery.data;
  const tableRows = tableData?.connected ? tableData.rows : [];
  const hasNextPage = tableData?.connected ? tableData.hasNextPage : false;

  // Warm the Channels tab (first page) as soon as the report connects so the tab
  // opens instantly instead of showing a spinner. Free first-party GA4 data.
  useEffect(() => {
    if (report?.connected !== true) return;
    void queryClient.prefetchQuery(
      tableQueryOptions(
        projectId,
        "channels",
        1,
        GA4_DEFAULT_PAGE_SIZE,
        buildFilterInput(range, device, country),
      ),
    );
  }, [report?.connected, projectId, range, device, country, queryClient]);

  const handleExport = async (target: ExportTarget) => {
    if (!report?.connected) return;
    try {
      const data = await exportGa4ReportTable({
        data: { projectId, dimension, ...filterInput },
      });
      exportDimensionRows(dimension, data.rows, report.range, target);
    } catch (error) {
      toast.error(getStandardErrorMessage(error, "Export failed"));
    }
  };

  return (
    <div className="overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">GA4 Insights</h1>
            <p className="text-sm text-base-content/70">
              See this site&apos;s traffic, sessions, users, and engagement from
              Google Analytics 4.
            </p>
          </div>
          {report?.connected ? (
            <button
              type="button"
              onClick={() => setIsChangingProperty(true)}
              className="link link-hover shrink-0 self-start text-sm font-medium text-base-content/60 transition-colors hover:text-base-content sm:mt-1"
            >
              Change property
            </button>
          ) : null}
        </div>

        {reportQuery.isPending ? (
          <Ga4InsightsLoadingState />
        ) : reportQuery.isError ? (
          <div className="alert alert-error">
            <span className="text-sm">
              {getStandardErrorMessage(reportQuery.error)}
            </span>
          </div>
        ) : isChangingProperty ? (
          <div className="max-w-2xl space-y-4">
            <button 
              type="button" 
              className="btn btn-ghost btn-sm px-2 -ml-2"
              onClick={() => setIsChangingProperty(false)}
            >
              ← Back to Insights
            </button>
            <Ga4ConnectionCard projectId={projectId} />
          </div>
        ) : !report?.connected ? (
          <div className="max-w-2xl">
            <Ga4ConnectionCard projectId={projectId} />
          </div>
        ) : (
          <>
            <TotalsCards report={report} />

            <div className="rounded-xl border border-base-300 bg-base-100">
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
                <h2 className="text-sm font-semibold">Sessions over time</h2>
                {reportQuery.isFetching && !reportQuery.isPending ? (
                  <Loader2 className="size-4 animate-spin text-base-content/40" />
                ) : null}
              </div>
              <div className="p-4">
                <SessionsTrendChart trend={report.trend} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <BreakdownCard
                title="Traffic by channel"
                rows={report.channels}
                totalSessions={report.totals.sessions}
                highlightKey="Organic Search"
              />
              <BreakdownCard
                title="Sessions by device"
                rows={report.devices}
                totalSessions={report.totals.sessions}
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
              <div className="flex flex-col gap-3 border-b border-base-300 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div role="tablist" className="tabs tabs-border w-fit">
                  <TabButton
                    active={tab === "pages"}
                    onClick={() => setTab("pages")}
                    label="Pages"
                  />
                  <TabButton
                    active={tab === "channels"}
                    onClick={() => setTab("channels")}
                    label="Channels"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="select select-bordered select-sm w-36"
                    value={device}
                    onChange={(event) =>
                      setDevice(
                        isDevice(event.target.value) ? event.target.value : ALL,
                      )
                    }
                    aria-label="Device filter"
                  >
                    <option value={ALL}>All devices</option>
                    {DEVICE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered select-sm w-36"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    aria-label="Country filter"
                  >
                    <option value={ALL}>All countries</option>
                    {report.countries.map((row) => (
                      <option key={row.key} value={row.key}>
                        {row.key.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered select-sm w-36"
                    value={range}
                    onChange={(event) => {
                      if (isDateRange(event.target.value)) {
                        setRange(event.target.value);
                      }
                    }}
                    aria-label="Date range"
                  >
                    {RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <TableExportMenu
                    buttonClassName="btn btn-ghost btn-sm gap-1"
                    actions={[
                      {
                        label: "Export to Sheets",
                        icon: <Sheet className="size-4" />,
                        onClick: () => void handleExport("sheets"),
                      },
                      {
                        label: "Download CSV",
                        icon: <Download className="size-4" />,
                        onClick: () => void handleExport("csv"),
                      },
                    ]}
                  />
                </div>
              </div>

              {tableQuery.isPending ? (
                <div className="flex items-center gap-2 p-8 text-sm text-base-content/60">
                  <Loader2 className="size-4 animate-spin" /> Loading…
                </div>
              ) : tableQuery.isError ? (
                <div className="p-4">
                  <div className="alert alert-error">
                    <span className="text-sm">
                      {getStandardErrorMessage(tableQuery.error)}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4">
                    <DimensionTable
                      rows={tableRows}
                      keyLabel={tabKeyLabel(tab)}
                    />
                  </div>
                  <TablePagination
                    page={page}
                    pageSize={pageSize}
                    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- readonly tuple to mutable array
                    pageSizes={GA4_PAGE_SIZES as unknown as number[]}
                    totalCount={null}
                    hasNextPage={hasNextPage}
                    isLoading={tableQuery.isFetching}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
