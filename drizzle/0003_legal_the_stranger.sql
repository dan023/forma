ALTER TABLE `exercises` ADD `body_part` text;--> statement-breakpoint
ALTER TABLE `exercises` ADD `search_text` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `exercises_body_part_idx` ON `exercises` (`body_part`);