-- Better Auth additionalFields on user (declared in auth-options.ts, missing columns)
ALTER TABLE `user` ADD `email_product_updates` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `email_alert_notifications` integer;
