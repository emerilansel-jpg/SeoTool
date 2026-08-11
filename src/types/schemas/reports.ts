import { z } from "zod";

/** Section types a report can include. Each maps to a data source. */
export const REPORT_SECTION_TYPES = [
  "rank",
  "audit",
  "gsc",
  "ga4",
  "backlinks",
  "content",
] as const;

export const REPORT_SCHEDULES = ["none", "weekly", "monthly"] as const;
export type ReportSchedule = (typeof REPORT_SCHEDULES)[number];

const projectScoped = {
  projectId: z.string().min(1),
};

const sectionInput = z.object({
  type: z.enum(REPORT_SECTION_TYPES),
  // Section-specific params (date range, limit, etc.). Optional config blob.
  config: z.record(z.string(), z.unknown()).optional(),
});

export const createReportInputSchema = z.object({
  ...projectScoped,
  name: z.string().min(1).max(120),
  schedule: z.enum(REPORT_SCHEDULES).default("none"),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
  clientName: z.string().max(120).optional(),
  logoUrl: z.string().url().optional(),
  brandColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
  recipients: z.string().optional(),
  sections: z.array(sectionInput).min(1),
});

export const updateReportInputSchema = createReportInputSchema.extend({
  reportId: z.string().min(1),
});

export const reportIdInputSchema = z.object({
  ...projectScoped,
  reportId: z.string().min(1),
});

export const listSnapshotsInputSchema = z.object({
  ...projectScoped,
  reportId: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(10),
});

export const snapshotIdInputSchema = z.object({
  ...projectScoped,
  snapshotId: z.string().min(1),
});
