CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiKeyName` varchar(255) NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`keyPrefix` varchar(12) NOT NULL,
	`permissions` json,
	`rateLimit` int NOT NULL DEFAULT 1000,
	`requestsToday` int NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduledReportName` varchar(255) NOT NULL,
	`scheduledReportNameAr` varchar(255),
	`frequency` enum('weekly','monthly','quarterly') NOT NULL,
	`reportTemplate` enum('executive_summary','full_detail','compliance','sector_analysis') NOT NULL DEFAULT 'executive_summary',
	`recipientIds` json,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`totalRuns` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leaks` ADD `region` varchar(100);--> statement-breakpoint
ALTER TABLE `leaks` ADD `regionAr` varchar(100);--> statement-breakpoint
ALTER TABLE `leaks` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `leaks` ADD `cityAr` varchar(100);--> statement-breakpoint
ALTER TABLE `leaks` ADD `latitude` varchar(20);--> statement-breakpoint
ALTER TABLE `leaks` ADD `longitude` varchar(20);