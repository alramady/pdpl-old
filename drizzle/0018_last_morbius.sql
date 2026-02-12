CREATE TABLE `search_query_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sqlQuery` text NOT NULL,
	`sqlSource` enum('rasid_ai','knowledge_base_ui','api') NOT NULL DEFAULT 'rasid_ai',
	`sqlSearchMethod` enum('semantic','keyword','hybrid') NOT NULL DEFAULT 'semantic',
	`sqlResultCount` int NOT NULL DEFAULT 0,
	`sqlTopScore` varchar(10),
	`sqlAvgScore` varchar(10),
	`sqlReranked` boolean NOT NULL DEFAULT false,
	`sqlUserId` int,
	`sqlUserName` varchar(255),
	`sqlCategory` varchar(64),
	`sqlResponseTimeMs` int,
	`sqlCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `search_query_log_id` PRIMARY KEY(`id`)
);
