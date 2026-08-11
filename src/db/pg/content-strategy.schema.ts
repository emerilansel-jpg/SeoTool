import { relations } from "drizzle-orm";
import {
  text,
  integer,
  timestamp,
  pgTable,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { projects } from "@/db/pg/app.schema";

export const topicClusters = pgTable(
  "topic_clusters",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    pillarPageUrl: text("pillar_page_url"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("topic_clusters_project_id_idx").on(table.projectId)],
);

export const topicClustersRelations = relations(
  topicClusters,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [topicClusters.projectId],
      references: [projects.id],
    }),
    briefs: many(contentBriefs),
  }),
);

export const contentBriefs = pgTable(
  "content_briefs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clusterId: varchar("cluster_id", { length: 36 }).references(
      () => topicClusters.id,
      { onDelete: "set null" },
    ), // Nullable
    targetKeyword: text("target_keyword").notNull(),
    title: text("title"),
    status: varchar("status", { length: 50 }).notNull().default("idea"), // idea | briefing | writing | published | archived
    priorityScore: integer("priority_score"),
    targetUrl: text("target_url"),
    briefDataJson: text("brief_data_json"), // Store generated outline, competitor ref, etc.
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("content_briefs_project_id_idx").on(table.projectId),
    index("content_briefs_cluster_id_idx").on(table.clusterId),
    index("content_briefs_status_idx").on(table.status),
  ],
);

export const contentBriefsRelations = relations(contentBriefs, ({ one }) => ({
  project: one(projects, {
    fields: [contentBriefs.projectId],
    references: [projects.id],
  }),
  cluster: one(topicClusters, {
    fields: [contentBriefs.clusterId],
    references: [topicClusters.id],
  }),
}));
