CREATE TABLE `subscription` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`plan_tier` text DEFAULT 'free' NOT NULL,
	`autumn_subscription_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`current_period_end` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `subscription_autumn_sub_idx` ON `subscription` (`autumn_subscription_id`);--> statement-breakpoint
CREATE TABLE `usage_quota` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`feature` text NOT NULL,
	`period` text NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	`window_start` text NOT NULL,
	`window_end` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usage_quota_org_feature_period_idx` ON `usage_quota` (`organization_id`,`feature`,`period`);--> statement-breakpoint
CREATE INDEX `usage_quota_org_idx` ON `usage_quota` (`organization_id`);