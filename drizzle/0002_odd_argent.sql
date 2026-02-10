CREATE TABLE `monitoring_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`jobName` varchar(255) NOT NULL,
	`jobNameAr` varchar(255) NOT NULL,
	`jobPlatform` enum('telegram','darkweb','paste','all') NOT NULL,
	`cronExpression` varchar(50) NOT NULL,
	`jobStatus` enum('active','paused','running','error') NOT NULL DEFAULT 'active',
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`lastResult` text,
	`leaksFound` int DEFAULT 0,
	`totalRuns` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoring_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `monitoring_jobs_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`notificationType` enum('new_leak','status_change','scan_complete','job_complete','system') NOT NULL DEFAULT 'system',
	`notifTitle` varchar(255) NOT NULL,
	`notifTitleAr` varchar(255) NOT NULL,
	`notifMessage` text,
	`notifMessageAr` text,
	`notifSeverity` enum('critical','high','medium','low','info') NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_log` ADD `userName` varchar(255);--> statement-breakpoint
ALTER TABLE `audit_log` ADD `auditCategory` enum('auth','leak','export','pii','user','report','system','monitoring') DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `ipAddress` varchar(45);