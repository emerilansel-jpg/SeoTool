import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { FeatureHeader } from "@/client/components/FeatureHeader";
import { listReports } from "@/serverFunctions/reports";
import type { ReportWithSections } from "@/server/features/reports/services/ReportService";
import {
  formatDeliverySchedule,
  formatReportPeriod,
  getReportSectionLabel,
} from "./reportData";
import { ReportBuilderModal, type ReportFormShape } from "./ReportBuilderModal";

export function ReportsListPage({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ReportWithSections | null>(null);

  const reportsQuery = useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => listReports({ data: { projectId } }),
  });

  const reports = reportsQuery.data?.reports ?? [];

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  return (
    <div className="px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <FeatureHeader
          icon={FileText}
          title="Reports"
          badge="Automated & Scheduled Exports"
          description="Create white-label SEO reports for your clients and schedule recurring delivery."
          actions={
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-xl font-semibold shadow-xs"
              onClick={openCreate}
            >
              New report
            </button>
          }
        />

        {reportsQuery.isPending ? (
          <div className="space-y-3" aria-label="Loading reports">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 p-10 text-center">
            <p className="text-sm text-base-content/55">
              No reports yet. Create your first white-label report to start
              delivering value to clients.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm mt-4"
              onClick={openCreate}
            >
              Create report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const expanded = report as ReportFormShape;
              return (
                <article
                  key={report.id}
                  className="rounded-xl border border-base-300 bg-base-100 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">
                        {report.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-base-content/60">
                        {report.clientName ?? "Internal"} &middot;{" "}
                        {formatReportPeriod(expanded.reportPeriod ?? "monthly")}{" "}
                        report &middot;{" "}
                        {formatDeliverySchedule(report.schedule)} delivery
                        {report.nextRunAt
                          ? ` · Next: ${new Date(report.nextRunAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {report.brandColor ? (
                        <span
                          className="size-3 rounded-full border"
                          style={{ backgroundColor: report.brandColor }}
                          aria-label="Custom brand color"
                        />
                      ) : null}
                      <Link
                        to="/p/$projectId/reports/$reportId"
                        params={{ projectId, reportId: report.id }}
                        className="btn btn-ghost btn-sm"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditing(report);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div
                    className="mt-2 flex flex-wrap gap-1.5"
                    aria-label="Report sections"
                  >
                    {report.sections.map((section) => (
                      <span
                        key={section.id}
                        className="badge badge-outline badge-sm"
                      >
                        {getReportSectionLabel(section.type)}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showModal ? (
        <ReportBuilderModal
          projectId={projectId}
          report={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
            void queryClient.invalidateQueries({
              queryKey: ["reports", projectId],
            });
          }}
        />
      ) : null}
    </div>
  );
}
