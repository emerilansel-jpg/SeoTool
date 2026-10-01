import { describe, expect, it } from "vitest";
import { buildCsv } from "@/client/lib/csv";
import {
  buildGmbGridReportExport,
  calculateGmbGridReportSummary,
  type GmbGridReportData,
} from "./gmbGridReportExport";

const sampleData: GmbGridReportData = {
  range: {
    startDate: "2026-09-01T00:00:00.000Z",
    endDate: "2026-09-30T23:59:59.999Z",
  },
  rows: [
    {
      runId: "run-1",
      configId: "cfg-1",
      date: "2026-09-10",
      startedAt: "2026-09-10T10:00:00.000Z",
      completedAt: "2026-09-10T10:05:00.000Z",
      businessName: "Acme Dental",
      keyword: "=dentist near me",
      gridSize: 7,
      radiusMeters: 5000,
      status: "completed",
      solv: 80,
      averageRank: 2.4,
      foundCoverage: 95,
      top3: 35,
      top10: 42,
      top20: 47,
      completedPoints: 49,
      failedPoints: 0,
      totalPoints: 49,
      costUsd: 0.147,
    },
    {
      runId: "run-2",
      configId: "cfg-1",
      date: "2026-09-20",
      startedAt: "2026-09-20T10:00:00.000Z",
      completedAt: "2026-09-20T10:06:00.000Z",
      businessName: "Acme Dental",
      keyword: "+teeth cleaning",
      gridSize: 7,
      radiusMeters: 5000,
      status: "partial",
      solv: 60,
      averageRank: 3.8,
      foundCoverage: 85,
      top3: 20,
      top10: 30,
      top20: 40,
      completedPoints: 45,
      failedPoints: 4,
      totalPoints: 49,
      costUsd: 0.147,
    },
  ],
};

describe("gmbGridReportExport", () => {
  it("calculates summary averages across runs accurately", () => {
    const summary = calculateGmbGridReportSummary(sampleData.rows);
    expect(summary.totalRuns).toBe(2);
    expect(summary.averageSolv).toBe(70);
    expect(summary.averageRank).toBe(3.1);
    expect(summary.averageCoverage).toBe(90);
    expect(summary.totalCostUsd).toBe(0.294);
  });

  it("builds structured CSV export with period and scan details", () => {
    const exportData = buildGmbGridReportExport(sampleData, 30);
    expect(exportData.headers).toContain("SoLV (%)");
    expect(exportData.headers).toContain("Avg rank");

    const csv = buildCsv(exportData.headers, exportData.rows);
    expect(csv).toContain('"\'=dentist near me"');
    expect(csv).toContain('"\'+teeth cleaning"');
    expect(csv).toContain('"Acme Dental"');
    expect(csv).toContain('"Monthly"');
  });
});
