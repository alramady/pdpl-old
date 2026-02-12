CREATE TABLE `custom_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actionId` varchar(64) NOT NULL,
	`triggerPhrase` varchar(500) NOT NULL,
	`triggerAliases` json,
	`actionType` enum('call_function','custom_response','redirect','api_call') NOT NULL,
	`actionTarget` text,
	`actionParams` json,
	`caDescription` text,
	`caDescriptionAr` text,
	`caPriority` int DEFAULT 0,
	`caIsActive` boolean NOT NULL DEFAULT true,
	`caCreatedBy` int,
	`caCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`caUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_actions_id` PRIMARY KEY(`id`),
	CONSTRAINT `custom_actions_actionId_unique` UNIQUE(`actionId`)
);
--> statement-breakpoint
CREATE TABLE `training_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`docId` varchar(64) NOT NULL,
	`tdFileName` varchar(500) NOT NULL,
	`tdFileUrl` text NOT NULL,
	`tdFileSize` int,
	`tdFileType` varchar(50),
	`tdStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`tdExtractedContent` text,
	`tdChunkCount` int DEFAULT 0,
	`tdErrorMessage` text,
	`tdUploadedBy` int,
	`tdUploadedByName` varchar(255),
	`tdCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`tdProcessedAt` timestamp,
	CONSTRAINT `training_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `training_documents_docId_unique` UNIQUE(`docId`)
);
