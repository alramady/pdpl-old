ALTER TABLE `api_keys` MODIFY COLUMN `permissions` json;--> statement-breakpoint
ALTER TABLE `scheduled_reports` MODIFY COLUMN `recipientIds` json;