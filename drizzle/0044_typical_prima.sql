CREATE TABLE `alert_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`metric_type` text NOT NULL,
	`condition_json` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`frequency` text DEFAULT 'daily' NOT NULL,
	`next_check_at` integer,
	`last_triggered_at` integer,
	`recipients` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `alert_rules_project_id_idx` ON `alert_rules` (`project_id`);--> statement-breakpoint
CREATE INDEX `alert_rules_next_check_idx` ON `alert_rules` (`enabled`,`next_check_at`);