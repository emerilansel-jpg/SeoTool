CREATE TABLE `serp_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`tracking_keyword_id` text NOT NULL,
	`keyword` text NOT NULL,
	`device` text NOT NULL,
	`rank` integer NOT NULL,
	`url` text,
	`title` text,
	`description` text,
	`domain` text,
	`is_tracked_domain` integer DEFAULT false NOT NULL,
	`checked_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `rank_check_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `serp_snapshots_run_kw_device_idx` ON `serp_snapshots` (`run_id`,`tracking_keyword_id`,`device`);--> statement-breakpoint
CREATE INDEX `serp_snapshots_kw_rank_idx` ON `serp_snapshots` (`tracking_keyword_id`,`rank`);--> statement-breakpoint
CREATE UNIQUE INDEX `serp_snapshots_unique_idx` ON `serp_snapshots` (`run_id`,`tracking_keyword_id`,`device`,`rank`);