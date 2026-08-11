import { relations } from "drizzle-orm";
import {
  text,
  boolean,
  timestamp,
  varchar,
  pgTable,
  index,
} from "drizzle-orm/pg-core";
import { projects } from "@/db/pg/app.schema";

export const alertRules = pgTable(
  "alert_rules",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    metricType: varchar("metric_type", { length: 50 }).notNull(),
    conditionJson: text("condition_json").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    frequency: varchar("frequency", { length: 20 }).notNull().default("daily"),
    nextCheckAt: timestamp("next_check_at", { mode: "date" }),
    lastTriggeredAt: timestamp("last_triggered_at", { mode: "date" }),
    recipients: text("recipients").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
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
