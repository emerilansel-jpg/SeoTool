import { relations, sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";
import { projects } from "@/db/app.schema";

export const alertRules = sqliteTable(
  "alert_rules",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // "rank_drop" | "audit_critical"
    metricType: text("metric_type").notNull(),
    // JSON-encoded condition: { threshold, operator, keyword?, device? }
    conditionJson: text("condition_json").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    // "daily" | "weekly"
    frequency: text("frequency").notNull().default("daily"),
    nextCheckAt: integer("next_check_at", { mode: "timestamp" }),
    lastTriggeredAt: integer("last_triggered_at", { mode: "timestamp" }),
    // Comma-separated email addresses
    recipients: text("recipients").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("alert_rules_project_id_idx").on(table.projectId),
    index("alert_rules_next_check_idx").on(table.enabled, table.nextCheckAt),
  ],
);

export const alertRulesRelations = relations(alertRules, ({ one }) => ({
  project: one(projects, {
    fields: [alertRules.projectId],
    references: [projects.id],
  }),
}));
