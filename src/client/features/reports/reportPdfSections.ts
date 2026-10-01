import {
  buildAiTrackingModel,
  buildBrandLookupModel,
  buildGmbGridModel,
} from "./reportModels";
import {
  formatPlatform,
  formatReportCurrency,
  formatReportDate,
  formatReportNumber,
  formatReportPercent,
  humanize,
} from "./reportDataCore";
import {
  addStat,
  addTable,
  sectionStart,
  trunc,
  withPrevious,
} from "./reportPdfHelpers";
import type { jsPDF } from "jspdf";

/**
 * PDF renderers for the advanced report sections. Each returns the new Y
 * cursor; tables page-break themselves via addTable.
 */

export function addGmbGridSection(
  doc: jsPDF,
  data: unknown,
  y: number,
): number {
  const model = buildGmbGridModel(data);
  const profilesToRender =
    model.profiles.length > 1
      ? model.profiles
      : [
          {
            businessName: model.profiles[0]?.businessName ?? "Local Map Rank",
            totalScans: model.totalScans,
            metrics: model.metrics,
            keywordLocations: model.keywordLocations,
          },
        ];

  for (const profile of profilesToRender) {
    const title =
      profilesToRender.length > 1
        ? `Local Map Rank · ${profile.businessName}`
        : "Local Map Rank";
    y = sectionStart(doc, title, y);
    addStat(
      doc,
      "Total scans",
      formatReportNumber(profile.totalScans, 0),
      20,
      y,
    );
    addStat(
      doc,
      "Share of local voice",
      withPrevious(
        formatReportPercent(profile.metrics.solv.current),
        profile.metrics.solv.previous === undefined
          ? undefined
          : formatReportPercent(profile.metrics.solv.previous),
      ),
      60,
      y,
    );
    addStat(
      doc,
      "Average rank",
      formatReportNumber(profile.metrics.averageRank.current),
      130,
      y,
    );
    y += 14;
    addStat(
      doc,
      "Top 3",
      formatReportNumber(profile.metrics.top3.current, 0),
      20,
      y,
    );
    addStat(
      doc,
      "Top 10",
      formatReportNumber(profile.metrics.top10.current, 0),
      60,
      y,
    );
    addStat(
      doc,
      "Top 20",
      formatReportNumber(profile.metrics.top20.current, 0),
      100,
      y,
    );
    addStat(
      doc,
      "Scan cost",
      formatReportCurrency(profile.metrics.cost.current),
      140,
      y,
    );
    y += 14;
    if (profile.keywordLocations.length > 0) {
      y = addTable(
        doc,
        y,
        ["Keyword", "Location", "Scans", "SoLV", "Avg rank"],
        profile.keywordLocations
          .slice(0, 10)
          .map((row) => [
            trunc(row.keyword, 34),
            trunc(row.location, 26),
            formatReportNumber(row.scans, 0),
            formatReportPercent(row.solv),
            formatReportNumber(row.averageRank),
          ]),
      );
    }
    y += 10;
  }
  return y;
}

export function addBrandLookupSection(
  doc: jsPDF,
  data: unknown,
  y: number,
): number {
  const model = buildBrandLookupModel(data);
  y = sectionStart(doc, "Brand Lookup", y);
  addStat(doc, "Target", trunc(model.target, 40), 20, y);
  addStat(
    doc,
    "Total mentions",
    formatReportNumber(model.totalMentions, 0),
    90,
    y,
  );
  addStat(
    doc,
    "AI search volume",
    formatReportNumber(model.searchVolume, 0),
    145,
    y,
  );
  y += 14;
  addStat(doc, "Data refreshed", formatReportDate(model.freshness), 20, y);
  y += 12;
  if (model.platforms.length > 0) {
    y = addTable(
      doc,
      y,
      ["Platform", "Status", "Mentions", "Search volume"],
      model.platforms.map((row) => [
        formatPlatform(row.platform),
        row.status ? humanize(row.status) : "Available",
        formatReportNumber(row.mentions, 0),
        formatReportNumber(row.searchVolume, 0),
      ]),
    );
  }
  if (model.sovEntries.length > 0) {
    y = addTable(
      doc,
      y + 4,
      ["Share of voice", "Mentions", "Share"],
      model.sovEntries
        .slice(0, 8)
        .map((row) => [
          trunc(row.label, 40),
          formatReportNumber(row.mentions, 0),
          formatReportPercent(row.share),
        ]),
    );
  }
  return y + 6;
}

export function addAiTrackingSection(
  doc: jsPDF,
  data: unknown,
  y: number,
): number {
  const model = buildAiTrackingModel(data);
  y = sectionStart(doc, "Generative AI", y);
  const metrics: Array<
    [string, { current?: number; previous?: number }, number]
  > = [
    ["Visibility", model.metrics.visibility, 20],
    ["Mention rate", model.metrics.mentionRate, 65],
    ["Citation rate", model.metrics.citationRate, 110],
    ["Share of voice", model.metrics.shareOfVoice, 155],
  ];
  for (const [label, metric, x] of metrics) {
    const prev =
      metric.previous === undefined
        ? undefined
        : formatReportPercent(metric.previous);
    addStat(
      doc,
      label,
      withPrevious(formatReportPercent(metric.current), prev),
      x,
      y,
    );
  }
  y += 14;
  if (model.platforms.length > 0) {
    y = addTable(
      doc,
      y,
      ["Platform", "Visibility", "Mentions", "Citations", "SOV"],
      model.platforms.map((row) => [
        formatPlatform(row.platform),
        formatReportPercent(row.visibility),
        formatReportPercent(row.mentionRate),
        formatReportPercent(row.citationRate),
        formatReportPercent(row.shareOfVoice),
      ]),
    );
  }
  if (model.competitors.length > 0) {
    y = addTable(
      doc,
      y + 4,
      ["Competitor", "Mentions", "Visibility", "SOV"],
      model.competitors
        .slice(0, 8)
        .map((row) => [
          trunc(row.label, 36),
          formatReportNumber(row.mentions, 0),
          formatReportPercent(row.visibility),
          formatReportPercent(row.shareOfVoice),
        ]),
    );
  }
  if (model.topCitedPages.length > 0) {
    y = addTable(
      doc,
      y + 4,
      ["Top cited page", "Citations"],
      model.topCitedPages
        .slice(0, 8)
        .map((row) => [
          trunc(row.domain ? `${row.domain} ${row.page}` : row.page, 70),
          formatReportNumber(row.citations, 0),
        ]),
    );
  }
  return y + 6;
}
