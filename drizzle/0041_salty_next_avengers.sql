CREATE TABLE `page_entities` (
	`id` text PRIMARY KEY NOT NULL,
	`audit_id` text NOT NULL,
	`page_id` text NOT NULL,
	`url` text NOT NULL,
	`entities_json` text DEFAULT '[]' NOT NULL,
	`topics_json` text DEFAULT '[]' NOT NULL,
	`extracted_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`audit_id`) REFERENCES `audits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`page_id`) REFERENCES `audit_pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `page_entities_page_id_idx` ON `page_entities` (`page_id`);--> statement-breakpoint
CREATE INDEX `page_entities_audit_id_idx` ON `page_entities` (`audit_id`);