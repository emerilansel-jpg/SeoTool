CREATE TABLE `ai_tracking_citations` (
	`id` text PRIMARY KEY NOT NULL,
	`observation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`url` text NOT NULL,
	`domain` text NOT NULL,
	`title` text,
	`is_target_brand` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`observation_id`) REFERENCES `ai_tracking_observations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`run_id`) REFERENCES `ai_tracking_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_tracking_citations_obs_idx` ON `ai_tracking_citations` (`observation_id`);--> statement-breakpoint
CREATE TABLE `ai_tracking_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`brand_name` text NOT NULL,
	`domain` text NOT NULL,
	`brand_aliases` text DEFAULT '[]' NOT NULL,
	`platforms` text DEFAULT '["chat_gpt","gemini","perplexity"]' NOT NULL,
	`schedule` text DEFAULT 'manual' NOT NULL,
	`schedule_status` text DEFAULT 'idle' NOT NULL,
	`next_run_at` text,
	`last_run_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_tracking_configs_project_id_uniq` ON `ai_tracking_configs` (`project_id`);--> statement-breakpoint
CREATE TABLE `ai_tracking_mentions` (
	`id` text PRIMARY KEY NOT NULL,
	`observation_id` text NOT NULL,
	`run_id` text NOT NULL,
	`config_id` text NOT NULL,
	`brand_name` text NOT NULL,
	`domain` text NOT NULL,
	`is_target_brand` integer DEFAULT false NOT NULL,
	`position` integer,
	`sentiment` text DEFAULT 'neutral' NOT NULL,
	`evidence` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`observation_id`) REFERENCES `ai_tracking_observations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`run_id`) REFERENCES `ai_tracking_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`config_id`) REFERENCES `ai_tracking_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_tracking_mentions_obs_idx` ON `ai_tracking_mentions` (`observation_id`);--> statement-breakpoint
CREATE INDEX `ai_tracking_mentions_config_brand_idx` ON `ai_tracking_mentions` (`config_id`,`domain`);--> statement-breakpoint
CREATE TABLE `ai_tracking_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`config_id` text NOT NULL,
	`prompt_id` text NOT NULL,
	`prompt` text NOT NULL,
	`platform` text NOT NULL,
	`status` text NOT NULL,
	`response_text` text,
	`error_message` text,
	`observed_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `ai_tracking_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`config_id`) REFERENCES `ai_tracking_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_tracking_obs_run_idx` ON `ai_tracking_observations` (`run_id`);--> statement-breakpoint
CREATE INDEX `ai_tracking_obs_config_date_idx` ON `ai_tracking_observations` (`config_id`,`observed_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_tracking_obs_run_prompt_platform_uniq` ON `ai_tracking_observations` (`run_id`,`prompt_id`,`platform`);--> statement-breakpoint
CREATE TABLE `ai_tracking_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`config_id` text NOT NULL,
	`prompt` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`config_id`) REFERENCES `ai_tracking_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_tracking_prompts_config_id_idx` ON `ai_tracking_prompts` (`config_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_tracking_prompts_config_prompt_uniq` ON `ai_tracking_prompts` (`config_id`,`prompt`);--> statement-breakpoint
CREATE TABLE `ai_tracking_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`config_id` text NOT NULL,
	`project_id` text NOT NULL,
	`trigger` text DEFAULT 'manual' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`prompts_total` integer DEFAULT 0 NOT NULL,
	`prompts_completed` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`started_at` text DEFAULT (current_timestamp) NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`config_id`) REFERENCES `ai_tracking_configs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_tracking_runs_config_idx` ON `ai_tracking_runs` (`config_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `ai_tracking_runs_project_idx` ON `ai_tracking_runs` (`project_id`,`started_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_tracking_runs_one_active_per_config_idx` ON `ai_tracking_runs` (`config_id`) WHERE "ai_tracking_runs"."status" IN ('pending', 'running');