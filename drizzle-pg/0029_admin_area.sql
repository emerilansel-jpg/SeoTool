-- Admin area tables: app_settings, plan_config, cms_posts, cms_pages, paypal_webhook_events.
-- (user/session admin columns ship in 0028_admin_columns)
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"is_secret" boolean DEFAULT false NOT NULL,
	"updated_by_user_id" text,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);--> statement-breakpoint
CREATE TABLE "plan_config" (
	"tier" text PRIMARY KEY NOT NULL,
	"price_usd_cents" integer NOT NULL,
	"monthly_credits" integer NOT NULL,
	"paypal_plan_id" text,
	"sync_status" text DEFAULT 'synced' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_by_user_id" text,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);--> statement-breakpoint
CREATE TABLE "cms_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"description" text,
	"content_md" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" text,
	"author_user_id" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);--> statement-breakpoint
CREATE TABLE "cms_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"content_md" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"updated_by_user_id" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);--> statement-breakpoint
CREATE TABLE "paypal_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"organization_id" text,
	"status" text DEFAULT 'received' NOT NULL,
	"error_message" text,
	"payload" text NOT NULL,
	"received_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
