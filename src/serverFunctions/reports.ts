import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildSnapshot } from "@/server/features/reports/services/ReportSnapshotBuilder";
import { ReportsRepository } from "@/server/features/reports/repositories/ReportsRepository";
import { ReportService } from "@/server/features/reports/services/ReportService";
import {
  requireProjectContext,
  requireProjectRole,
} from "@/serverFunctions/middleware";
import { assertGaugeFeature } from "@/server/billing/quota-gate";

import {
  createReportInputSchema,
  updateReportInputSchema,
  reportIdInputSchema,
  listSnapshotsInputSchema,
  snapshotIdInputSchema,
} from "@/types/schemas/reports";

const projectScoped = z.object({ projectId: z.string().min(1) });
const generateSnapshotInput = z.object({
  projectId: z.string().min(1),
  reportId: z.string().min(1),
});

/** List all report configs for a project (any project member). */
export const listReports = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(projectScoped)
  .handler(async ({ context }) => {
    return { reports: await ReportService.listReports(context.projectId) };
  });

/** One report config with its sections. */
export const getReport = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(reportIdInputSchema)
  .handler(async ({ data }) => {
    return { report: await ReportService.getReportWithSections(data.reportId) };
  });

/** Create a report (manager+ only). */
export const createReport = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(createReportInputSchema)
  .handler(async ({ data, context }) => {
    // Enforce the plan's report-count limit before creating.
    await assertGaugeFeature(context.organizationId, "reports");

    const report = await ReportService.createReport({
      projectId: context.projectId,
      organizationId: context.organizationId,
      name: data.name,
      schedule: data.schedule,
      dayOfWeek: data.dayOfWeek,
      dayOfMonth: data.dayOfMonth,
      clientName: data.clientName,
      logoUrl: data.logoUrl,
      brandColor: data.brandColor,
      accentColor: data.accentColor,
      recipients: data.recipients,
      sections: data.sections,
      userId: context.userId,
    });
    return { report };
  });

/** Update a report config (manager+ only). */
export const updateReport = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(updateReportInputSchema)
  .handler(async ({ data }) => {
    const report = await ReportService.updateReport(data.reportId, {
      name: data.name,
      schedule: data.schedule,
      dayOfWeek: data.dayOfWeek,
      dayOfMonth: data.dayOfMonth,
      clientName: data.clientName,
      logoUrl: data.logoUrl,
      brandColor: data.brandColor,
      accentColor: data.accentColor,
      recipients: data.recipients,
      sections: data.sections,
    });
    return { report };
  });

/** Delete a report (manager+ only). */
export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(reportIdInputSchema)
  .handler(async ({ data, context: _context }) => {
    await ReportService.deleteReport(data.reportId);
    return { ok: true };
  });

/** Snapshot history for a report (any project member). */
export const listReportSnapshots = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(listSnapshotsInputSchema)
  .handler(async ({ data }) => {
    return {
      snapshots: await ReportService.listSnapshots(data.reportId, data.limit),
    };
  });

/** One snapshot (the immutable data payload). */
export const getReportSnapshot = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(snapshotIdInputSchema)
  .handler(async ({ data }) => {
    return { snapshot: await ReportService.getSnapshot(data.snapshotId) };
  });

/** Generate a snapshot for a report config and persist it (manager+ only). */
const _generateReportSnapshot = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(generateSnapshotInput)
  .handler(async ({ data, context }) => {
    const report = await ReportService.getReportWithSections(data.reportId);
    if (!report) return { error: "Report not found" as const };
    const payload = await buildSnapshot({
      projectId: context.projectId,
      domain: context.project?.domain ?? null,
      sections: report.sections,
    });
    const snapshot = await ReportsRepository.insertSnapshot({
      id: crypto.randomUUID(),
      reportId: data.reportId,
      rangeStart: payload.range.startDate,
      rangeEnd: payload.range.endDate,
      data: JSON.stringify(payload),
    });
    return { snapshot };
  });
