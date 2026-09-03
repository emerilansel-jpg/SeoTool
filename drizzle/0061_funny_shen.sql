CREATE TABLE `project_competitors` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`domain` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_competitors_project_id_idx` ON `project_competitors` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_competitors_project_domain_uniq` ON `project_competitors` (`project_id`,`domain`);