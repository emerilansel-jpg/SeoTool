import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  index,
  unique,
} from "drizzle-orm/sqlite-core";
import { projects } from "@/db/app.schema";

/** Persisted competitor domains per project. Used to auto-fill Content Gap
 *  and Link Intersect forms so users don't have to re-enter competitors
 *  every time. */
export const projectCompetitors = sqliteTable(
  "project_competitors",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("project_competitors_project_id_idx").on(table.projectId),
    unique("project_competitors_project_domain_uniq").on(
      table.projectId,
      table.domain,
    ),
  ],
);

export const projectCompetitorsRelations = relations(
  projectCompetitors,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectCompetitors.projectId],
      references: [projects.id],
    }),
  }),
);
