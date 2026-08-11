import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// White-label SEO report configuration. See src/db/reports.schema.ts for full
// notes; this is the Postgres mirror kept structurally identical so the
// provider-aware db barrel works on both backends (enforced by schema-parity).
export const reports = pgTable(
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
    schedule: text("schedule").notNull().default("none"),
    dayOfWeek: integer("day_of_week"),
    dayOfMonth: integer("day_of_month"),
    nextRunAt: text("next_run_at"),
    clientName: text("client_name"),
    logoUrl: text("logo_url"),
    brandColor: text("brand_color"),
    accentColor: text("accent_color"),
    recipients: text("recipients"),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("reports_id_idx").on(table.id),
    index("reports_organization_idx").on(table.organizationId),
    index("reports_project_idx").on(table.projectId),
    index("reports_next_run_idx").on(table.nextRunAt),
  ],
);

export const reportSections = pgTable(
  "report_sections",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    config: text("config"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("report_sections_report_idx").on(table.reportId)],
);

export const reportSnapshots = pgTable(
  "report_snapshots",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    rangeStart: text("range_start"),
    rangeEnd: text("range_end"),
    data: text("data").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("report_snapshots_report_created_idx").on(
      table.reportId,
      table.createdAt,
    ),
  ],
);

export const reportDeliveries = pgTable(
  "report_deliveries",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => reportSnapshots.id, { onDelete: "cascade" }),
    channel: text("channel").notNull().default("email"),
    recipients: text("recipients").notNull(),
    status: text("status").notNull().default("pending"),
    error: text("error"),
    sentAt: text("sent_at"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [index("report_deliveries_snapshot_idx").on(table.snapshotId)],
);
