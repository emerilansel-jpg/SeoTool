CREATE TABLE `content_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`audit_id` text NOT NULL,
	`page_id` text NOT NULL,
	`url` text NOT NULL,
	`score` integer NOT NULL,
	`depth_score` integer NOT NULL,
	`headings_score` integer NOT NULL,
	`metadata_score` integer NOT NULL,
	`media_score` integer NOT NULL,
	`linking_score` integer NOT NULL,
	`technical_score` integer NOT NULL,
	`flags_json` text DEFAULT '[]' NOT NULL,
	`word_count` integer DEFAULT 0 NOT NULL,
	`computed_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`audit_id`) REFERENCES `audits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`page_id`) REFERENCES `audit_pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_scores_page_id_idx` ON `content_scores` (`page_id`);--> statement-breakpoint
CREATE INDEX `content_scores_audit_id_idx` ON `content_scores` (`audit_id`);