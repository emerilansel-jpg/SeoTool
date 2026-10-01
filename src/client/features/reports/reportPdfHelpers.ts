// oxlint-disable-next-line eslint-plugin-import/no-named-as-default -- standard jspdf import pattern
import type { jsPDF } from "jspdf";
// oxlint-disable-next-line eslint-plugin-import/no-named-as-default -- standard jspdf-autotable import pattern
import autoTable from "jspdf-autotable";

/** Shared PDF drawing helpers for report sections. */

export function n(value: unknown): number {
  const v = Number(value);
  return Number.isFinite(v) ? v : 0;
}

export function pct(value: unknown): string {
  return `${(n(value) * 100).toFixed(1)}%`;
}

export function trunc(value: string | undefined, max: number): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function withPrevious(value: string, previous?: string): string {
  return previous ? `${value} (prev ${previous})` : value;
}

export function sectionStart(doc: jsPDF, title: string, y: number): number {
  if (y > 250) {
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

export function addStat(
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

/** Table with automatic page break before drawing. Returns the final Y. */
export function addTable(
  doc: jsPDF,
  y: number,
  head: string[],
  body: string[][],
): number {
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [60, 60, 60] },
    margin: { left: 20, right: 20 },
  });
  return (
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- jspdf-autotable plugin adds lastAutoTable
    (doc as unknown as { lastAutoTable: { finalY?: number } }).lastAutoTable
      ?.finalY ?? y + 20
  );
}
