import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Admin-area tables: runtime-editable provider settings, plan pricing
// overrides, CMS content, and the PayPal webhook audit log. See
// src/db/admin.schema.ts for the provider-neutral re-export.

/** Runtime overrides for environment-provided configuration. Values here win
 *  over env vars (see src/server/lib/runtime-env.ts); empty values fall back
 *  to env. Secret values are write-only from the admin UI. */
export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  isSecret: integer("is_secret", { mode: "boolean" }).notNull().default(false),
  updatedByUserId: text("updated_by_user_id"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/** Per-tier pricing overrides. Rows are sparse: a missing tier falls back to
 *  the constants in src/shared/plans.ts. */
export const planConfig = sqliteTable("plan_config", {
  tier: text("tier").primaryKey(),
  priceUsdCents: integer("price_usd_cents").notNull(),
  monthlyCredits: integer("monthly_credits").notNull(),
  paypalPlanId: text("paypal_plan_id"),
  syncStatus: text("sync_status").notNull().default("synced"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  reservedSeats: integer("reserved_seats").notNull().default(0),
  updatedByUserId: text("updated_by_user_id"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/** Blog posts for the public /blogs routes. */
export const cmsPosts = sqliteTable("cms_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  contentMd: text("content_md").notNull(),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  authorUserId: text("author_user_id"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/** CMS pages: the legal pages (privacy, terms, ...) plus arbitrary custom
 *  pages served under /pages/{slug}. */
export const cmsPages = sqliteTable("cms_pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  contentMd: text("content_md").notNull(),
  status: text("status").notNull().default("draft"),
  updatedByUserId: text("updated_by_user_id"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/** Audit log of received PayPal webhook events (raw payload kept for
 *  debugging and replay decisions). */
export const paypalWebhookEvents = sqliteTable("paypal_webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  organizationId: text("organization_id"),
  status: text("status").notNull().default("received"),
  errorMessage: text("error_message"),
  payload: text("payload").notNull(),
  receivedAt: text("received_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
