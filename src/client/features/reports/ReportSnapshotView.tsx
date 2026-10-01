import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  getReport,
  getReportSnapshot,
  generateReportSnapshot,
} from "@/serverFunctions/reports";
import { reportPdf } from "@/client/lib/reportPdf";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { getReportSectionLabel, parseSnapshotData } from "./reportData";
import {
  BrandLookupReportSection,
  GmbGridReportSection,
} from "./ReportAdvancedSections";
import { AiTrackingReportSection } from "./ReportAiTrackingSection";
import {
  AuditSection,
  BacklinksSection,
  ContentSection,
  Ga4Section,
  GscSection,
  RankSection,
} from "./ReportCoreSections";

export function ReportSnapshotView({
  projectId,
  reportId,
  snapshotId,
}: {
  projectId: string;
  reportId: string;
  snapshotId: string;
}) {
  const queryClient = useQueryClient();
  const reportQuery = useQuery({
    queryKey: ["report", projectId, reportId],
    queryFn: () => getReport({ data: { projectId, reportId } }),
  });
  const snapshotQuery = useQuery({
    queryKey: ["reportSnapshot", projectId, snapshotId],
    queryFn: () => getReportSnapshot({ data: { projectId, snapshotId } }),
  });

  const report = reportQuery.data?.report;
  const snapshot = snapshotQuery.data?.snapshot;
  const snapshotData = snapshot ? parseSnapshotData(snapshot.data) : null;

  const generateMutation = useMutation({
    mutationFn: () => generateReportSnapshot({ data: { projectId, reportId } }),
    onSuccess: (result) => {
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Snapshot generated");
      void queryClient.invalidateQueries({
        queryKey: ["reportSnapshots", projectId, reportId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["reportSnapshot", projectId, snapshotId],
      });
    },
    onError: (error: unknown) =>
      toast.error(getStandardErrorMessage(error, "Snapshot generation failed")),
  });

  if (reportQuery.isPending || snapshotQuery.isPending) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-base-content/60">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Loading
        snapshot…
      </div>
    );
  }

  if (!report || !snapshot || !snapshotData) {
    return (
      <div className="p-8 text-sm text-base-content/60">
        Snapshot not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Branding header */}
      <header
        className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: report.brandColor ?? "var(--bc)",
          backgroundColor: report.brandColor
            ? `${report.brandColor}08`
            : undefined,
        }}
      >
        <div className="min-w-0">
          <h2
            className="text-xl font-semibold"
            style={{ color: report.brandColor ?? undefined }}
          >
            {report.name}
          </h2>
          {report.clientName ? (
            <p className="text-sm text-base-content/70">{report.clientName}</p>
          ) : null}
        </div>
        <div className="text-left text-xs text-base-content/50 sm:text-right">
          <p>
            Generated{" "}
            {snapshotData.generatedAt
              ? new Date(snapshotData.generatedAt).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            Range {snapshotData.range.startDate || "?"} to{" "}
            {snapshotData.range.endDate || "?"}
          </p>
        </div>
      </header>

      {/* Sections */}
      {report.sections.map((section) => {
        const result = snapshotData.sections[section.type];
        const label = getReportSectionLabel(section.type);
        if (!result) {
          return (
            <div
              key={section.id}
              className="rounded-xl border border-base-300 p-4"
            >
              <h3 className="text-sm font-semibold">{label}</h3>
              <p className="mt-1 text-xs text-base-content/50">
                No data was captured for this section in the snapshot.
              </p>
            </div>
          );
        }
        if (result.status === "skipped") {
          return (
            <div
              key={section.id}
              className="rounded-xl border border-base-300 p-4"
            >
              <h3 className="text-sm font-semibold">{label}</h3>
              <p className="mt-1 text-xs text-base-content/50">
                Skipped: {result.reason}
              </p>
            </div>
          );
        }
        if (result.status === "error") {
          return (
            <div
              key={section.id}
              className="alert alert-error text-sm"
              role="alert"
            >
              <div>
                <h3 className="font-semibold">{label}: error</h3>
                <p>{result.error}</p>
              </div>
            </div>
          );
        }
        return (
          <SectionRenderer
            key={section.id}
            type={section.type}
            data={result.data}
          />
        );
      })}

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn btn-outline btn-sm gap-1"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-3.5" aria-hidden />
          )}
          Generate new snapshot
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm gap-1"
          onClick={() => {
            try {
              reportPdf(report, snapshotData);
              toast.success("PDF downloaded");
            } catch {
              toast.error("PDF export failed");
            }
          }}
        >
          <Download className="size-3.5" aria-hidden /> Download PDF
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section dispatch
// ---------------------------------------------------------------------------

// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- legacy section payloads are JSON
function SectionRenderer({ type, data }: { type: string; data: unknown }) {
  switch (type) {
    case "rank":
      return <RankSection data={data as Record<string, unknown>} />;
    case "audit":
      return <AuditSection data={data as Record<string, unknown>} />;
    case "gsc":
      return <GscSection data={data as Record<string, unknown>} />;
    case "ga4":
      return <Ga4Section data={data as Record<string, unknown>} />;
    case "backlinks":
      return <BacklinksSection data={data as Record<string, unknown>} />;
    case "content":
      return <ContentSection data={data as Record<string, unknown>} />;
    case "gmb_grid":
      return <GmbGridReportSection data={data} />;
    case "brand_lookup":
      return <BrandLookupReportSection data={data} />;
    case "ai_tracking":
      return <AiTrackingReportSection data={data} />;
    default:
      return (
        <div className="rounded-xl border border-base-300 p-4">
          <h3 className="text-sm font-semibold">
            {getReportSectionLabel(type)}
          </h3>
          <p className="mt-1 text-xs text-base-content/50">
            This section has no snapshot renderer yet.
          </p>
        </div>
      );
  }
}
