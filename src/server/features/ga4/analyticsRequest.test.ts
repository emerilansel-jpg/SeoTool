import { describe, expect, it } from "vitest";
import {
  buildReportRequest,
  previousPeriod,
  resolveDateRange,
} from "@/server/features/ga4/analyticsRequest";

// Fixed "today" so every range assertion is deterministic.
const TODAY = new Date(Date.UTC(2024, 0, 30)); // 2024-01-30

describe("resolveDateRange", () => {
  it("honors explicit start/end over a convenience range", () => {
    expect(
      resolveDateRange(
        {
          dateRange: "last_7_days",
          startDate: "2024-01-01",
          endDate: "2024-01-15",
        },
        TODAY,
      ),
    ).toEqual({ startDate: "2024-01-01", endDate: "2024-01-15" });
  });

  it("ends ranges one day before today to avoid GA4 data lag", () => {
    expect(resolveDateRange({ dateRange: "last_7_days" }, TODAY)).toEqual({
      startDate: "2024-01-23",
      endDate: "2024-01-29",
    });
  });

  it("defaults to the 28-day window", () => {
    expect(resolveDateRange({}, TODAY)).toEqual({
      startDate: "2024-01-02",
      endDate: "2024-01-29",
    });
  });

  it("subtracts calendar months for the *_months ranges", () => {
    // end is lag-adjusted to 2024-01-29 first, then 3 months back → 2023-10-29.
    expect(resolveDateRange({ dateRange: "last_3_months" }, TODAY)).toEqual({
      startDate: "2023-10-29",
      endDate: "2024-01-29",
    });
  });
});

describe("previousPeriod", () => {
  it("returns the same-length window immediately before the given range", () => {
    // 7-day window: 2024-01-23..2024-01-29 → previous 2024-01-16..2024-01-22
    expect(previousPeriod("2024-01-23", "2024-01-29")).toEqual({
      startDate: "2024-01-16",
      endDate: "2024-01-22",
    });
  });
});

describe("buildReportRequest", () => {
  it("builds a totals request with the TOTAL aggregation", () => {
    const request = buildReportRequest(
      { projectId: "p1", dateRange: "last_7_days", includeTotals: true },
      TODAY,
    );
    expect(request.dateRanges).toEqual([
      { startDate: "2024-01-23", endDate: "2024-01-29" },
    ]);
    expect(request.metricAggregations).toEqual(["TOTAL"]);
    expect(request.dimensions).toBeUndefined();
    expect(request.limit).toBeGreaterThan(0);
  });

  it("applies device and country as an AND dimensionFilter", () => {
    const request = buildReportRequest({
      projectId: "p1",
      dateRange: "last_7_days",
      dimensions: ["sessionDefaultChannelGroup"],
      filter: { device: "MOBILE", country: "usa" },
    });
    expect(request.dimensions).toEqual([
      { name: "sessionDefaultChannelGroup" },
    ]);
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- test assertion on GA4 filter shape
    const filter = request.dimensionFilter as {
      andGroup: {
        expressions: Array<{
          filter: {
            fieldName: string;
            stringFilter: { matchType: string; value: string };
          };
        }>;
      };
    };
    expect(
      filter.andGroup.expressions.map((e) => e.filter.fieldName).toSorted(),
    ).toEqual(["country", "deviceCategory"]);
  });

  it("omits dimensionFilter when no filter is set", () => {
    const request = buildReportRequest({
      projectId: "p1",
      dateRange: "last_7_days",
    });
    expect(request.dimensionFilter).toBeUndefined();
  });

  it("passes offset through for pagination", () => {
    const request = buildReportRequest({
      projectId: "p1",
      dateRange: "last_7_days",
      offset: 50,
    });
    expect(request.offset).toBe(50);
  });
});
