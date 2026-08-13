import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { withPgClient } from "@/db";
import { pgStep } from "@/server/workflows/pgStep";
import { buildSnapshot } from "@/server/features/reports/services/ReportSnapshotBuilder";
import {
  ReportService,
  type ReportWithSections,
} from "@/server/features/reports/services/ReportService";
import {
  ReportsRepository,
  type ReportSnapshot,
} from "@/server/features/reports/repositories/ReportsRepository";
import { NotificationRepository } from "@/server/features/notifications/repositories/NotificationRepository";
import { sendReportDeliveryEmail } from "@/server/email/report-delivery";

interface ReportGenerationParams {
  reportId: string;
  projectId: string;
  organizationId: string;
}

export class ReportGenerationWorkflow extends WorkflowEntrypoint<
  Cloudflare.Env,
  ReportGenerationParams
> {
  async run(event: WorkflowEvent<ReportGenerationParams>, step: WorkflowStep) {
    return withPgClient(async () => {
      const { reportId, projectId, organizationId } = event.payload;

      const report = await pgStep<ReportWithSections>(
        step,
        "load-config",
        undefined,
        () => ReportService.getReportWithSections(reportId),
      );
      if (!report) {
        throw new NonRetryableError(`Report ${reportId} not found`);
      }

      // oxlint-disable typescript-eslint/no-explicit-any,typescript-eslint/no-unsafe-assignment,typescript-eslint/no-unsafe-type-assertion -- Workflow step result needs Serializable constraint workaround
      const snapshotPayload = await pgStep<any>(
        step,
        "build-snapshot",
        undefined,
        () =>
          buildSnapshot({
            projectId,
            domain: null,
            sections: report.sections,
          }),
      );

      const snapshot = await pgStep<ReportSnapshot>(
        step,
        "persist-snapshot",
        undefined,
        () =>
          ReportsRepository.insertSnapshot({
            id: crypto.randomUUID(),
            reportId,
            rangeStart: (
              snapshotPayload as {
                range: { startDate: string; endDate: string };
              }
            ).range.startDate,
            rangeEnd: (
              snapshotPayload as {
                range: { startDate: string; endDate: string };
              }
            ).range.endDate,
            data: JSON.stringify(snapshotPayload),
          }),
      );

      await pgStep(step, "schedule-next-run", undefined, () =>
        ReportService.scheduleNextRun(reportId),
      );

      if (report.recipients) {
        await pgStep(step, "send-delivery", undefined, () =>
          sendReportDeliveryEmail({
            snapshotId: snapshot.id,
            reportId,
            projectId,
            recipients: report.recipients!,
            reportName: report.name,
            snapshotUrl: `/p/${projectId}/reports/${reportId}`,
          }),
        );
      }

      // Fan out an in-app notification so every teammate sees the fresh report
      // in the bell inbox, independent of the email recipient list.
      await pgStep(step, "create-notification", undefined, () =>
        NotificationRepository.createForOrganization(organizationId, {
          type: "report",
          title: `Report ready: ${report.name}`,
          body: "A new report snapshot has been generated.",
          linkPath: `/p/${projectId}/reports/${reportId}`,
        }),
      );
    });
  }
}
