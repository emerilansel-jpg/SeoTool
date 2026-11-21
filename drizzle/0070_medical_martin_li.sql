CREATE TABLE `ai_bot_daily_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`day` text NOT NULL,
	`bot` text NOT NULL,
	`hits` integer DEFAULT 0 NOT NULL,
	`unique_urls` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_bot_daily_stats_project_day_bot_idx` ON `ai_bot_daily_stats` (`project_id`,`day`,`bot`);--> statement-breakpoint
CREATE INDEX `ai_bot_daily_stats_project_day_idx` ON `ai_bot_daily_stats` (`project_id`,`day`);--> statement-breakpoint
CREATE TABLE `ai_bot_hits` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`bot` text NOT NULL,
	`url` text NOT NULL,
	`user_agent` text,
	`status_code` integer,
	`ip_hash` text,
	`source` text NOT NULL,
	`hit_at` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_bot_hits_project_hit_idx` ON `ai_bot_hits` (`project_id`,`hit_at`);--> statement-breakpoint
CREATE INDEX `ai_bot_hits_project_bot_idx` ON `ai_bot_hits` (`project_id`,`bot`,`hit_at`);--> statement-breakpoint
CREATE INDEX `ai_bot_hits_project_url_idx` ON `ai_bot_hits` (`project_id`,`url`);--> statement-breakpoint
CREATE TABLE `ai_bot_sites` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`domain` text NOT NULL,
	`ingest_token` text NOT NULL,
	`robots_compliance` text,
	`robots_checked_at` text,
	`last_hit_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_bot_sites_project_idx` ON `ai_bot_sites` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_bot_sites_token_idx` ON `ai_bot_sites` (`ingest_token`);--> statement-breakpoint
CREATE INDEX `ai_bot_sites_organization_idx` ON `ai_bot_sites` (`organization_id`);--> statement-breakpoint
CREATE TABLE `gsc_rank_history` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`keyword_id` text NOT NULL,
	`day` text NOT NULL,
	`position` real,
	`impressions` integer DEFAULT 0 NOT NULL,
	`clicks` integer DEFAULT 0 NOT NULL,
	`url` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`keyword_id`) REFERENCES `gsc_tracked_keywords`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gsc_rank_history_keyword_day_idx` ON `gsc_rank_history` (`keyword_id`,`day`);--> statement-breakpoint
CREATE INDEX `gsc_rank_history_project_day_idx` ON `gsc_rank_history` (`project_id`,`day`);--> statement-breakpoint
CREATE TABLE `gsc_tracked_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`keyword` text NOT NULL,
	`last_position` real,
	`last_impressions` integer DEFAULT 0 NOT NULL,
	`last_clicks` integer DEFAULT 0 NOT NULL,
	`last_url` text,
	`last_day` text,
	`status` text DEFAULT 'active' NOT NULL,
	`first_seen_at` text DEFAULT (current_timestamp) NOT NULL,
	`last_synced_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gsc_tracked_keywords_project_keyword_idx` ON `gsc_tracked_keywords` (`project_id`,`keyword`);--> statement-breakpoint
CREATE INDEX `gsc_tracked_keywords_project_idx` ON `gsc_tracked_keywords` (`project_id`);--> statement-breakpoint
CREATE INDEX `gsc_tracked_keywords_organization_idx` ON `gsc_tracked_keywords` (`organization_id`);--> statement-breakpoint
CREATE TABLE `indexnow_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`host` text NOT NULL,
	`key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`verified_at` text,
	`last_error` text,
	`auto_submit` integer DEFAULT false NOT NULL,
	`auto_submitted_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `indexnow_keys_project_idx` ON `indexnow_keys` (`project_id`);--> statement-breakpoint
CREATE INDEX `indexnow_keys_organization_idx` ON `indexnow_keys` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `indexnow_keys_key_idx` ON `indexnow_keys` (`key`);--> statement-breakpoint
CREATE TABLE `indexnow_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`host` text NOT NULL,
	`urls` text NOT NULL,
	`url_count` integer DEFAULT 0 NOT NULL,
	`trigger` text NOT NULL,
	`status` text NOT NULL,
	`response_status` integer,
	`response_summary` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `indexnow_submissions_project_idx` ON `indexnow_submissions` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `indexnow_submissions_organization_idx` ON `indexnow_submissions` (`organization_id`);