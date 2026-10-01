import { Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import {
  AI_TRACKING_REPORT_PERIODS,
  type AiTrackingReportDays,
} from "../aiTrackingReportExport";

export function AiTrackingReportToolbar({
  projectId,
  reportDays,
  onReportDaysChange,
  onExport,
  canExport,
}: {
  projectId: string;
  reportDays: AiTrackingReportDays;
  onReportDaysChange: (days: AiTrackingReportDays) => void;
  onExport: () => void;
  canExport: boolean;
}) {
  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-3 sm:flex-row sm:items-center sm:justify-between"
      aria-labelledby="ai-tracking-reporting-title"
    >
      <div>
        <h2 id="ai-tracking-reporting-title" className="text-sm font-semibold">
          Reporting period
        </h2>
        <p className="mt-0.5 text-xs text-base-content/60">
          Dashboard metrics include observations from the selected period.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div
          className="join"
          role="group"
          aria-label="Generative AI report period"
        >
          {AI_TRACKING_REPORT_PERIODS.map((period) => (
            <button
              key={period.days}
              type="button"
              className={`btn btn-sm join-item ${
                reportDays === period.days ? "btn-primary" : "btn-outline"
              }`}
              aria-pressed={reportDays === period.days}
              onClick={() => onReportDaysChange(period.days)}
            >
              {period.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            className="btn btn-sm btn-outline gap-1.5"
            onClick={onExport}
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
    </section>
  );
}
