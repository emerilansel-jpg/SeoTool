-- Add search_engine column to rank_tracking_configs
ALTER TABLE `rank_tracking_configs` ADD `search_engine` text NOT NULL DEFAULT 'google';--> statement-breakpoint

-- Create serp_volatility_snapshots table
CREATE TABLE `serp_volatility_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`date` text NOT NULL,
	`volatility_score` real NOT NULL,
	`keywords_sampled` integer NOT NULL,
	`avg_position_change` real NOT NULL,
	`top_movers_json` text,
	`created_at` text NOT NULL DEFAULT (current_timestamp),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `serp_volatility_project_date_idx` ON `serp_volatility_snapshots` (`project_id`,`date`);