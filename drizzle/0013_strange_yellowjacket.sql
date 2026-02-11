CREATE TABLE `ai_response_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`ratingUserId` int NOT NULL,
	`ratingUserName` varchar(255),
	`rating` int NOT NULL,
	`userMessage` text,
	`aiResponse` text,
	`toolsUsed` json,
	`ratingFeedback` text,
	`ratingCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_response_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryId` varchar(64) NOT NULL,
	`kbCategory` enum('article','faq','glossary','instruction','policy','regulation') NOT NULL,
	`kbTitle` varchar(500) NOT NULL,
	`kbTitleAr` varchar(500) NOT NULL,
	`kbContent` text NOT NULL,
	`kbContentAr` text NOT NULL,
	`kbTags` json,
	`kbIsPublished` boolean NOT NULL DEFAULT true,
	`kbViewCount` int DEFAULT 0,
	`kbHelpfulCount` int DEFAULT 0,
	`kbCreatedBy` int,
	`kbCreatedByName` varchar(255),
	`kbUpdatedBy` int,
	`kbCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`kbUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_base_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_base_entryId_unique` UNIQUE(`entryId`)
);
