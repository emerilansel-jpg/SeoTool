-- Rename autumn_subscription_id → paypal_subscription_id in subscription table
ALTER TABLE `subscription` RENAME COLUMN `autumn_subscription_id` TO `paypal_subscription_id`;--> statement-breakpoint
-- Rename the index
DROP INDEX IF EXISTS `subscription_autumn_sub_idx`;--> statement-breakpoint
CREATE INDEX `subscription_paypal_sub_idx` ON `subscription` (`paypal_subscription_id`);