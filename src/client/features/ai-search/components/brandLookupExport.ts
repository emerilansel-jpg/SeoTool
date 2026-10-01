import { buildCsv, type CsvValue, downloadCsv } from "@/client/lib/csv";
import { formatPlatformLabel } from "@/client/features/ai-search/platformLabels";
import type { BrandLookupResult } from "@/types/schemas/ai-search";

type CitationTab = "queries" | "pages";

export type BrandLookupReportDays = 7 | 30 | 365;

type PageRow = BrandLookupResult["topPages"][number];
type QueryRow = BrandLookupResult["topQueries"][number];

export const BRAND_LOOKUP_REPORT_PERIODS: ReadonlyArray<{
  days: BrandLookupReportDays;
  label: string;
}> = [
  { days: 7, label: "Weekly" },
  { days: 30, label: "Monthly" },
  { days: 365, label: "Yearly" },
];

export function buildBrandLookupExport(
  tab: CitationTab,
  sortedPages: PageRow[],
  sortedQueries: QueryRow[],
): { headers: string[]; rows: CsvValue[][] } {
  if (tab === "pages") {
    return {
      headers: [
        "URL",
        "Domain",
        "Platform",
        "Source mentions",
        "Source AI search volume",
        "Fetched-sample prompt examples",
      ],
      rows: sortedPages.map((row) => [
        row.url,
        row.domain ?? "",
        formatPlatformLabel(row.platform),
        row.mentions ?? "",
        row.capturedVolume ?? "",
        row.keywords.map((keyword) => keyword.question).join("; "),
      ]),
    };
  }
  return {
    headers: [
      "Query",
      "Platform",
      "AI search volume",
      "First seen",
      "Last seen",
    ],
    rows: sortedQueries.map((row) => [
      row.question,
      formatPlatformLabel(row.platform),
      row.aiSearchVolume ?? "",
      row.firstSeenAt ?? "",
      row.lastSeenAt ?? "",
    ]),
  };
}

export function downloadBrandLookupCsv(
  tab: CitationTab,
  resolvedTarget: string,
  table: { headers: string[]; rows: CsvValue[][] },
) {
  const slug = slugify(resolvedTarget);
  const filename =
    tab === "pages"
      ? `ai-brand-lookup-pages-${slug}.csv`
      : `ai-brand-lookup-queries-${slug}.csv`;
  downloadCsv(filename, buildCsv(table.headers, table.rows));
}

export function getBrandLookupReportMonthlyVolume(
  result: BrandLookupResult,
  days: BrandLookupReportDays,
): BrandLookupResult["monthlyVolume"] {
  const sorted = result.monthlyVolume.toSorted(
    (a, b) => a.year - b.year || a.month - b.month,
  );
  return sorted.slice(days === 365 ? -12 : -1);
}

export function buildBrandLookupReportExport(
  result: BrandLookupResult,
  days: BrandLookupReportDays,
): { headers: string[]; rows: CsvValue[][] } {
  const periodLabel =
    BRAND_LOOKUP_REPORT_PERIODS.find((period) => period.days === days)?.label ??
    `${days} days`;
  const rows: CsvValue[][] = [
    ["Report", "Reporting period", periodLabel, "", days, "", "", ""],
    ["Report", "Target", result.resolvedTarget, "", "", "", "", ""],
    ["Report", "Fetched at", "", "", "", "", result.fetchedAt, ""],
    [
      "Report",
      "Data cadence",
      "Monthly source update",
      "",
      "",
      "",
      "",
      days === 7
        ? "Weekly reporting uses the latest available monthly source data."
        : "Source data updates monthly.",
    ],
    [
      "Summary",
      "Total mentions",
      result.resolvedTarget,
      "",
      result.totalMentions ?? "",
      "",
      result.fetchedAt,
      "",
    ],
    [
      "Summary",
      "Total AI search volume",
      result.resolvedTarget,
      "",
      result.totalAiSearchVolume ?? "",
      "",
      result.fetchedAt,
      "",
    ],
  ];

  for (const platform of result.perPlatform) {
    rows.push(
      [
        "Platform",
        "Mentions",
        formatPlatformLabel(platform.platform),
        formatPlatformLabel(platform.platform),
        platform.status === "error" ? "" : (platform.mentions ?? ""),
        "",
        result.fetchedAt,
        platform.status,
      ],
      [
        "Platform",
        "AI search volume",
        formatPlatformLabel(platform.platform),
        formatPlatformLabel(platform.platform),
        platform.status === "error" ? "" : (platform.aiSearchVolume ?? ""),
        "",
        result.fetchedAt,
        platform.status,
      ],
    );
  }

  for (const entry of result.shareOfVoice?.entries ?? []) {
    rows.push([
      "Share of Voice",
      "Mention share",
      entry.label,
      result.shareOfVoice?.platforms.map(formatPlatformLabel).join("; ") ?? "",
      entry.mentions ?? "",
      entry.sharePct ?? "",
      result.fetchedAt,
      entry.isTarget ? "Target brand" : "Competitor",
    ]);
  }

  for (const entry of getBrandLookupReportMonthlyVolume(result, days)) {
    rows.push([
      "Monthly volume",
      "AI search volume",
      result.resolvedTarget,
      "",
      entry.volume ?? "",
      "",
      `${entry.year}-${String(entry.month).padStart(2, "0")}`,
      "",
    ]);
  }

  for (const query of result.topQueries) {
    rows.push([
      "Top query",
      "AI search volume",
      query.question,
      formatPlatformLabel(query.platform),
      query.aiSearchVolume ?? "",
      "",
      query.lastSeenAt ?? "",
      query.firstSeenAt ? `First seen ${query.firstSeenAt}` : "",
    ]);
  }

  for (const page of result.topPages) {
    rows.push([
      "Top page",
      "Source mentions",
      page.domain ?? page.url,
      formatPlatformLabel(page.platform),
      page.mentions ?? "",
      "",
      result.fetchedAt,
      [page.url, ...page.keywords.map((keyword) => keyword.question)].join(
        "; ",
      ),
    ]);
  }

  return {
    headers: [
      "Section",
      "Metric",
      "Item",
      "Platform",
      "Value",
      "Percent",
      "Date",
      "Details",
    ],
    rows,
  };
}

export function downloadBrandLookupReportCsv(
  result: BrandLookupResult,
  days: BrandLookupReportDays,
): void {
  const table = buildBrandLookupReportExport(result, days);
  downloadCsv(
    `ai-brand-lookup-report-${slugify(result.resolvedTarget) || "brand"}-${days}d.csv`,
    buildCsv(table.headers, table.rows),
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
