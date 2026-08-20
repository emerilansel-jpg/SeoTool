-- Better Auth additionalFields on user (declared in auth-options.ts, missing columns)
-- IF NOT EXISTS: the columns were hot-applied to production manually while the
-- journal was being repaired, so this migration may run against a DB that
-- already has them.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email_product_updates" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email_alert_notifications" boolean;
