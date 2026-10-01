import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  createReport,
  updateReport,
  deleteReport,
} from "@/serverFunctions/reports";
import type { ReportWithSections } from "@/server/features/reports/services/ReportService";
import {
  REPORT_SECTION_OPTIONS,
  getReportSectionLabel,
  isDeliverySchedule,
  isReportPeriod,
  isReportSectionType,
  type DeliverySchedule,
  type ReportPeriod,
  type ReportSectionType,
} from "./reportData";
import { ColorField, DAYS, Field, MONTHS } from "./ReportBuilderFields";

export type ReportFormShape = ReportWithSections & {
  reportPeriod?: string | null;
  monthOfYear?: number | null;
};

type ReportMutationData = Parameters<typeof createReport>[0]["data"] & {
  reportPeriod: ReportPeriod;
  monthOfYear?: number;
};

export function ReportBuilderModal({
  projectId,
  report,
  onClose,
}: {
  projectId: string;
  report: ReportWithSections | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const existing = report as ReportFormShape | null;
  const existingSchedule = isDeliverySchedule(existing?.schedule)
    ? existing.schedule
    : "none";
  const [name, setName] = useState(existing?.name ?? "");
  const [clientName, setClientName] = useState(existing?.clientName ?? "");
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>(
    isReportPeriod(existing?.reportPeriod) ? existing.reportPeriod : "monthly",
  );
  const [schedule, setSchedule] = useState<DeliverySchedule>(existingSchedule);
  const [dayOfWeek, setDayOfWeek] = useState(existing?.dayOfWeek ?? 1);
  const [dayOfMonth, setDayOfMonth] = useState(existing?.dayOfMonth ?? 1);
  const [monthOfYear, setMonthOfYear] = useState(existing?.monthOfYear ?? 1);
  const [recipients, setRecipients] = useState(existing?.recipients ?? "");
  const [brandColor, setBrandColor] = useState(existing?.brandColor ?? "");
  const [accentColor, setAccentColor] = useState(existing?.accentColor ?? "");
  const existingSections =
    existing?.sections
      .map((section) => section.type)
      .filter(isReportSectionType) ?? [];
  const [sections, setSections] = useState<ReportSectionType[]>(
    existingSections.length > 0
      ? existingSections
      : ["rank", "audit", "gsc", "ga4", "backlinks"],
  );

  const mutationData = (): ReportMutationData => ({
    projectId,
    name: name.trim(),
    clientName: clientName.trim() || undefined,
    reportPeriod,
    schedule,
    dayOfWeek: schedule === "weekly" ? dayOfWeek : undefined,
    dayOfMonth:
      schedule === "monthly" || schedule === "yearly" ? dayOfMonth : undefined,
    monthOfYear: schedule === "yearly" ? monthOfYear : undefined,
    recipients: recipients.trim() || undefined,
    brandColor: brandColor || undefined,
    accentColor: accentColor || undefined,
    sections: sections.map((type) => ({ type })),
  });

  const createMutation = useMutation({
    mutationFn: () => createReport({ data: mutationData() }),
    onSuccess: () => {
      toast.success("Report created");
      void queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
      onClose();
    },
    onError: (error: unknown) => toast.error(getStandardErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!report) return;
      await updateReport({ data: { ...mutationData(), reportId: report.id } });
    },
    onSuccess: () => {
      toast.success("Report updated");
      void queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
      if (report) {
        void queryClient.invalidateQueries({
          queryKey: ["report", projectId, report.id],
        });
      }
      onClose();
    },
    onError: (error: unknown) => toast.error(getStandardErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteReport({ data: { projectId, reportId: report?.id ?? "" } }),
    onSuccess: () => {
      toast.success("Report deleted");
      void queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
      onClose();
    },
    onError: (error: unknown) => toast.error(getStandardErrorMessage(error)),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      maxWidth="max-w-2xl"
      onClose={onClose}
      labelledBy="report-form-title"
    >
      <div>
        <h2 id="report-form-title" className="text-lg font-semibold">
          {report ? "Edit report" : "New report"}
        </h2>
        <p className="mt-1 text-sm text-base-content/60">
          Choose the reporting period independently from the delivery schedule.
        </p>
      </div>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (report) updateMutation.mutate();
          else createMutation.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Report name">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input input-bordered w-full"
              required
            />
          </Field>
          <Field label="Client name">
            <input
              type="text"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className="input input-bordered w-full"
              placeholder="Acme Corp"
            />
          </Field>
        </div>
        <fieldset className="rounded-xl border border-base-300 p-4">
          <legend className="px-1 text-sm font-semibold">Report timing</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reporting period" hint="Data included in each report">
              <select
                value={reportPeriod}
                onChange={(event) => {
                  if (isReportPeriod(event.target.value))
                    setReportPeriod(event.target.value);
                }}
                className="select select-bordered w-full"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Field>
            <Field label="Delivery schedule" hint="When recipients receive it">
              <select
                value={schedule}
                onChange={(event) => {
                  if (isDeliverySchedule(event.target.value))
                    setSchedule(event.target.value);
                }}
                className="select select-bordered w-full"
              >
                <option value="none">On-demand</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Field>
          </div>
          {schedule !== "none" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2" aria-live="polite">
              {schedule === "weekly" ? (
                <Field label="Delivery day">
                  <select
                    value={dayOfWeek}
                    onChange={(event) =>
                      setDayOfWeek(Number(event.target.value))
                    }
                    className="select select-bordered w-full"
                  >
                    {DAYS.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
              {schedule === "yearly" ? (
                <Field label="Delivery month">
                  <select
                    value={monthOfYear}
                    onChange={(event) =>
                      setMonthOfYear(Number(event.target.value))
                    }
                    className="select select-bordered w-full"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
              {schedule === "monthly" || schedule === "yearly" ? (
                <Field
                  label="Day of month"
                  hint="Limited to 28 for every month"
                >
                  <select
                    value={dayOfMonth}
                    onChange={(event) =>
                      setDayOfMonth(Number(event.target.value))
                    }
                    className="select select-bordered w-full"
                  >
                    {Array.from({ length: 28 }, (_, index) => index + 1).map(
                      (day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              ) : null}
            </div>
          ) : null}
        </fieldset>
        <Field
          label="Recipients"
          hint="Separate multiple email addresses with commas"
        >
          <input
            type="text"
            value={recipients}
            onChange={(event) => setRecipients(event.target.value)}
            className="input input-bordered w-full"
            inputMode="email"
            placeholder="alice@acme.com, bob@acme.com"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Brand color"
            value={brandColor}
            onChange={setBrandColor}
          />
          <ColorField
            label="Accent color"
            value={accentColor}
            onChange={setAccentColor}
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Sections</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {REPORT_SECTION_OPTIONS.map((type) => (
              <label
                key={type}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-base-300 px-3 py-2 text-sm hover:bg-base-200"
              >
                <input
                  type="checkbox"
                  checked={sections.includes(type)}
                  onChange={(event) =>
                    setSections(
                      event.target.checked
                        ? [...sections, type]
                        : sections.filter((section) => section !== type),
                    )
                  }
                  className="checkbox checkbox-sm"
                />
                {getReportSectionLabel(type)}
              </label>
            ))}
          </div>
          {sections.length === 0 ? (
            <p className="mt-2 text-xs text-error" role="alert">
              Select at least one section.
            </p>
          ) : null}
        </fieldset>
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-base-300 pt-4 sm:flex-row">
          <div>
            {report ? (
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
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
              disabled={isLoading || !name.trim() || sections.length === 0}
            >
              {isLoading ? "Saving..." : report ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
