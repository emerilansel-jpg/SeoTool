CREATE TABLE `usage_credit_reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`provider` text NOT NULL,
	`billing_mode` text DEFAULT 'standard' NOT NULL,
	`credit_feature` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reserved_credits` integer NOT NULL,
	`monthly_reserved` integer DEFAULT 0 NOT NULL,
	`topup_reserved` integer DEFAULT 0 NOT NULL,
	`actual_credits` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`settled_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `usage_credit_reservations_org_status_idx` ON `usage_credit_reservations` (`organization_id`,`status`);
