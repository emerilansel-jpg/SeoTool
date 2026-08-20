-- Better Auth additionalFields on user (declared in auth-options.ts, missing columns)
ALTER TABLE "user" ADD COLUMN "email_product_updates" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_alert_notifications" boolean;
