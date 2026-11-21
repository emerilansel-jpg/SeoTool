import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// IndexNow auto-indexing: one API key per project (the key file must be
// hosted at the target site's root), plus a submission history log.
export const indexNowKeys = pgTable(
  "indexnow_keys",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // Host that owns the key, e.g. "example.com".
    host: text("host").notNull(),
    // 32-char hex IndexNow key; key file content is exactly this string.
    key: text("key").notNull(),
    // "pending" = key file not verified yet; "verified" = live submission ok.
    status: text("status", { enum: ["pending", "verified"] })
      .notNull()
      .default("pending"),
    verifiedAt: text("verified_at"),
    lastError: text("last_error"),
    // When on, finished site audits auto-submit new/changed URLs.
    autoSubmit: boolean("auto_submit").notNull().default(false),
    autoSubmittedAt: text("auto_submitted_at"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("indexnow_keys_project_idx").on(table.projectId),
    index("indexnow_keys_organization_idx").on(table.organizationId),
    uniqueIndex("indexnow_keys_key_idx").on(table.key),
  ],
);

export const indexNowSubmissions = pgTable(
  "indexnow_submissions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    host: text("host").notNull(),
    // JSON array of submitted URLs.
    urls: text("urls").notNull(),
    urlCount: integer("url_count").notNull().default(0),
    // "manual" (user-submitted) or "auto_audit" (audit completion hook).
    trigger: text("trigger", { enum: ["manual", "auto_audit"] }).notNull(),
    // "success" | "partial" | "failed" | "skipped" (e.g. unverified key).
    status: text("status", {
      enum: ["success", "partial", "failed", "skipped"],
    }).notNull(),
    // HTTP status / engine ack summary for the audit trail.
    responseStatus: integer("response_status"),
    responseSummary: text("response_summary"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("indexnow_submissions_project_idx").on(
      table.projectId,
      table.createdAt,
    ),
    index("indexnow_submissions_organization_idx").on(table.organizationId),
  ],
);
