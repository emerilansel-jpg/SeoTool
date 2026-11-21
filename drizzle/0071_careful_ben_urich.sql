CREATE TABLE `gbp_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`keyword` text NOT NULL,
	`location_code` integer DEFAULT 2840 NOT NULL,
	`language_code` text DEFAULT 'en' NOT NULL,
	`profile_json` text,
	`fetched_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `gbp_profiles_project_idx` ON `gbp_profiles` (`project_id`);--> statement-breakpoint
CREATE INDEX `gbp_profiles_organization_idx` ON `gbp_profiles` (`organization_id`);--> statement-breakpoint
CREATE TABLE `gbp_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`review_id` text NOT NULL,
	`author` text,
	`rating` integer,
	`text` text,
	`owner_answer` text,
	`reviewed_at` text,
	`fetched_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gbp_reviews_project_review_idx` ON `gbp_reviews` (`project_id`,`review_id`);--> statement-breakpoint
CREATE INDEX `gbp_reviews_project_idx` ON `gbp_reviews` (`project_id`,`reviewed_at`);--> statement-breakpoint
CREATE TABLE `nap_audits` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`business_name` text NOT NULL,
	`city` text NOT NULL,
	`phone` text,
	`address` text,
	`location_code` integer DEFAULT 2840 NOT NULL,
	`language_code` text DEFAULT 'en' NOT NULL,
	`consistency_score` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `nap_audits_project_idx` ON `nap_audits` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `nap_audits_organization_idx` ON `nap_audits` (`organization_id`);--> statement-breakpoint
CREATE TABLE `nap_results` (
	`id` text PRIMARY KEY NOT NULL,
	`audit_id` text NOT NULL,
	`project_id` text NOT NULL,
	`directory` text NOT NULL,
	`status` text NOT NULL,
	`source_url` text,
	`found_name` text,
	`found_phone` text,
	`found_address` text,
	`rating_value` real,
	`rating_count` integer,
	`detail` text,
	FOREIGN KEY (`audit_id`) REFERENCES `nap_audits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `nap_results_audit_idx` ON `nap_results` (`audit_id`);--> statement-breakpoint
CREATE INDEX `nap_results_project_idx` ON `nap_results` (`project_id`);