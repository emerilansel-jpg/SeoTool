import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// Postgres mirror of src/db/d1/admin.schema.ts (kept structurally identical;
// schema-parity.test.ts guards drift).

/** Runtime overrides for environment-provided configuration. Values here win
 *  over env vars (see src/server/lib/runtime-env.ts); empty values fall back
 *  to env. Secret values are write-only from the admin UI. */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  isSecret: boolean("is_secret").notNull().default(false),
  updatedByUserId: text("updated_by_user_id"),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

/** Per-tier pricing overrides. Rows are sparse: a missing tier falls back to
 *  the constants in src/shared/plans.ts. */
export const planConfig = pgTable("plan_config", {
  tier: text("tier").primaryKey(),
  priceUsdCents: integer("price_usd_cents").notNull(),
  monthlyCredits: integer("monthly_credits").notNull(),
  paypalPlanId: text("paypal_plan_id"),
  syncStatus: text("sync_status").notNull().default("synced"),
  active: boolean("active").notNull().default(true),
  updatedByUserId: text("updated_by_user_id"),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

/** Blog posts for the public /blogs routes. */
export const cmsPosts = pgTable("cms_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  contentMd: text("content_md").notNull(),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  authorUserId: text("author_user_id"),
  createdAt: text("created_at").notNull().default(isoNow),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

/** CMS pages: the legal pages (privacy, terms, ...) plus arbitrary custom
 *  pages served under /pages/{slug}. */
export const cmsPages = pgTable("cms_pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  contentMd: text("content_md").notNull(),
  status: text("status").notNull().default("draft"),
  updatedByUserId: text("updated_by_user_id"),
  createdAt: text("created_at").notNull().default(isoNow),
  updatedAt: text("updated_at").notNull().default(isoNow),
});

/** Audit log of received PayPal webhook events (raw payload kept for
 *  debugging and replay decisions). */
export const paypalWebhookEvents = pgTable("paypal_webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  organizationId: text("organization_id"),
  status: text("status").notNull().default("received"),
  errorMessage: text("error_message"),
  payload: text("payload").notNull(),
  receivedAt: text("received_at").notNull().default(isoNow),
});
