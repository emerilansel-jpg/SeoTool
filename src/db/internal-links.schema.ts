import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// Internal link suggestions: (source page) should link to (target page) with
// anchor text + a ready-to-paste sentence. Generated from completed site
// audits (body text) plus GSC keywords ranking 4-20 (quick-win queries).
export const internalLinkSuggestions = sqliteTable(
  "internal_link_suggestions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    auditId: text("audit_id"),
    // The page that receives the new link.
    sourceUrl: text("source_url").notNull(),
    // The page being linked to (the GSC winner for the keyword).
    targetUrl: text("target_url").notNull(),
    targetKeyword: text("target_keyword").notNull(),
    // GSC average position that flagged this keyword as a quick win.
    gscPosition: text("gsc_position"),
    anchorText: text("anchor_text").notNull(),
    // A ready-to-paste sentence containing the anchor link.
    sentence: text("sentence").notNull(),
    rationale: text("rationale"),
    // "pending" → "approved" | "rejected" → "applied" | "exported"
    status: text("status", {
      enum: ["pending", "approved", "rejected", "applied", "exported"],
    })
      .notNull()
      .default("pending"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("internal_link_suggestions_project_status_idx").on(
      table.projectId,
      table.status,
    ),
    index("internal_link_suggestions_organization_idx").on(
      table.organizationId,
    ),
  ],
);
