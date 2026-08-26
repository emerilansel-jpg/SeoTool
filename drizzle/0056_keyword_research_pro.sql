CREATE TABLE `keyword_pro_memberships` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`cohort_key` text NOT NULL,
	`locked_price_usd_cents` integer NOT NULL,
	`status` text DEFAULT 'approval_pending' NOT NULL,
	`paypal_plan_id` text NOT NULL,
	`paypal_subscription_id` text NOT NULL,
	`referral_code_used` text,
	`activated_at` text,
	`current_period_end` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keyword_pro_memberships_paypal_subscription_idx` ON `keyword_pro_memberships` (`paypal_subscription_id`);--> statement-breakpoint
CREATE INDEX `keyword_pro_memberships_cohort_status_idx` ON `keyword_pro_memberships` (`cohort_key`,`status`);--> statement-breakpoint
CREATE TABLE `keyword_pro_referral_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keyword_pro_referral_codes_organization_idx` ON `keyword_pro_referral_codes` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `keyword_pro_referral_codes_code_idx` ON `keyword_pro_referral_codes` (`code`);--> statement-breakpoint
CREATE TABLE `keyword_pro_referral_attributions` (
	`id` text PRIMARY KEY NOT NULL,
	`referral_code_id` text NOT NULL,
	`referred_organization_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`rewarded_months` integer DEFAULT 0 NOT NULL,
	`max_reward_months` integer DEFAULT 12 NOT NULL,
	`referred_reward_granted` integer DEFAULT false NOT NULL,
	`qualified_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`referral_code_id`) REFERENCES `keyword_pro_referral_codes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`referred_organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keyword_pro_referral_attributions_referred_org_idx` ON `keyword_pro_referral_attributions` (`referred_organization_id`);--> statement-breakpoint
CREATE INDEX `keyword_pro_referral_attributions_code_status_idx` ON `keyword_pro_referral_attributions` (`referral_code_id`,`status`);--> statement-breakpoint
CREATE TABLE `keyword_pro_referral_commissions` (
	`id` text PRIMARY KEY NOT NULL,
	`attribution_id` text NOT NULL,
	`paypal_sale_id` text NOT NULL,
	`gross_amount_usd_cents` integer NOT NULL,
	`reward_credits` integer NOT NULL,
	`status` text DEFAULT 'credited' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`attribution_id`) REFERENCES `keyword_pro_referral_attributions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keyword_pro_referral_commissions_paypal_sale_idx` ON `keyword_pro_referral_commissions` (`paypal_sale_id`);--> statement-breakpoint
CREATE INDEX `keyword_pro_referral_commissions_attribution_idx` ON `keyword_pro_referral_commissions` (`attribution_id`);
