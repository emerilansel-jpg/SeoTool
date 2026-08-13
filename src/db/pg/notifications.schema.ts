import { relations } from "drizzle-orm";
import { text, timestamp, varchar, pgTable, index } from "drizzle-orm/pg-core";
import { user } from "@/db/pg/better-auth-schema";

/**
 * Per-user in-app notifications (the bell inbox). Scoped to a single recipient
 * (`userId`); writers fan out one row per org member when an org-level event
 * (alert triggered, report delivered) occurs. Mirror of the SQLite definition
 * — `schema-parity.test.ts` asserts the two are structurally interchangeable.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    title: text("title").notNull(),
    body: text("body"),
    linkPath: text("link_path"),
    readAt: timestamp("read_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
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
