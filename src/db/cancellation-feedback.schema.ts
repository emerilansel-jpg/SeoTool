import { relations, sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";
import { organization } from "@/db/better-auth-schema";

/** Exit-survey responses captured in the All Access cancel flow. Kept even
 *  after the org is deleted (userId is a plain column, no user FK) so churn
 *  analytics survive account removal. */
export const cancellationFeedback = sqliteTable(
  "cancellation_feedback",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    planTier: text("plan_tier").notNull(),
    // One of CANCELLATION_REASONS from @/shared/cancellation
    reason: text("reason").notNull(),
    detail: text("detail"),
    offerAccepted: integer("offer_accepted", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
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
