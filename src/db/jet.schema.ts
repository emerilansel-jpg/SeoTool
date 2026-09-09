import { sqliteTable, text, index, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "./better-auth-schema";
import { projects } from "./app.schema";

// One row per Jet chat session. The conversation history itself lives in the
// JetChatAgent Durable Object's SQLite (keyed by this id); this table is the
// listable registry the session side-panel reads from, and the project/user
// scoping the Worker authorizes a connection against before it reaches the DO.
export const jetSessions = sqliteTable(
  "sam_sessions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New chat"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    // Soft-delete marker: null = active.
    archivedAt: text("archived_at"),
  },
  (table) => [
    index("sam_sessions_project_updated_idx").on(
      table.projectId,
      table.updatedAt,
    ),
  ],
);

// Jet's persistent project memory: one row per (project, context-block label).
export const jetProjectMemory = sqliteTable(
  "sam_project_memory",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    content: text("content").notNull(),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.label] })],
);

// Backward-compatibility aliases
export const samSessions = jetSessions;
export const samProjectMemory = jetProjectMemory;
