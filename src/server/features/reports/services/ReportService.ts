// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- DB enum types narrowed from string
import { AppError } from "@/server/lib/errors";
import {
  ReportsRepository,
  type Report,
  type ReportSection,
  type ReportSnapshot,
} from "@/server/features/reports/repositories/ReportsRepository";
import { computeNextRunAt } from "@/server/features/reports/services/reportSchedule";
import type { ReportSchedule } from "@/types/schemas/reports";

export type ReportWithSections = Report & { sections: ReportSection[] };

function parseRecipients(recipients: string | undefined): string | null {
  if (!recipients) return null;
  const list = recipients
    .split(/[,\s]+/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
  return list.length > 0 ? list.join(",") : null;
}

async function getReportWithSections(
  reportId: string,
): Promise<ReportWithSections> {
  const report = await ReportsRepository.getById(reportId);
  if (!report) throw new AppError("NOT_FOUND", "Report not found");
  const sections = await ReportsRepository.listSections(reportId);
  return { ...report, sections };
}

async function listReports(projectId: string): Promise<ReportWithSections[]> {
  const list = await ReportsRepository.listForProject(projectId);
  return Promise.all(
    list.map(async (r) => ({
      ...r,
      sections: await ReportsRepository.listSections(r.id),
    })),
  );
}

type CreateInput = {
  projectId: string;
  organizationId: string;
  name: string;
  schedule: ReportSchedule;
  dayOfWeek?: number;
  dayOfMonth?: number;
  clientName?: string;
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  recipients?: string;
  sections: Array<{ type: string; config?: unknown }>;
  userId: string;
};

async function createReport(input: CreateInput): Promise<ReportWithSections> {
  const nextRunAt = computeNextRunAt(
    input.schedule,
    input.dayOfWeek ?? null,
    input.dayOfMonth ?? null,
  );
  const report = await ReportsRepository.insertReport({
    id: crypto.randomUUID(),
    projectId: input.projectId,
    organizationId: input.organizationId,
    name: input.name,
    schedule: input.schedule,
    dayOfWeek: input.dayOfWeek ?? null,
    dayOfMonth: input.dayOfMonth ?? null,
    nextRunAt,
    clientName: input.clientName ?? null,
    logoUrl: input.logoUrl ?? null,
    brandColor: input.brandColor ?? null,
    accentColor: input.accentColor ?? null,
    recipients: parseRecipients(input.recipients),
    createdByUserId: input.userId,
  });
  await ReportsRepository.replaceSections(
    report.id,
    input.sections.map((s, i) => ({
      type: s.type,
      config: s.config ? JSON.stringify(s.config) : null,
      sortOrder: i,
    })),
  );
  return getReportWithSections(report.id);
}

async function updateReport(
  reportId: string,
  input: Omit<CreateInput, "projectId" | "organizationId" | "userId">,
): Promise<ReportWithSections> {
  const existing = await ReportsRepository.getById(reportId);
  if (!existing) throw new AppError("NOT_FOUND", "Report not found");
  const nextRunAt = computeNextRunAt(
    input.schedule,
    input.dayOfWeek ?? null,
    input.dayOfMonth ?? null,
  );
  await ReportsRepository.updateReport(reportId, {
    name: input.name,
    schedule: input.schedule,
    dayOfWeek: input.dayOfWeek ?? null,
    dayOfMonth: input.dayOfMonth ?? null,
    nextRunAt,
    clientName: input.clientName ?? null,
    logoUrl: input.logoUrl ?? null,
    brandColor: input.brandColor ?? null,
    accentColor: input.accentColor ?? null,
    recipients: parseRecipients(input.recipients),
  });
  await ReportsRepository.replaceSections(
    reportId,
    input.sections.map((s, i) => ({
      type: s.type,
      config: s.config ? JSON.stringify(s.config) : null,
      sortOrder: i,
    })),
  );
  return getReportWithSections(reportId);
}

async function deleteReport(reportId: string): Promise<void> {
  await ReportsRepository.deleteReport(reportId);
}

async function listSnapshots(
  reportId: string,
  limit: number,
): Promise<ReportSnapshot[]> {
  return ReportsRepository.listSnapshots(reportId, limit);
}

async function getSnapshot(snapshotId: string): Promise<ReportSnapshot | null> {
  return ReportsRepository.getSnapshot(snapshotId);
}

/** Advance a report's nextRunAt after a scheduled run completes. */
async function scheduleNextRun(reportId: string): Promise<void> {
  const report = await ReportsRepository.getById(reportId);
  if (!report) return;
  const nextRunAt = computeNextRunAt(
    report.schedule as ReportSchedule,
    report.dayOfWeek,
    report.dayOfMonth,
  );
  if (nextRunAt) {
    await ReportsRepository.updateReport(reportId, { nextRunAt });
  }
}

export { computeNextRunAt };
export const ReportService = {
  getReportWithSections,
  listReports,
  createReport,
  updateReport,
  deleteReport,
  listSnapshots,
  getSnapshot,
  scheduleNextRun,
};
