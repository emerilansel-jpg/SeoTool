CREATE TABLE `keyword_pro_membership_payments` (
	`paypal_sale_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`paypal_subscription_id` text NOT NULL,
	`gross_amount_usd_cents` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `keyword_pro_membership_payments_org_created_idx` ON `keyword_pro_membership_payments` (`organization_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `keyword_pro_memberships` ADD `checkout_expires_at` text;--> statement-breakpoint
ALTER TABLE `keyword_pro_memberships` ADD `seat_release_token` text;--> statement-breakpoint
CREATE INDEX `keyword_pro_memberships_checkout_expiry_idx` ON `keyword_pro_memberships` (`status`,`checkout_expires_at`);
