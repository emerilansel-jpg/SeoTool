import { buildCsv, type CsvValue, downloadCsv } from "@/client/lib/csv";

export type GmbGridReportDays = 7 | 30 | 365;

export interface GmbGridReportRow {
  runId: string;
  configId: string;
  date: string;
  startedAt: string;
  completedAt: string | null;
  businessName: string;
  keyword: string;
  gridSize: number;
  radiusMeters: number;
  status: string;
  solv: number | null;
  averageRank: number | null;
  foundCoverage: number;
  top3: number;
  top10: number;
  top20: number;
  completedPoints: number;
  failedPoints: number;
  totalPoints: number;
  costUsd: number;
}

export interface GmbGridReportData {
  range: {
    startDate: string;
    endDate: string;
  };
  rows: GmbGridReportRow[];
}

export interface GmbGridReportSummary {
  totalRuns: number;
  averageSolv: number | null;
  averageRank: number | null;
  averageCoverage: number | null;
  totalCostUsd: number;
}

export const GMB_GRID_REPORT_PERIODS: ReadonlyArray<{
  days: GmbGridReportDays;
  label: string;
}> = [
  { days: 7, label: "Weekly" },
  { days: 30, label: "Monthly" },
  { days: 365, label: "Yearly" },
];

export function calculateGmbGridReportSummary(
  rows: GmbGridReportRow[],
): GmbGridReportSummary {
  if (rows.length === 0) {
    return {
      totalRuns: 0,
      averageSolv: null,
      averageRank: null,
      averageCoverage: null,
      totalCostUsd: 0,
    };
  }

  const solvRows = rows.filter((r) => r.solv != null);
  const avgSolv =
    solvRows.length > 0
      ? Math.round(
          solvRows.reduce((acc, r) => acc + (r.solv ?? 0), 0) / solvRows.length,
        )
      : null;

  const rankRows = rows.filter((r) => r.averageRank != null);
  const avgRank =
    rankRows.length > 0
      ? Number(
          (
            rankRows.reduce((acc, r) => acc + (r.averageRank ?? 0), 0) /
            rankRows.length
          ).toFixed(1),
        )
      : null;

  const avgCoverage = Math.round(
    rows.reduce((acc, r) => acc + r.foundCoverage, 0) / rows.length,
  );

  const totalCost = Number(
    rows.reduce((acc, r) => acc + r.costUsd, 0).toFixed(4),
  );

  return {
    totalRuns: rows.length,
    averageSolv: avgSolv,
    averageRank: avgRank,
    averageCoverage: avgCoverage,
    totalCostUsd: totalCost,
  };
}

export function buildGmbGridReportExport(
  data: GmbGridReportData,
  days: GmbGridReportDays,
): { headers: string[]; rows: CsvValue[][] } {
  const periodLabel =
    GMB_GRID_REPORT_PERIODS.find((p) => p.days === days)?.label ??
    `${days} days`;
  const summary = calculateGmbGridReportSummary(data.rows);

  const summaryRows: CsvValue[][] = [
    ["Report", "Reporting period", periodLabel, "", days, "", "", ""],
    [
      "Report",
      "Date range",
      `${data.range.startDate} to ${data.range.endDate}`,
      "",
      "",
      "",
      "",
      "",
    ],
    ["Summary", "Total scans", summary.totalRuns, "", "", "", "", ""],
    [
      "Summary",
      "Average SoLV (Top 3)",
      summary.averageSolv ?? "",
      "percent",
      "",
      "",
      "",
      "",
    ],
    [
      "Summary",
      "Average rank (ATRP)",
      summary.averageRank ?? "",
      "position",
      "",
      "",
      "",
      "",
    ],
    [
      "Summary",
      "Average coverage",
      summary.averageCoverage ?? "",
      "percent",
      "",
      "",
      "",
      "",
    ],
    [
      "Summary",
      "Total estimated cost",
      summary.totalCostUsd,
      "USD",
      "",
      "",
      "",
      "",
    ],
  ];

  const detailRows: CsvValue[][] = data.rows.map((row) => [
    "Scan",
    row.keyword,
    row.businessName,
    row.date,
    row.status,
    row.solv ?? "",
    row.averageRank ?? "",
    row.foundCoverage,
    row.top3,
    row.top10,
    row.top20,
    row.completedPoints,
    row.failedPoints,
    row.totalPoints,
    row.costUsd,
    row.gridSize,
    row.radiusMeters,
    row.runId,
  ]);

  return {
    headers: [
      "Section",
      "Keyword",
      "Business name",
      "Date",
      "Status",
      "SoLV (%)",
      "Avg rank",
      "Coverage (%)",
      "Top 3 pins",
      "Top 10 pins",
      "Top 20 pins",
      "Completed pins",
      "Failed pins",
      "Total pins",
      "Cost (USD)",
      "Grid size",
      "Radius (m)",
      "Run ID",
    ],
    rows: summaryRows.concat(detailRows),
  };
}

export function downloadGmbGridReportCsv(
  data: GmbGridReportData,
  days: GmbGridReportDays,
): void {
  const table = buildGmbGridReportExport(data, days);
  downloadCsv(
    `local-map-rank-report-${days}d.csv`,
    buildCsv(table.headers, table.rows),
  );
}
