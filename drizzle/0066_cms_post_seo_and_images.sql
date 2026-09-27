ALTER TABLE `cms_posts` ADD `featured_image` text;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `cms_posts` ADD `schema_json` text;--> statement-breakpoint
CREATE TABLE `cms_images` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`data_base64` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
