import { createServerFn } from "@tanstack/react-start";
import {
  Ga4NotConnectedError,
  Ga4Service,
  isExpectedGrantFailure,
} from "@/server/features/ga4/services/Ga4Service";
import {
  GA4_METRICS,
  resolveDateRange,
  previousPeriod,
  type Ga4ReportFilter,
  type Ga4Dimension,
} from "@/server/features/ga4/analyticsRequest";
import {
  sumTotals,
  toDimensionRows,
  toTrendPoints,
} from "@/server/features/ga4/analyticsReport";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  ga4InputSchema,
  ga4TableExportInputSchema,
  ga4TableInputSchema,
} from "@/types/schemas/ga4";

// Trend: one row per day; the longest range is ~92 days.
const TREND_LIMIT = 200;
// Channels: a small breakdown for the SEO-traffic highlight + pie.
const CHANNEL_LIMIT = 10;
const DEVICE_LIMIT = 10;
const COUNTRY_LIMIT = 25;
// Export pulls the whole dimension in one shot, capped.
const EXPORT_LIMIT = 1000;

function dimensionFor(dimension: "pages" | "channels"): Ga4Dimension {
  return dimension === "pages"
    ? "landingPagePlusQueryString"
    : "sessionDefaultChannelGroup";
}

/** Build GA4 filters shared by every call. Device applies everywhere; country
 *  applies everywhere except the country breakdown itself (so the dropdown keeps
 *  every option visible while one country is selected). Mirrors GSC. */
function buildFilters(data: { device?: string; country?: string }): {
  deviceFilters: Ga4ReportFilter;
  filters: Ga4ReportFilter;
} {
  const deviceFilters: Ga4ReportFilter = data.device
    ? // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- runtime string narrowed to device enum
      { device: data.device as Ga4ReportFilter["device"] }
    : {};
  const filters: Ga4ReportFilter = data.country
    ? { ...deviceFilters, country: data.country }
    : deviceFilters;
  return { deviceFilters, filters };
}

/** Not connected, or a dead/denied grant (token failure or 401/403): the page
 *  renders the connect card. Other statuses (429, 5xx) are real faults. */
function isExpectedConnectionFailure(error: unknown): boolean {
  return error instanceof Ga4NotConnectedError || isExpectedGrantFailure(error);
}

/**
 * The GA4 Insights overview: current + previous-period totals, the daily trend,
 * and the channel/device/country breakdowns. The pages/channels tables paginate
 * separately (getGa4ReportTable) so page-flips never re-run the overview. All
 * first-party GA4 data, free.
 */
export const getGa4Report = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(ga4InputSchema)
  .handler(async ({ data, context }) => {
    const { startDate, endDate } = resolveDateRange({
      dateRange: data.dateRange,
    });
    const prev = previousPeriod(startDate, endDate);
    const projectId = context.projectId;
    const { deviceFilters, filters } = buildFilters(data);

    try {
      const [current, previous, trend, channels, devices, countries] =
        await Promise.all([
          Ga4Service.getReport({
            projectId,
            dateRange: data.dateRange,
            filter: filters,
            metrics: [...GA4_METRICS],
            includeTotals: true,
          }),
          Ga4Service.getReport({
            projectId,
            startDate: prev.startDate,
            endDate: prev.endDate,
            filter: filters,
            metrics: [...GA4_METRICS],
            includeTotals: true,
          }),
          Ga4Service.getReport({
            projectId,
            dateRange: data.dateRange,
            filter: filters,
            dimensions: ["date"],
            limit: TREND_LIMIT,
          }),
          Ga4Service.getReport({
            projectId,
            dateRange: data.dateRange,
            filter: filters,
            dimensions: ["sessionDefaultChannelGroup"],
            limit: CHANNEL_LIMIT,
          }),
          Ga4Service.getReport({
            projectId,
            dateRange: data.dateRange,
            filter: filters,
            dimensions: ["deviceCategory"],
            limit: DEVICE_LIMIT,
          }),
          Ga4Service.getReport({
            projectId,
            dateRange: data.dateRange,
            filter: deviceFilters,
            dimensions: ["country"],
            limit: COUNTRY_LIMIT,
          }),
        ]);

      return {
        connected: true as const,
        propertyId: current.propertyId,
        propertyName: current.propertyName,
        connectedBy: current.connectedBy,
        range: {
          startDate,
          endDate,
          prevStartDate: prev.startDate,
          prevEndDate: prev.endDate,
        },
        totals: sumTotals(current.response),
        prevTotals: sumTotals(previous.response),
        trend: toTrendPoints(trend.response),
        channels: toDimensionRows(channels.response),
        devices: toDimensionRows(devices.response),
        countries: toDimensionRows(countries.response),
      };
    } catch (error) {
      if (isExpectedConnectionFailure(error)) {
        return { connected: false as const };
      }
      throw error;
    }
  });

/**
 * One page of the pages or channels table, paginated server-side against GA4 via
 * `offset` so it scales to large properties. GA4 returns a rowCount, but we fetch
 * one extra row to detect a next page (keeps the contract identical to GSC). All
 * first-party GA4 data, free.
 */
export const getGa4ReportTable = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(ga4TableInputSchema)
  .handler(async ({ data, context }) => {
    const { startDate, endDate } = resolveDateRange({
      dateRange: data.dateRange,
    });
    const { filters } = buildFilters(data);
    const offset = (data.page - 1) * data.pageSize;

    try {
      const result = await Ga4Service.getReport({
        projectId: context.projectId,
        startDate,
        endDate,
        filter: filters,
        dimensions: [dimensionFor(data.dimension)],
        limit: data.pageSize + 1,
        offset,
      });

      const fetched = toDimensionRows(result.response);
      const hasNextPage = fetched.length > data.pageSize;
      const rows = hasNextPage ? fetched.slice(0, data.pageSize) : fetched;

      return {
        connected: true as const,
        dimension: data.dimension,
        page: data.page,
        pageSize: data.pageSize,
        hasNextPage,
        rows,
      };
    } catch (error) {
      if (isExpectedConnectionFailure(error)) {
        return { connected: false as const };
      }
      throw error;
    }
  });

/**
 * The full pages/channels dataset for CSV/Sheets export (capped at
 * EXPORT_LIMIT), rather than only the visible page.
 */
export const exportGa4ReportTable = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(ga4TableExportInputSchema)
  .handler(async ({ data, context }) => {
    const { startDate, endDate } = resolveDateRange({
      dateRange: data.dateRange,
    });
    const { filters } = buildFilters(data);

    const result = await Ga4Service.getReport({
      projectId: context.projectId,
      startDate,
      endDate,
      filter: filters,
      dimensions: [dimensionFor(data.dimension)],
      limit: EXPORT_LIMIT,
    });

    return {
      dimension: data.dimension,
      rows: toDimensionRows(result.response),
    };
  });
