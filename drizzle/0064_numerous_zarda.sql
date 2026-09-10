CREATE TABLE `ai_discovered_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`config_id` text NOT NULL,
	`prompt` text NOT NULL,
	`platform` text DEFAULT 'all' NOT NULL,
	`ai_search_volume` integer DEFAULT 0 NOT NULL,
	`has_mention` integer DEFAULT false NOT NULL,
	`has_citation` integer DEFAULT false NOT NULL,
	`citation_url` text,
	`brand_entities` text DEFAULT '[]' NOT NULL,
	`sources` text DEFAULT '[]' NOT NULL,
	`is_tracked` integer DEFAULT false NOT NULL,
	`first_response_at` text,
	`last_response_at` text,
	`discovered_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`config_id`) REFERENCES `ai_tracking_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_discovered_prompts_config_idx` ON `ai_discovered_prompts` (`config_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_discovered_prompts_config_prompt_uniq` ON `ai_discovered_prompts` (`config_id`,`prompt`);--> statement-breakpoint
CREATE INDEX `ai_discovered_prompts_volume_idx` ON `ai_discovered_prompts` (`config_id`,`ai_search_volume`);--> statement-breakpoint
CREATE TABLE `ai_top_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`config_id` text NOT NULL,
	`url` text NOT NULL,
	`platform` text DEFAULT 'all' NOT NULL,
	`mentions` integer DEFAULT 0 NOT NULL,
	`ai_search_volume` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`config_id`) REFERENCES `ai_tracking_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_top_pages_config_idx` ON `ai_top_pages` (`config_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_top_pages_config_url_platform_uniq` ON `ai_top_pages` (`config_id`,`url`,`platform`);--> statement-breakpoint
CREATE TABLE `ai_visibility_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`config_id` text NOT NULL,
	`snapshot_date` text NOT NULL,
	`platform` text DEFAULT 'all' NOT NULL,
	`visibility_score` integer DEFAULT 0 NOT NULL,
	`mention_rate` integer DEFAULT 0 NOT NULL,
	`citation_rate` integer DEFAULT 0 NOT NULL,
	`share_of_voice` integer DEFAULT 0 NOT NULL,
	`prompts_tracked` integer DEFAULT 0 NOT NULL,
	`prompts_mentioned` integer DEFAULT 0 NOT NULL,
	`prompts_cited` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`config_id`) REFERENCES `ai_tracking_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_visibility_snapshots_config_idx` ON `ai_visibility_snapshots` (`config_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_visibility_snapshots_config_date_plat_uniq` ON `ai_visibility_snapshots` (`config_id`,`snapshot_date`,`platform`);--> statement-breakpoint
ALTER TABLE `ai_tracking_configs` ADD `location_code` integer DEFAULT 2840 NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_tracking_configs` ADD `language_code` text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_tracking_configs` ADD `last_discovery_at` text;