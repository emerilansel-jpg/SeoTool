import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { organization } from "./better-auth-schema";

// Per-feature usage quota per organization. Each row tracks how much of a
// metered feature an org has consumed within its current billing/window
// period. Windowed features (daily/monthly) reset when the window elapses;
// gauge features (projects, saved_keywords, rank_tracking, reports,
// audit_pages) are NOT stored here — they're checked against live counts.
//
// Only windowed features get rows: keyword_search (daily), backlink_check
// (daily), site_audit (monthly), ai_brand_lookup (monthly), ai_prompt
// (monthly), content_intelligence (monthly). Gauge features are enforced by
// counting the underlying tables directly.
export const usageQuota = sqliteTable(
  "usage_quota",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // QuotaFeature id (e.g. "keyword_search", "backlink_check"). Stored as
    // text — not a FK — because the feature set is code-defined in plans.ts.
    feature: text("feature").notNull(),
    // "daily" | "monthly" — determines reset cadence. Gauge features never
    // appear here.
    period: text("period", { enum: ["daily", "monthly"] }).notNull(),
    used: integer("used").notNull().default(0),
    // ISO-8601 UTC. The window starts when this row is first created for a
    // given (org, feature, period) and advances on reset. window_end is when
    // the next reset would occur.
    windowStart: text("window_start").notNull(),
    windowEnd: text("window_end").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    // One row per (org, feature, period). The quota check/update is an
    // upsert against this key.
    uniqueIndex("usage_quota_org_feature_period_idx").on(
      table.organizationId,
      table.feature,
      table.period,
    ),
    index("usage_quota_org_idx").on(table.organizationId),
  ],
);

// Links an organization to its current subscription/plan tier. The source of
// truth for "what plan is this org on" in our DB. Synced from PayPal via the
// billing webhook (BILLING.SUBSCRIPTION.*). The free tier is the default at
// org creation; a subscription row is upserted on first customer creation.
export const subscription = sqliteTable(
  "subscription",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    // PlanTier: "free" | "lite" | "pro" | "agency"
    planTier: text("plan_tier", {
      enum: ["free", "lite", "pro", "agency"],
    })
      .notNull()
      .default("free"),
    // PayPal subscription id (null for the free tier, which has no subscription).
    paypalSubscriptionId: text("paypal_subscription_id"),
    // "active" | "canceled" | "past_due" | "trialing"
    status: text("status").notNull().default("active"),
    // ISO-8601 UTC end of the current billing period. Used to compute
    // monthly quota window resets.
    currentPeriodEnd: text("current_period_end"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("subscription_paypal_sub_idx").on(table.paypalSubscriptionId),
  ],
);

// Durable hold placed before a billable provider request. Reserving credits
// up front prevents concurrent requests from spending the same balance; the
// hold is settled to the provider's reported cost or refunded when the
// provider confirms that no charge was made.
export const usageCreditReservations = sqliteTable(
  "usage_credit_reservations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    billingMode: text("billing_mode", { enum: ["standard", "byok"] })
      .notNull()
      .default("standard"),
    creditFeature: text("credit_feature"),
    status: text("status", {
      enum: ["pending", "reserved", "rejected", "settling", "settled"],
    })
      .notNull()
      .default("pending"),
    reservedCredits: integer("reserved_credits").notNull(),
    monthlyReserved: integer("monthly_reserved").notNull().default(0),
    topupReserved: integer("topup_reserved").notNull().default(0),
    actualCredits: integer("actual_credits"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    settledAt: text("settled_at"),
  },
  (table) => [
    index("usage_credit_reservations_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);
