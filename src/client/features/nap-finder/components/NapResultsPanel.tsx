import { Download, MapPin } from "lucide-react";

// One per-directory verdict row. Structurally compatible with both the audit
// mutation response and the stored getNapAuditResults rows.
export interface NapResultRow {
  directory: string;
  status: string;
  sourceUrl: string | null;
  foundName: string | null;
  foundPhone: string | null;
  foundAddress: string | null;
  ratingValue: number | null;
  ratingCount: number | null;
  detail: string | null;
}

const STATUS_BADGES: Record<string, string> = {
  consistent: "badge-success",
  mismatch: "badge-error",
  needs_review: "badge-warning",
  not_found: "badge-ghost",
  error: "badge-error",
};

const STATUS_LABELS: Record<string, string> = {
  consistent: "Consistent",
  mismatch: "Mismatch",
  needs_review: "Needs review",
  not_found: "Not found",
  error: "Error",
};

export function scoreColorClass(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}

// Fallback for stored audits whose score column is null. Mirrors the server's
// consistencyScoreOf: share of comparable sources that are consistent.
export function computeConsistencyScore(results: NapResultRow[]): number {
  const comparable = results.filter(
    (row) => row.status !== "error" && row.status !== "not_found",
  );
  if (comparable.length === 0) return 0;
  const consistent = comparable.filter(
    (row) => row.status === "consistent",
  ).length;
  return Math.round((consistent / comparable.length) * 100);
}

function directoryLabel(directory: string): string {
  return directory === "google" ? "Google Business Profile" : directory;
}

function csvCell(value: string | number | null): string {
  if (value == null) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadResultsCsv(results: NapResultRow[]): void {
  const header =
    "directory,status,source_url,found_name,found_phone,found_address,detail";
  const lines = results.map((row) =>
    [
      row.directory,
      row.status,
      row.sourceUrl,
      row.foundName,
      row.foundPhone,
      row.foundAddress,
      row.detail,
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob([[header, ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nap-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function NapResultsPanel({
  score,
  results,
}: {
  score: number;
  results: NapResultRow[];
}) {
  return (
    <div className="space-y-4">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center gap-2 p-4 md:flex-row">
          <div
            className={`radial-progress ${scoreColorClass(score)}`}
            style={{ "--value": score } as React.CSSProperties}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="text-2xl font-bold">{score}</span>
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm font-medium">NAP consistency score</p>
            <p className="text-xs text-base-content/50">
              Share of checked sources matching the reference phone and address.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2 md:ml-auto"
            onClick={() => downloadResultsCsv(results)}
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {results.map((row) => (
          <NapResultCard
            key={`${row.directory}:${row.sourceUrl ?? ""}`}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}

function NapResultCard({ row }: { row: NapResultRow }) {
  const foundLines = [
    row.foundPhone ? `Phone: ${row.foundPhone}` : null,
    row.foundAddress ? `Address: ${row.foundAddress}` : null,
  ].filter((line): line is string => Boolean(line));

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-base-content/40" />
            <span className="font-medium">{directoryLabel(row.directory)}</span>
          </div>
          <span
            className={`badge badge-sm ${STATUS_BADGES[row.status] ?? "badge-ghost"}`}
          >
            {STATUS_LABELS[row.status] ?? row.status}
          </span>
        </div>
        {row.directory === "google" && row.ratingValue != null ? (
          <p className="text-sm text-warning">
            {"★".repeat(Math.max(1, Math.min(5, Math.round(row.ratingValue))))}{" "}
            {row.ratingValue.toFixed(1)}
            {row.ratingCount != null ? ` (${row.ratingCount} reviews)` : ""}
          </p>
        ) : null}
        {row.foundName ? <p className="text-sm">{row.foundName}</p> : null}
        {foundLines.map((line) => (
          <p key={line} className="text-sm text-base-content/70">
            {line}
          </p>
        ))}
        {row.detail ? (
          <p className="text-xs text-base-content/50">{row.detail}</p>
        ) : null}
        {row.sourceUrl ? (
          <a
            href={row.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="link link-primary break-all text-sm"
          >
            View listing
          </a>
        ) : null}
      </div>
    </div>
  );
}
