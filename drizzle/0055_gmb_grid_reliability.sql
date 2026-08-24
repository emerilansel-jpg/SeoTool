PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_gmb_grid_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`business_name` text NOT NULL,
	`place_id` text NOT NULL,
	`cid` text,
	`address` text,
	`keyword` text NOT NULL,
	`center_lat` real NOT NULL,
	`center_lng` real NOT NULL,
	`grid_size` integer NOT NULL,
	`radius_meters` integer NOT NULL,
	`language_code` text DEFAULT 'en' NOT NULL,
	`device` text DEFAULT 'mobile' NOT NULL,
	`map_zoom` integer DEFAULT 15 NOT NULL,
	`schedule_interval` text DEFAULT 'manual' NOT NULL,
	`next_check_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_gmb_grid_configs` (
	`id`, `project_id`, `business_name`, `place_id`, `keyword`, `center_lat`,
	`center_lng`, `grid_size`, `radius_meters`, `schedule_interval`, `is_active`,
	`created_at`, `updated_at`
)
SELECT
	`id`, `project_id`, `business_name`, COALESCE(`place_id`, 'legacy:' || `id`),
	`keyword`, `center_lat`, `center_lng`, `grid_size`, `radius_meters`,
	`schedule_interval`, `is_active`, `created_at`, `created_at`
FROM `gmb_grid_configs`;--> statement-breakpoint
CREATE TABLE `__new_gmb_grid_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`config_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`trigger` text DEFAULT 'manual' NOT NULL,
	`total_points` integer DEFAULT 0 NOT NULL,
	`completed_points` integer DEFAULT 0 NOT NULL,
	`failed_points` integer DEFAULT 0 NOT NULL,
	`found_points` integer DEFAULT 0 NOT NULL,
	`solv` real,
	`average_rank` real,
	`cost_usd` real DEFAULT 0 NOT NULL,
	`error_code` text,
	`error_message` text,
	`started_at` text DEFAULT (current_timestamp) NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`config_id`) REFERENCES `__new_gmb_grid_configs`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_gmb_grid_runs` (
	`id`, `config_id`, `status`, `total_points`, `completed_points`,
	`failed_points`, `found_points`, `started_at`, `completed_at`
)
SELECT
	r.`id`, r.`config_id`, r.`status`, COUNT(s.`id`),
	SUM(CASE WHEN s.`status` = 'completed' THEN 1 ELSE 0 END),
	SUM(CASE WHEN s.`status` = 'failed' THEN 1 ELSE 0 END),
	SUM(CASE WHEN s.`rank` IS NOT NULL THEN 1 ELSE 0 END),
	r.`started_at`, r.`completed_at`
FROM `gmb_grid_runs` r
LEFT JOIN `gmb_grid_snapshots` s ON s.`run_id` = r.`id`
GROUP BY r.`id`;--> statement-breakpoint
CREATE TABLE `__new_gmb_grid_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`grid_row` integer NOT NULL,
	`grid_col` integer NOT NULL,
	`rank` integer,
	`task_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_code` text,
	`error_message` text,
	`checked_at` text,
	FOREIGN KEY (`run_id`) REFERENCES `__new_gmb_grid_runs`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_gmb_grid_snapshots` (
	`id`, `run_id`, `lat`, `lng`, `grid_row`, `grid_col`, `rank`, `task_id`,
	`status`, `checked_at`
)
SELECT
	`id`, `run_id`, `lat`, `lng`, `grid_row`, `grid_col`, `rank`, `task_id`,
	`status`, CASE WHEN `status` = 'pending' THEN NULL ELSE (current_timestamp) END
FROM `gmb_grid_snapshots`;--> statement-breakpoint
DROP TABLE `gmb_grid_snapshots`;--> statement-breakpoint
DROP TABLE `gmb_grid_runs`;--> statement-breakpoint
DROP TABLE `gmb_grid_configs`;--> statement-breakpoint
ALTER TABLE `__new_gmb_grid_configs` RENAME TO `gmb_grid_configs`;--> statement-breakpoint
ALTER TABLE `__new_gmb_grid_runs` RENAME TO `gmb_grid_runs`;--> statement-breakpoint
ALTER TABLE `__new_gmb_grid_snapshots` RENAME TO `gmb_grid_snapshots`;--> statement-breakpoint
WITH ranked AS (
	SELECT `id`, ROW_NUMBER() OVER (
		PARTITION BY `config_id` ORDER BY `started_at` DESC, `id` DESC
	) AS rn
	FROM `gmb_grid_runs`
	WHERE `status` IN ('pending', 'running')
)
UPDATE `gmb_grid_runs`
SET `status` = 'failed', `error_code` = 'MIGRATION_DEDUPED',
	`error_message` = 'Superseded active run during reliability migration',
	`completed_at` = (current_timestamp)
WHERE `id` IN (SELECT `id` FROM ranked WHERE rn > 1);--> statement-breakpoint
CREATE INDEX `gmb_grid_configs_project_created_idx` ON `gmb_grid_configs` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `gmb_grid_configs_active_next_idx` ON `gmb_grid_configs` (`is_active`,`next_check_at`);--> statement-breakpoint
CREATE INDEX `gmb_grid_runs_config_started_idx` ON `gmb_grid_runs` (`config_id`,`started_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `gmb_grid_runs_one_active_per_config_idx` ON `gmb_grid_runs` (`config_id`) WHERE `status` IN ('pending', 'running');--> statement-breakpoint
CREATE UNIQUE INDEX `gmb_grid_snapshots_run_grid_idx` ON `gmb_grid_snapshots` (`run_id`,`grid_row`,`grid_col`);--> statement-breakpoint
CREATE INDEX `gmb_grid_snapshots_task_idx` ON `gmb_grid_snapshots` (`task_id`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
