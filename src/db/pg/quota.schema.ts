import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// Postgres mirror of src/db/quota.schema.ts. Kept structurally identical so
// the provider-aware db barrel works on both backends (enforced by schema-
// parity). See the D1 file for full notes.
export const usageQuota = pgTable(
  "usage_quota",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    feature: text("feature").notNull(),
    period: text("period", { enum: ["daily", "monthly"] }).notNull(),
    used: integer("used").notNull().default(0),
    windowStart: text("window_start").notNull(),
    windowEnd: text("window_end").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("usage_quota_org_feature_period_idx").on(
      table.organizationId,
      table.feature,
      table.period,
    ),
    index("usage_quota_org_idx").on(table.organizationId),
  ],
);

export const subscription = pgTable(
  "subscription",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    planTier: text("plan_tier", {
      enum: ["free", "lite", "pro", "agency"],
    })
      .notNull()
      .default("free"),
    paypalSubscriptionId: text("paypal_subscription_id"),
    status: text("status").notNull().default("active"),
    currentPeriodEnd: text("current_period_end"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("subscription_paypal_sub_idx").on(table.paypalSubscriptionId),
  ],
);
