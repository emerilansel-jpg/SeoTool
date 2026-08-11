CREATE TABLE `content_briefs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`cluster_id` text,
	`target_keyword` text NOT NULL,
	`title` text,
	`status` text DEFAULT 'idea' NOT NULL,
	`priority_score` integer,
	`target_url` text,
	`brief_data_json` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cluster_id`) REFERENCES `topic_clusters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `content_briefs_project_id_idx` ON `content_briefs` (`project_id`);--> statement-breakpoint
CREATE INDEX `content_briefs_cluster_id_idx` ON `content_briefs` (`cluster_id`);--> statement-breakpoint
CREATE INDEX `content_briefs_status_idx` ON `content_briefs` (`status`);--> statement-breakpoint
CREATE TABLE `topic_clusters` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pillar_page_url` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `topic_clusters_project_id_idx` ON `topic_clusters` (`project_id`);