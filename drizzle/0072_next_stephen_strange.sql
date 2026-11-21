CREATE TABLE `internal_link_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`audit_id` text,
	`source_url` text NOT NULL,
	`target_url` text NOT NULL,
	`target_keyword` text NOT NULL,
	`gsc_position` text,
	`anchor_text` text NOT NULL,
	`sentence` text NOT NULL,
	`rationale` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `internal_link_suggestions_project_status_idx` ON `internal_link_suggestions` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `internal_link_suggestions_organization_idx` ON `internal_link_suggestions` (`organization_id`);