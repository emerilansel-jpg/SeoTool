// oxlint-disable-next-line eslint-plugin-import/no-named-as-default -- standard jspdf import pattern
import jsPDF from "jspdf";
// oxlint-disable-next-line eslint-plugin-import/no-named-as-default -- standard jspdf-autotable import pattern
import autoTable from "jspdf-autotable";
import type { ReportWithSections } from "@/server/features/reports/services/ReportService";

type SnapshotData = {
  generatedAt: string;
  range: { startDate: string; endDate: string };
  sections: Record<
    string,
    | { status: "ok"; data: unknown }
    | { status: "skipped"; reason: string }
    | { status: "error"; error: string }
  >;
};

function n(value: unknown): number {
  const v = Number(value);
  return Number.isFinite(v) ? v : 0;
}

function pct(value: unknown): string {
  return `${(n(value) * 100).toFixed(1)}%`;
}

function addTitle(doc: jsPDF, report: ReportWithSections) {
  if (report.brandColor) {
    doc.setTextColor(report.brandColor);
  } else {
    doc.setTextColor(30, 30, 30);
  }
  doc.setFontSize(20);
  doc.text(report.name, 20, 30);
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(10);
  if (report.clientName) {
    doc.text(report.clientName, 20, 38);
  }
}

function sectionStart(doc: jsPDF, title: string, y: number): number {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 20, y);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y + 2, 190, y + 2);
  return y + 8;
}

function addStat(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
) {
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(label, x, y);
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(value, x, y + 5);
}

function addRankSection(
  doc: jsPDF,
  data: Record<string, unknown>,
  y: number,
): number {
  y = sectionStart(doc, "Rank Tracking", y);
  addStat(doc, "Tracked", String(n(data.trackedKeywords)), 20, y);
  addStat(doc, "Improved", String(n(data.improved)), 60, y);
  addStat(doc, "Declined", String(n(data.declined)), 100, y);
  addStat(doc, "Top 10", String(n(data.top10)), 140, y);
  return y + 16;
}

function addAuditSection(
  doc: jsPDF,
  data: Record<string, unknown>,
  y: number,
): number {
  y = sectionStart(doc, "Site Audit", y);
  addStat(doc, "Pages crawled", String(n(data.pagesCrawled)), 20, y);
  addStat(doc, "Issue types", String(n(data.totalIssueTypes)), 100, y);
  const issues = Array.isArray(data.topIssues)
    ? // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- validated by Array.isArray
      (data.topIssues as Array<{ type?: string; count?: number }>)
    : [];
  if (issues.length > 0) {
    y += 12;
    autoTable(doc, {
      startY: y,
      head: [["Issue type", "Count"]],
      body: issues.slice(0, 10).map((i) => [i.type ?? "", String(n(i.count))]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [60, 60, 60] },
      margin: { left: 20, right: 20 },
    });
    y =
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- jspdf-autotable plugin adds lastAutoTable
      (doc as unknown as { lastAutoTable: { finalY?: number } }).lastAutoTable
        ?.finalY ?? y + 20;
  }
  return y + 6;
}

function addGscSection(
  doc: jsPDF,
  data: Record<string, unknown>,
  y: number,
): number {
  y = sectionStart(doc, "Google Search Console", y);
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- report data shape is known
  const totals = data.totals as Record<string, number> | undefined;
  if (totals) {
    addStat(doc, "Clicks", String(n(totals.clicks)), 20, y);
    addStat(doc, "Impressions", String(n(totals.impressions)), 70, y);
    addStat(doc, "CTR", pct(totals.ctr), 130, y);
    y += 14;
  }
  return y + 4;
}

function addGa4Section(
  doc: jsPDF,
  data: Record<string, unknown>,
  y: number,
): number {
  y = sectionStart(doc, "Google Analytics 4", y);
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- report data shape is known
  const totals = data.totals as Record<string, number> | undefined;
  if (totals) {
    addStat(doc, "Sessions", String(n(totals.sessions)), 20, y);
    addStat(doc, "Users", String(n(totals.totalUsers)), 70, y);
    addStat(doc, "Pageviews", String(n(totals.screenPageViews)), 130, y);
    y += 14;
    addStat(doc, "Engagement", pct(totals.engagementRate), 20, y);
    y += 10;
  }
  return y + 4;
}

function addBacklinksSection(
  doc: jsPDF,
  data: Record<string, unknown>,
  y: number,
): number {
  y = sectionStart(doc, "Backlinks", y);
  addStat(doc, "Backlinks", String(n(data.backlinks)), 20, y);
  addStat(doc, "Ref. domains", String(n(data.referringDomains)), 70, y);
  addStat(doc, "New", String(n(data.newBacklinks)), 130, y);
  addStat(doc, "Lost", String(n(data.lostBacklinks)), 160, y);
  return y + 16;
}

/** Generate a client-side PDF from report config + snapshot payload. */
export function reportPdf(
  report: ReportWithSections,
  snapshotData: SnapshotData,
) {
  const doc = new jsPDF();

  // Brand color
  if (report.brandColor) {
    const hex = report.brandColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, 210, 4, "F");
  }

  addTitle(doc, report);

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date(snapshotData.generatedAt).toLocaleDateString()} · ${snapshotData.range.startDate} to ${snapshotData.range.endDate}`,
    20,
    report.clientName ? 44 : 38,
  );

  let y = report.clientName ? 54 : 50;

  for (const section of report.sections) {
    const result = snapshotData.sections[section.type];
    if (!result || result.status !== "ok") continue;

    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- snapshot section data is JSON
    const data = result.data as Record<string, unknown>;
    switch (section.type) {
      case "rank":
        y = addRankSection(doc, data, y);
        break;
      case "audit":
        y = addAuditSection(doc, data, y);
        break;
      case "gsc":
        y = addGscSection(doc, data, y);
        break;
      case "ga4":
        y = addGa4Section(doc, data, y);
        break;
      case "backlinks":
        y = addBacklinksSection(doc, data, y);
        break;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`${report.name} · Page ${i}/${pageCount}`, 20, 290);
  }

  doc.save(
    `${report.name.replace(/\s+/g, "_")}-${snapshotData.range.startDate}.pdf`,
  );
}
