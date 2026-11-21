CREATE TABLE `coupon_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`credits` integer NOT NULL,
	`max_redemptions` integer,
	`redeemed_count` integer DEFAULT 0 NOT NULL,
	`expires_at` text,
	`note` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupon_codes_code_unique` ON `coupon_codes` (`code`);--> statement-breakpoint
CREATE INDEX `coupon_codes_active_idx` ON `coupon_codes` (`is_active`,`expires_at`);--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (
	`id` text PRIMARY KEY NOT NULL,
	`coupon_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`credits_granted` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`coupon_id`) REFERENCES `coupon_codes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupon_redemptions_coupon_org_idx` ON `coupon_redemptions` (`coupon_id`,`organization_id`);--> statement-breakpoint
CREATE INDEX `coupon_redemptions_org_idx` ON `coupon_redemptions` (`organization_id`);