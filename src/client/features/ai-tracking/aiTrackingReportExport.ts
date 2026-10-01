import { buildCsv, type CsvValue, downloadCsv } from "@/client/lib/csv";
import type { AiTrackingDashboardData } from "@/types/schemas/ai-tracking";

export type AiTrackingReportDays = 7 | 30 | 365;

export const AI_TRACKING_REPORT_PERIODS: ReadonlyArray<{
  days: AiTrackingReportDays;
  label: string;
}> = [
  { days: 7, label: "Weekly" },
  { days: 30, label: "Monthly" },
  { days: 365, label: "Yearly" },
];

export function buildAiTrackingReportExport(
  data: AiTrackingDashboardData,
  days: AiTrackingReportDays,
  selectedPlatform: string,
): { headers: string[]; rows: CsvValue[][] } {
  const period =
    AI_TRACKING_REPORT_PERIODS.find((option) => option.days === days)?.label ??
    `${days} days`;
  const platform = formatPlatform(selectedPlatform);

  return {
    headers: [
      "Section",
      "Metric",
      "Item",
      "Platform",
      "Value",
      "Unit",
      "Details",
    ],
    rows: [
      ...getMetadataAndSummaryRows(data, period, platform, days),
      ...getTrendRows(data, platform),
      ...getCompetitorRows(data, platform),
      ...getSentimentRows(data, platform),
      ...getPromptRows(data, platform),
      ...getObservationRows(data),
    ],
  };
}

function getMetadataAndSummaryRows(
  data: AiTrackingDashboardData,
  period: string,
  platform: string,
  days: number,
): CsvValue[][] {
  const brand = data.config?.brandName ?? "";
  const domain = data.config?.domain ?? "";
  return [
    ["Report", "Reporting period", period, platform, days, "", ""],
    ["Report", "Brand", brand, platform, "", "", ""],
    ["Report", "Domain", domain, platform, "", "", ""],
    [
      "Summary",
      "Mention coverage",
      brand,
      platform,
      data.kpi.mentionCoveragePercent,
      "percent",
      `${data.kpi.brandMentions} of ${data.kpi.totalResponses} responses`,
    ],
    [
      "Summary",
      "Positive mentions",
      brand,
      platform,
      data.kpi.positiveMentionPercent,
      "percent",
      `${data.kpi.positiveMentions} of ${data.kpi.brandMentions} mentions`,
    ],
    [
      "Summary",
      "Average list position",
      brand,
      platform,
      data.kpi.averageListPosition ?? "",
      "position",
      `${data.kpi.listPositionSamples} ranked-list samples`,
    ],
    [
      "Summary",
      "Total responses",
      brand,
      platform,
      data.kpi.totalResponses,
      "responses",
      "",
    ],
    [
      "Summary",
      "Brand mentions",
      brand,
      platform,
      data.kpi.brandMentions,
      "mentions",
      "",
    ],
  ];
}

function getTrendRows(
  data: AiTrackingDashboardData,
  platform: string,
): CsvValue[][] {
  const brand = data.config?.brandName ?? "";
  const visibilityByDate = new Map(
    data.visibilityTrend.map((point) => [point.date, point.visibility]),
  );
  const positionByDate = new Map(
    data.positionTrend.map((point) => [point.date, point.position]),
  );
  const trendDates = Array.from(
    new Set([...visibilityByDate.keys(), ...positionByDate.keys()]),
  ).toSorted();

  return trendDates.flatMap((date) => [
    [
      "Trend",
      "Visibility",
      brand,
      platform,
      visibilityByDate.get(date) ?? "",
      "percent",
      date,
    ],
    [
      "Trend",
      "Average list position",
      brand,
      platform,
      positionByDate.get(date) ?? "",
      "position",
      date,
    ],
  ]);
}

function getCompetitorRows(
  data: AiTrackingDashboardData,
  platform: string,
): CsvValue[][] {
  return data.competitorRankings.flatMap((competitor) => [
    [
      "Competitor",
      "Mentions",
      competitor.domain,
      platform,
      competitor.mentionsCount,
      "mentions",
      competitor.isTargetBrand ? "Target brand" : competitor.brandName,
    ],
    [
      "Competitor",
      "Visibility",
      competitor.domain,
      platform,
      competitor.visibilityPct,
      "percent",
      `Average position ${competitor.avgPosition}`,
    ],
  ]);
}

function getSentimentRows(
  data: AiTrackingDashboardData,
  platform: string,
): CsvValue[][] {
  const brand = data.config?.brandName ?? "";
  const sentimentBreakdowns: Array<[string, number, number]> = [
    ["Positive", data.sentiment.positive, data.sentiment.positivePercent],
    ["Mixed", data.sentiment.mixed, data.sentiment.mixedPercent],
    ["Neutral", data.sentiment.neutral, data.sentiment.neutralPercent],
    ["Negative", data.sentiment.negative, data.sentiment.negativePercent],
  ];

  return sentimentBreakdowns.map(([label, count, percent]) => [
    "Sentiment",
    label,
    brand,
    platform,
    count,
    "mentions",
    `${percent}%`,
  ]);
}

function getPromptRows(
  data: AiTrackingDashboardData,
  platform: string,
): CsvValue[][] {
  return data.prompts.map((prompt) => [
    "Prompt",
    prompt.active ? "Active" : "Inactive",
    prompt.prompt,
    platform,
    prompt.lastPosition ?? "",
    "last list position",
    [
      prompt.lastMentioned == null
        ? "Not checked"
        : prompt.lastMentioned
          ? "Mentioned"
          : "Not mentioned",
      prompt.lastSentiment ?? "",
      prompt.lastCheckedAt ?? "",
    ]
      .filter(Boolean)
      .join("; "),
  ]);
}

function getObservationRows(data: AiTrackingDashboardData): CsvValue[][] {
  return data.recentObservations.map((observation) => [
    "Observation",
    observation.status,
    observation.prompt,
    formatPlatform(observation.platform),
    observation.position ?? "",
    "list position",
    [
      observation.observedAt,
      observation.brandMentioned ? "Brand mentioned" : "Brand not mentioned",
      observation.sentiment,
      observation.evidence ?? "",
    ]
      .filter(Boolean)
      .join("; "),
  ]);
}

export function downloadAiTrackingReportCsv(
  data: AiTrackingDashboardData,
  days: AiTrackingReportDays,
  selectedPlatform: string,
): void {
  const table = buildAiTrackingReportExport(data, days, selectedPlatform);
  const slug = slugify(
    data.config?.domain || data.config?.brandName || "brand",
  );
  downloadCsv(
    `generative-ai-report-${slug}-${days}d.csv`,
    buildCsv(table.headers, table.rows),
  );
}

function formatPlatform(platform: string): string {
  const labels: Record<string, string> = {
    all: "All platforms",
    chat_gpt: "ChatGPT",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude",
  };
  return labels[platform] ?? platform;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
