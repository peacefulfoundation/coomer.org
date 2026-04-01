-- Migration: Add donations and comments system
-- Created: 2024-12-01

-- Donation intent - stores user's intention to donate before going to Ko-fi
CREATE TABLE IF NOT EXISTS `donation_intent` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `user_id` TEXT NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `post_id` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `expires_at` INTEGER NOT NULL,
  `completed` INTEGER NOT NULL DEFAULT 0
);

-- Donation record - created when Ko-fi webhook confirms payment
CREATE TABLE IF NOT EXISTS `donation` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `visible_until` INTEGER NOT NULL,
  `intent_id` TEXT REFERENCES `donation_intent`(`id`),
  `user_id` TEXT NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `post_id` TEXT NOT NULL,
  `kofi_transaction_id` TEXT UNIQUE,
  `kofi_email` TEXT,
  `amount` REAL NOT NULL,
  `currency` TEXT NOT NULL DEFAULT 'USD',
  `kofi_message` TEXT,
  `created_at` INTEGER NOT NULL
);

-- Comment - submitted after donation, requires approval
CREATE TABLE IF NOT EXISTS `comment` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `donation_id` TEXT NOT NULL UNIQUE REFERENCES `donation`(`id`) ON DELETE CASCADE,
  `user_id` TEXT NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `post_id` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `status` TEXT NOT NULL DEFAULT 'pending' CHECK (`status` IN ('pending', 'approved', 'rejected')),
  `reviewed_at` INTEGER,
  `reviewed_by` TEXT,
  `discord_message_id` TEXT,
  `created_at` INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS `idx_donation_intent_user` ON `donation_intent`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_donation_intent_expires` ON `donation_intent`(`expires_at`);
CREATE INDEX IF NOT EXISTS `idx_donation_user` ON `donation`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_donation_post` ON `donation`(`post_id`);
CREATE INDEX IF NOT EXISTS `idx_donation_kofi_email` ON `donation`(`kofi_email`);
CREATE INDEX IF NOT EXISTS `idx_comment_post` ON `comment`(`post_id`);
CREATE INDEX IF NOT EXISTS `idx_comment_status` ON `comment`(`status`);
CREATE INDEX IF NOT EXISTS `idx_comment_donation` ON `comment`(`donation_id`);
