import { relations, sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";
import { user } from "@/db/better-auth-schema";

/**
 * Per-user in-app notifications (the bell inbox). Scoped to a single recipient
 * (`userId`); writers fan out one row per org member when an org-level event
 * (alert triggered, report delivered) occurs.
 */
export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // "alert" | "report" | "audit" | "billing" | ...
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    // App-internal path to navigate to when the notification is opened.
    linkPath: text("link_path"),
    readAt: integer("read_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_read_idx").on(table.userId, table.readAt),
  ],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));
