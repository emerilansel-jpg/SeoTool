import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { getGmbGridReport } from "@/serverFunctions/gmb-grid";
import {
  calculateGmbGridReportSummary,
  downloadGmbGridReportCsv,
  GMB_GRID_REPORT_PERIODS,
  type GmbGridReportDays,
  type GmbGridReportRow,
} from "../gmbGridReportExport";

export function GmbGridReportSection({
  projectId,
  onSelectRunId,
}: {
  projectId: string;
  onSelectRunId: (runId: string) => void;
}) {
  const [reportDays, setReportDays] = useState<GmbGridReportDays>(30);
  const getReport = useServerFn(getGmbGridReport);

  const { data, isLoading } = useQuery({
    queryKey: ["gmb-grid-report", projectId, reportDays],
    queryFn: () => getReport({ data: { projectId, days: reportDays } }),
  });

  const rows: GmbGridReportRow[] = data?.rows ?? [];
  const summary = calculateGmbGridReportSummary(rows);
  const canExport = rows.length > 0;

  return (
    <section
      className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5"
      aria-labelledby="gmb-report-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <h2 id="gmb-report-heading" className="text-base font-semibold">
              Local map rank reporting
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-base-content/60">
            Historical completed and partial grid runs across the selected
            period.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            className="join"
            role="group"
            aria-label="Local Map Rank report period"
          >
            {GMB_GRID_REPORT_PERIODS.map((period) => (
              <button
                key={period.days}
                type="button"
                className={`btn btn-sm join-item ${
                  reportDays === period.days ? "btn-primary" : "btn-outline"
                }`}
                aria-pressed={reportDays === period.days}
                onClick={() => setReportDays(period.days)}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline gap-1.5"
              onClick={() => data && downloadGmbGridReportCsv(data, reportDays)}
              disabled={!canExport}
            >
              <Download className="size-4" />
              Export CSV
            </button>
            <Link
              to="/p/$projectId/reports"
              params={{ projectId }}
              className="btn btn-sm btn-ghost gap-1.5"
            >
              <FileText className="size-4" />
              Reports
            </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-base-content/50" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-base-300 p-6 text-center">
          <Calendar className="mx-auto size-6 text-base-content/40" />
          <p className="mt-2 text-sm text-base-content/70">
            No completed grid scans found in the last {reportDays} days.
          </p>
          <p className="text-xs text-base-content/50">
            Run a scan using the form above to record local ranking history.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-base-200 bg-base-200/40 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/60">
                Total scans
              </span>
              <p className="mt-1 text-2xl font-bold">{summary.totalRuns}</p>
            </div>
            <div className="rounded-lg border border-base-200 bg-base-200/40 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/60">
                Avg SoLV (Top 3)
              </span>
              <p className="mt-1 text-2xl font-bold text-success">
                {summary.averageSolv != null ? `${summary.averageSolv}%` : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-base-200 bg-base-200/40 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/60">
                Avg ATRP Rank
              </span>
              <p className="mt-1 text-2xl font-bold">
                {summary.averageRank != null ? `#${summary.averageRank}` : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-base-200 bg-base-200/40 p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/60">
                Avg coverage
              </span>
              <p className="mt-1 text-2xl font-bold">
                {summary.averageCoverage != null
                  ? `${summary.averageCoverage}%`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-base-200">
            <table className="table table-sm w-full">
              <thead>
                <tr className="bg-base-200/50 text-base-content/60">
                  <th>Date</th>
                  <th>Keyword</th>
                  <th>Business</th>
                  <th>Status</th>
                  <th className="text-right">SoLV</th>
                  <th className="text-right">Avg rank</th>
                  <th className="text-right">Coverage</th>
                  <th className="text-right">Pins (Top 3 / Total)</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.runId} className="hover:bg-base-200/30">
                    <td className="whitespace-nowrap font-mono text-xs">
                      {row.date}
                    </td>
                    <td className="max-w-[160px] truncate font-medium text-xs">
                      {row.keyword}
                    </td>
                    <td className="max-w-[160px] truncate text-xs text-base-content/70">
                      {row.businessName}
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs ${
                          row.status === "completed"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-xs text-success">
                      {row.solv != null ? `${row.solv}%` : "—"}
                    </td>
                    <td className="text-right font-medium text-xs">
                      {row.averageRank != null ? `#${row.averageRank}` : "—"}
                    </td>
                    <td className="text-right text-xs">{row.foundCoverage}%</td>
                    <td className="text-right text-xs font-mono text-base-content/70">
                      {row.top3} / {row.totalPoints}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs gap-1"
                        onClick={() => onSelectRunId(row.runId)}
                      >
                        View map
                        <ChevronRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
