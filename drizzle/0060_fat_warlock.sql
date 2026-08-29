CREATE TABLE `cancellation_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`plan_tier` text NOT NULL,
	`reason` text NOT NULL,
	`detail` text,
	`offer_accepted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cancellation_feedback_created_idx` ON `cancellation_feedback` (`created_at`);