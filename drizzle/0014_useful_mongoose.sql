CREATE TABLE `personality_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioType` enum('greeting_first','greeting_return','leader_respect','custom') NOT NULL,
	`triggerKeyword` varchar(500),
	`responseTemplate` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`psCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`psUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personality_scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usUserId` varchar(64) NOT NULL,
	`usUserName` varchar(255),
	`usSessionDate` varchar(10) NOT NULL,
	`usVisitCount` int NOT NULL DEFAULT 1,
	`usCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`usUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`)
);
