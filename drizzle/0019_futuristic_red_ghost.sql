ALTER TABLE `users` ADD `userId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `displayName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `displayNameAr` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `mobile` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_userId_unique` UNIQUE(`userId`);