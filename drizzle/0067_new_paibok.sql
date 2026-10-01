CREATE TABLE `brand_lookup_platform_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`platform` text NOT NULL,
	`status` text NOT NULL,
	`mentions` integer,
	`ai_search_volume` integer,
	FOREIGN KEY (`snapshot_id`) REFERENCES `brand_lookup_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brand_lookup_platform_snapshot_uniq` ON `brand_lookup_platform_snapshots` (`snapshot_id`,`platform`);--> statement-breakpoint
CREATE INDEX `brand_lookup_platform_snapshot_idx` ON `brand_lookup_platform_snapshots` (`snapshot_id`);--> statement-breakpoint
CREATE TABLE `brand_lookup_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`snapshot_date` text NOT NULL,
	`query` text NOT NULL,
	`target_type` text NOT NULL,
	`target_value` text NOT NULL,
	`location_code` integer NOT NULL,
	`language_code` text NOT NULL,
	`fetched_at` text NOT NULL,
	`has_data` integer NOT NULL,
	`total_mentions` integer,
	`total_ai_search_volume` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brand_lookup_snapshots_daily_uniq` ON `brand_lookup_snapshots` (`project_id`,`snapshot_date`,`target_type`,`target_value`,`location_code`,`language_code`);--> statement-breakpoint
CREATE INDEX `brand_lookup_snapshots_project_date_idx` ON `brand_lookup_snapshots` (`project_id`,`snapshot_date`);--> statement-breakpoint
CREATE TABLE `brand_lookup_sov_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`label` text NOT NULL,
	`is_target` integer NOT NULL,
	`mentions` integer,
	`share_pct` real,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `brand_lookup_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brand_lookup_sov_snapshot_label_uniq` ON `brand_lookup_sov_entries` (`snapshot_id`,`label`);--> statement-breakpoint
CREATE INDEX `brand_lookup_sov_snapshot_idx` ON `brand_lookup_sov_entries` (`snapshot_id`);--> statement-breakpoint
ALTER TABLE `reports` ADD `report_period` text DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE `reports` ADD `month_of_year` integer;
