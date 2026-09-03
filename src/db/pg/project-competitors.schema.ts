import { relations } from "drizzle-orm";
import {
  text,
  timestamp,
  varchar,
  pgTable,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { projects } from "@/db/pg/app.schema";

/** Persisted competitor domains per project. Used to auto-fill Content Gap
 *  and Link Intersect forms so users don't have to re-enter competitors
 *  every time. */
export const projectCompetitors = pgTable(
  "project_competitors",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
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
