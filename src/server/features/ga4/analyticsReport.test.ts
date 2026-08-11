import { describe, expect, it } from "vitest";
import type { Ga4ReportResponse, Ga4ReportRow } from "@/server/lib/ga4Client";
import {
  addTotals,
  percentDelta,
  readMetrics,
  sumTotals,
  toDimensionRows,
  toTrendPoints,
  ZERO_GA4_TOTALS,
} from "@/server/features/ga4/analyticsReport";

// metricHeaders in the canonical GA4_METRICS order, so readMetrics finds by name.
const HEADERS = [
  { name: "sessions" },
  { name: "totalUsers" },
  { name: "newUsers" },
  { name: "engagedSessions" },
  { name: "engagementRate" },
  { name: "averageSessionDuration" },
  { name: "screenPageViews" },
  { name: "conversions" },
];

function row(dim: string, values: number[]): Ga4ReportRow {
  return {
    dimensionValues: [{ value: dim }],
    metricValues: values.map((value) => ({ value: String(value) })),
  };
}

function totals(values: number[]): Ga4ReportResponse {
  return {
    metricHeaders: HEADERS,
    totals: [
      { metricValues: values.map((value) => ({ value: String(value) })) },
    ],
    rows: [],
  };
}

describe("readMetrics", () => {
  it("reads the eight metrics aligned to metricHeaders by name", () => {
    const response: Ga4ReportResponse = {
      metricHeaders: HEADERS,
      rows: [
        // sessions=100, totalUsers=80, newUsers=20, engagedSessions=60,
        // engagementRate=0.6, averageSessionDuration=42.5, screenPageViews=300,
        // conversions=5
        row("Organic Search", [100, 80, 20, 60, 0.6, 42.5, 300, 5]),
      ],
    };
    expect(readMetrics(response, response.rows![0])).toEqual({
      sessions: 100,
      totalUsers: 80,
      newUsers: 20,
      engagedSessions: 60,
      engagementRate: 0.6,
      averageSessionDuration: 42.5,
      screenPageViews: 300,
      conversions: 5,
    });
  });

  it("treats a missing header as zero, not NaN", () => {
    const response: Ga4ReportResponse = {
      metricHeaders: [{ name: "sessions" }],
      rows: [row("c", [7])],
    };
    expect(readMetrics(response, response.rows![0])).toEqual({
      ...ZERO_GA4_TOTALS,
      sessions: 7,
    });
  });
});

describe("sumTotals", () => {
  it("prefers the TOTAL aggregation when present", () => {
    expect(sumTotals(totals([100, 80, 20, 60, 0.6, 42.5, 300, 5]))).toEqual({
      sessions: 100,
      totalUsers: 80,
      newUsers: 20,
      engagedSessions: 60,
      engagementRate: 0.6,
      averageSessionDuration: 42.5,
      screenPageViews: 300,
      conversions: 5,
    });
  });

  it("folds rows when no aggregation is present", () => {
    const response: Ga4ReportResponse = {
      metricHeaders: HEADERS,
      rows: [
        row("a", [10, 8, 2, 6, 0.6, 10, 30, 1]),
        row("b", [20, 16, 4, 12, 0.6, 50, 60, 2]),
      ],
    };
    const result = sumTotals(response);
    expect(result.sessions).toBe(30);
    expect(result.totalUsers).toBe(24);
    // engagementRate recomputed from summed engaged sessions / sessions.
    expect(result.engagementRate).toBeCloseTo((6 + 12) / 30, 5);
  });

  it("returns zero totals for an empty response", () => {
    expect(sumTotals({ metricHeaders: HEADERS, rows: [] })).toEqual(
      ZERO_GA4_TOTALS,
    );
  });
});

describe("addTotals", () => {
  it("recomputes session-derived ratios rather than summing them", () => {
    const a = {
      ...ZERO_GA4_TOTALS,
      sessions: 10,
      engagedSessions: 6,
      averageSessionDuration: 10,
      engagementRate: 0.6,
    };
    const b = {
      ...ZERO_GA4_TOTALS,
      sessions: 30,
      engagedSessions: 12,
      averageSessionDuration: 50,
      engagementRate: 0.4,
    };
    const out = addTotals(a, b);
    expect(out.sessions).toBe(40);
    expect(out.engagedSessions).toBe(18);
    expect(out.engagementRate).toBeCloseTo(18 / 40, 5);
    // weighted average session duration: (10*10 + 50*30) / 40
    expect(out.averageSessionDuration).toBeCloseTo((100 + 1500) / 40, 5);
  });
});

describe("toDimensionRows", () => {
  it("flattens single-dimension rows to keyed rows with full metrics", () => {
    const response: Ga4ReportResponse = {
      metricHeaders: HEADERS,
      rows: [row("Organic Search", [100, 80, 20, 60, 0.6, 42.5, 300, 5])],
    };
    expect(toDimensionRows(response)).toHaveLength(1);
    expect(toDimensionRows(response)[0].key).toBe("Organic Search");
    expect(toDimensionRows(response)[0].metrics.sessions).toBe(100);
  });

  it("skips rows missing a dimension value", () => {
    const response: Ga4ReportResponse = {
      metricHeaders: HEADERS,
      rows: [{ dimensionValues: [], metricValues: [{ value: "1" }] }],
    };
    expect(toDimensionRows(response)).toEqual([]);
  });
});

describe("toTrendPoints", () => {
  it("normalizes YYYYMMDD to YYYY-MM-DD and sorts ascending", () => {
    const response: Ga4ReportResponse = {
      metricHeaders: [{ name: "sessions" }],
      rows: [
        {
          dimensionValues: [{ value: "20240103" }],
          metricValues: [{ value: "3" }],
        },
        {
          dimensionValues: [{ value: "20240101" }],
          metricValues: [{ value: "1" }],
        },
      ],
    };
    const points = toTrendPoints(response);
    expect(points.map((p) => p.date)).toEqual(["2024-01-01", "2024-01-03"]);
    expect(points[0].metrics.sessions).toBe(1);
  });
});

describe("percentDelta", () => {
  it("returns null when the previous value is zero", () => {
    expect(percentDelta(10, 0)).toBeNull();
  });
  it("computes the signed fraction change", () => {
    expect(percentDelta(120, 100)).toBeCloseTo(0.2, 5);
    expect(percentDelta(80, 100)).toBeCloseTo(-0.2, 5);
  });
});
