import { sql } from "drizzle-orm";
import { index, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { user } from "./better-auth-schema";
import { projects } from "./app.schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// One row per Jet chat session.
export const jetSessions = pgTable(
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
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
    archivedAt: text("archived_at"),
  },
  (table) => [
    index("sam_sessions_project_updated_idx").on(
      table.projectId,
      table.updatedAt,
    ),
  ],
);

// Jet's persistent project memory.
export const jetProjectMemory = pgTable(
  "sam_project_memory",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    content: text("content").notNull(),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.label] })],
);

// Backward-compatibility aliases
export const samSessions = jetSessions;
export const samProjectMemory = jetProjectMemory;
