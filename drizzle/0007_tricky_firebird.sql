ALTER TABLE `foods` ADD `food_group` text;--> statement-breakpoint
CREATE INDEX `foods_group_idx` ON `foods` (`food_group`);--> statement-breakpoint
ALTER TABLE `meal_slots` ADD `icon` text;