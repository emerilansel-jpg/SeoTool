// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- DB enum types narrowed from string
// oxlint-disable-next-line eslint/no-unused-expressions -- ternary expression in handler
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  listReports,
  createReport,
  updateReport,
  deleteReport,
} from "@/serverFunctions/reports";
import {
  REPORT_SECTION_TYPES,
  type ReportSchedule,
} from "@/types/schemas/reports";
import type { ReportWithSections } from "@/server/features/reports/services/ReportService";

type ReportSectionType = (typeof REPORT_SECTION_TYPES)[number];

export function ReportsListPage({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ReportWithSections | null>(null);

  const reportsQuery = useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => listReports({ data: { projectId } }),
  });

  const reports = reportsQuery.data?.reports ?? [];

  return (
    <div className="px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="text-sm text-base-content/70">
              Create white-label SEO reports for your clients and schedule
              delivery.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
            New report
          </button>
        </div>

        {reportsQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
            <p className="text-sm text-base-content/60">
              No reports yet. Create your first white-label report to start
              delivering value to clients.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm mt-4"
              onClick={() => {
                setEditing(null);
                setShowModal(true);
              }}
            >
              Create report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-base-300 bg-base-100 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {report.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-base-content/60">
                      {report.clientName ?? "Internal"} &middot;{" "}
                      {report.schedule === "none"
                        ? "On-demand"
                        : report.schedule}
                      {report.nextRunAt
                        ? ` · Next: ${new Date(report.nextRunAt).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {report.brandColor ? (
                      <span
                        className="size-3 rounded-full border"
                        style={{ backgroundColor: report.brandColor }}
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
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {report.sections.map((section) => (
                    <span
                      key={section.id}
                      className="badge badge-outline badge-sm"
                    >
                      {section.type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
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
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit modal
// ---------------------------------------------------------------------------

function ReportBuilderModal({
  projectId,
  report,
  onClose,
}: {
  projectId: string;
  report: ReportWithSections | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(report?.name ?? "");
  const [clientName, setClientName] = useState(report?.clientName ?? "");
  const [schedule, setSchedule] = useState<ReportSchedule>(
    (report?.schedule as ReportSchedule) ?? "none",
  );
  const [recipients, setRecipients] = useState(report?.recipients ?? "");
  const [brandColor, setBrandColor] = useState(report?.brandColor ?? "");
  const [accentColor, setAccentColor] = useState(report?.accentColor ?? "");
  const [sections, setSections] = useState<ReportSectionType[]>(
    report?.sections.map((s) => s.type as ReportSectionType) ?? [
      "rank",
      "audit",
      "gsc",
      "ga4",
      "backlinks",
    ],
  );

  const createMutation = useMutation({
    mutationFn: () =>
      createReport({
        data: {
          projectId,
          name: name.trim(),
          clientName: clientName.trim() || undefined,
          schedule,
          recipients: recipients.trim() || undefined,
          brandColor: brandColor.trim() || undefined,
          accentColor: accentColor.trim() || undefined,
          sections: sections.map((type) => ({ type })),
        },
      }),
    onSuccess: () => {
      toast.success("Report created");
      onClose();
    },
    onError: (e: unknown) => toast.error(getStandardErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!report) return;
      await updateReport({
        data: {
          projectId,
          reportId: report.id,
          name: name.trim(),
          clientName: clientName.trim() || undefined,
          schedule,
          recipients: recipients.trim() || undefined,
          brandColor: brandColor.trim() || undefined,
          accentColor: accentColor.trim() || undefined,
          sections: sections.map((type) => ({ type })),
        },
      });
    },
    onSuccess: () => {
      toast.success("Report updated");
      onClose();
    },
    onError: (e: unknown) => toast.error(getStandardErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteReport({ data: { projectId, reportId: report?.id ?? "" } }),
    onSuccess: () => {
      toast.success("Report deleted");
      onClose();
    },
    onError: (e: unknown) => toast.error(getStandardErrorMessage(e)),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/60">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">
          {report ? "Edit report" : "New report"}
        </h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // oxlint-disable-next-line eslint/no-unused-expressions -- ternary dispatch
            report ? updateMutation.mutate() : createMutation.mutate();
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Report name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Client name</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Acme Corp"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Schedule</span>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as ReportSchedule)}
                className="select select-bordered w-full"
              >
                <option value="none">On-demand</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Recipients</span>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="input input-bordered w-full"
                placeholder="alice@acme.com,bob@acme.com"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Brand color</span>
              <input
                type="color"
                value={brandColor || "#000000"}
                onChange={(e) => setBrandColor(e.target.value)}
                className="input input-bordered h-10 w-full p-1"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Accent color</span>
              <input
                type="color"
                value={accentColor || "#000000"}
                onChange={(e) => setAccentColor(e.target.value)}
                className="input input-bordered h-10 w-full p-1"
              />
            </label>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium">Sections</span>
            <div className="flex flex-wrap gap-2">
              {REPORT_SECTION_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={sections.includes(type)}
                    onChange={(e) =>
                      setSections(
                        e.target.checked
                          ? [...sections, type]
                          : sections.filter((s) => s !== type),
                      )
                    }
                    className="checkbox checkbox-sm"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <div>
              {report ? (
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? "Saving…" : report ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
