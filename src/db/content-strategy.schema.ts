import { relations, sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";
import { projects } from "@/db/app.schema";

export const topicClusters = sqliteTable(
  "topic_clusters",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    pillarPageUrl: text("pillar_page_url"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    projectIdIdx: index("topic_clusters_project_id_idx").on(table.projectId),
  }),
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

export const contentBriefs = sqliteTable(
  "content_briefs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clusterId: text("cluster_id").references(() => topicClusters.id, {
      onDelete: "set null",
    }), // Nullable (unclustered)
    targetKeyword: text("target_keyword").notNull(),
    title: text("title"),
    status: text("status").notNull().default("idea"), // idea | briefing | writing | published | archived
    priorityScore: integer("priority_score"),
    targetUrl: text("target_url"),
    briefDataJson: text("brief_data_json"), // Store generated outline, competitor ref, etc.
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    projectIdIdx: index("content_briefs_project_id_idx").on(table.projectId),
    clusterIdIdx: index("content_briefs_cluster_id_idx").on(table.clusterId),
    statusIdx: index("content_briefs_status_idx").on(table.status),
  }),
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
