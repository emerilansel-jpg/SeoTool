import { and, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  reports,
  reportSections,
  reportSnapshots,
  reportDeliveries,
} from "@/db/schema";

export type Report = typeof reports.$inferSelect;
export type ReportSection = typeof reportSections.$inferSelect;
export type ReportSnapshot = typeof reportSnapshots.$inferSelect;

// --- Reports ---------------------------------------------------------------

async function getById(reportId: string): Promise<Report | null> {
  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);
  return rows[0] ?? null;
}

async function listForProject(projectId: string): Promise<Report[]> {
  return db
    .select()
    .from(reports)
    .where(eq(reports.projectId, projectId))
    .orderBy(desc(reports.updatedAt));
}

async function insertReport(input: {
  id: string;
  projectId: string;
  organizationId: string;
  name: string;
  schedule: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  nextRunAt: string | null;
  clientName: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  accentColor: string | null;
  recipients: string | null;
  createdByUserId: string;
}): Promise<Report> {
  const [row] = await db.insert(reports).values(input).returning();
  if (!row) throw new Error("Failed to insert report");
  return row;
}

async function updateReport(
  reportId: string,
  set: Partial<{
    name: string;
    schedule: string;
    dayOfWeek: number | null;
    dayOfMonth: number | null;
    nextRunAt: string | null;
    clientName: string | null;
    logoUrl: string | null;
    brandColor: string | null;
    accentColor: string | null;
    recipients: string | null;
  }>,
): Promise<void> {
  await db
    .update(reports)
    .set({ ...set, updatedAt: sql`(current_timestamp)` })
    .where(eq(reports.id, reportId));
}

async function deleteReport(reportId: string): Promise<void> {
  await db.delete(reports).where(eq(reports.id, reportId));
}

/** Reports whose next scheduled run is due. Used by the cron dispatcher. */
async function listDue(nowIso: string): Promise<Report[]> {
  return db
    .select()
    .from(reports)
    .where(and(eq(reports.schedule, "weekly"), lte(reports.nextRunAt, nowIso)));
}

// --- Sections --------------------------------------------------------------

async function listSections(reportId: string): Promise<ReportSection[]> {
  return db
    .select()
    .from(reportSections)
    .where(eq(reportSections.reportId, reportId))
    .orderBy(reportSections.sortOrder);
}

async function replaceSections(
  reportId: string,
  sections: Array<{
    type: string;
    config: string | null;
    sortOrder: number;
  }>,
): Promise<void> {
  await db.delete(reportSections).where(eq(reportSections.reportId, reportId));
  if (sections.length === 0) return;
  await db.insert(reportSections).values(
    sections.map((s, i) => ({
      id: crypto.randomUUID(),
      reportId,
      type: s.type,
      config: s.config,
      sortOrder: s.sortOrder ?? i,
    })),
  );
}

// --- Snapshots -------------------------------------------------------------

async function insertSnapshot(input: {
  id: string;
  reportId: string;
  rangeStart: string | null;
  rangeEnd: string | null;
  data: string;
}): Promise<ReportSnapshot> {
  const [row] = await db.insert(reportSnapshots).values(input).returning();
  if (!row) throw new Error("Failed to insert report snapshot");
  return row;
}

async function getSnapshot(snapshotId: string): Promise<ReportSnapshot | null> {
  const rows = await db
    .select()
    .from(reportSnapshots)
    .where(eq(reportSnapshots.id, snapshotId))
    .limit(1);
  return rows[0] ?? null;
}

async function listSnapshots(
  reportId: string,
  limit: number,
): Promise<ReportSnapshot[]> {
  return db
    .select()
    .from(reportSnapshots)
    .where(eq(reportSnapshots.reportId, reportId))
    .orderBy(desc(reportSnapshots.createdAt))
    .limit(limit);
}

// --- Deliveries ------------------------------------------------------------

async function insertDelivery(input: {
  id: string;
  snapshotId: string;
  recipients: string;
  status: string;
}): Promise<void> {
  await db.insert(reportDeliveries).values(input);
}

async function markDelivery(
  deliveryId: string,
  status: string,
  error: string | null,
): Promise<void> {
  await db
    .update(reportDeliveries)
    .set({
      status,
      error,
      sentAt: status === "sent" ? sql`(current_timestamp)` : null,
    })
    .where(eq(reportDeliveries.id, deliveryId));
}

export const ReportsRepository = {
  getById,
  listForProject,
  insertReport,
  updateReport,
  deleteReport,
  listDue,
  listSections,
  replaceSections,
  insertSnapshot,
  getSnapshot,
  listSnapshots,
  insertDelivery,
  markDelivery,
};
