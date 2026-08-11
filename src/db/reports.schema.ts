import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// White-label SEO report configuration. Each report belongs to a project and
// aggregates data from the sections configured in `report_sections`. Branding
// (client name, logo, colors) lives per-report so an agency can ship distinct
// branded reports per client from one workspace.
export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // "none" = on-demand only; "weekly" | "monthly" dispatch via cron.
    schedule: text("schedule").notNull().default("none"),
    // 0-6 (Sun-Sat) for weekly; 1-28 for monthly. Null when schedule is none.
    dayOfWeek: integer("day_of_week"),
    dayOfMonth: integer("day_of_month"),
    // ISO timestamp of the next scheduled run; null when unscheduled. Indexed
    // so the cron query (`nextRunAt <= now`) is cheap.
    nextRunAt: text("next_run_at"),
    // White-label branding.
    clientName: text("client_name"),
    logoUrl: text("logo_url"),
    brandColor: text("brand_color"),
    accentColor: text("accent_color"),
    // Comma-separated recipient emails for scheduled delivery; null = no email.
    recipients: text("recipients"),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("reports_id_idx").on(table.id),
    index("reports_organization_idx").on(table.organizationId),
    index("reports_project_idx").on(table.projectId),
    index("reports_next_run_idx").on(table.nextRunAt),
  ],
);

// One row per section included in a report. `config` is section-specific params
// (e.g. date range) as a JSON string — config, not relational data, so JSON is
// appropriate here.
export const reportSections = sqliteTable(
  "report_sections",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    // "rank" | "audit" | "gsc" | "ga4" | "backlinks"
    type: text("type").notNull(),
    config: text("config"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("report_sections_report_idx").on(table.reportId)],
);

// Immutable point-in-time data snapshot for a report. `data` is a JSON string
// holding the aggregated payload (rank rows, audit counts, gsc/ga4 totals,
// backlinks). A heterogeneous immutable payload — not relational — so JSON is
// appropriate (same justification as any serialized report/export payload).
export const reportSnapshots = sqliteTable(
  "report_snapshots",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    rangeStart: text("range_start"),
    rangeEnd: text("range_end"),
    data: text("data").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("report_snapshots_report_created_idx").on(
      table.reportId,
      table.createdAt,
    ),
  ],
);

// Tracks each scheduled delivery attempt (email) for observability/retries.
export const reportDeliveries = sqliteTable(
  "report_deliveries",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => reportSnapshots.id, { onDelete: "cascade" }),
    // "email" (only channel in v1)
    channel: text("channel").notNull().default("email"),
    recipients: text("recipients").notNull(),
    // "pending" | "sent" | "failed"
    status: text("status").notNull().default("pending"),
    error: text("error"),
    sentAt: text("sent_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("report_deliveries_snapshot_idx").on(table.snapshotId)],
);
