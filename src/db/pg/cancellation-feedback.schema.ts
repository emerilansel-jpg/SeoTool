import { relations } from "drizzle-orm";
import {
  text,
  boolean,
  timestamp,
  varchar,
  pgTable,
  index,
} from "drizzle-orm/pg-core";
import { organization } from "@/db/pg/better-auth-schema";

/** Exit-survey responses captured in the All Access cancel flow. Kept even
 *  after the org is deleted (userId is a plain column, no user FK) so churn
 *  analytics survive account removal. */
export const cancellationFeedback = pgTable(
  "cancellation_feedback",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 36 })
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 64 }).notNull(),
    planTier: varchar("plan_tier", { length: 50 }).notNull(),
    // One of CANCELLATION_REASONS from @/shared/cancellation
    reason: varchar("reason", { length: 50 }).notNull(),
    detail: text("detail"),
    offerAccepted: boolean("offer_accepted").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("cancellation_feedback_created_idx").on(table.createdAt)],
);

export const cancellationFeedbackRelations = relations(
  cancellationFeedback,
  ({ one }) => ({
    organization: one(organization, {
      fields: [cancellationFeedback.organizationId],
      references: [organization.id],
    }),
  }),
);
