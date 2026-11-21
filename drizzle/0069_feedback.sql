CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`display_number` integer NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	`screenshot_base64` text,
	`screenshot_mime` text,
	`page_url` text,
	`user_agent` text,
	`app_version` text,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_note` text,
	`resolved_in_version` text,
	`notified_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`resolved_at` text
);
--> statement-breakpoint
CREATE INDEX `feedback_status_created_idx` ON `feedback` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_type_idx` ON `feedback` (`type`);