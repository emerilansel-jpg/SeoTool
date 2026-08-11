CREATE TABLE `report_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`channel` text DEFAULT 'email' NOT NULL,
	`recipients` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`error` text,
	`sent_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `report_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `report_deliveries_snapshot_idx` ON `report_deliveries` (`snapshot_id`);--> statement-breakpoint
CREATE TABLE `report_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`type` text NOT NULL,
	`config` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `report_sections_report_idx` ON `report_sections` (`report_id`);--> statement-breakpoint
CREATE TABLE `report_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`range_start` text,
	`range_end` text,
	`data` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `report_snapshots_report_created_idx` ON `report_snapshots` (`report_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`schedule` text DEFAULT 'none' NOT NULL,
	`day_of_week` integer,
	`day_of_month` integer,
	`next_run_at` text,
	`client_name` text,
	`logo_url` text,
	`brand_color` text,
	`accent_color` text,
	`recipients` text,
	`created_by_user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reports_id_idx` ON `reports` (`id`);--> statement-breakpoint
CREATE INDEX `reports_organization_idx` ON `reports` (`organization_id`);--> statement-breakpoint
CREATE INDEX `reports_project_idx` ON `reports` (`project_id`);--> statement-breakpoint
CREATE INDEX `reports_next_run_idx` ON `reports` (`next_run_at`);