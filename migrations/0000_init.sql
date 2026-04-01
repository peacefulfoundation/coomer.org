-- Migration: Initial schema for better-auth with custom fields
-- Created: 2024-12-01

CREATE TABLE IF NOT EXISTS `user` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL UNIQUE,
  `email_verified` INTEGER NOT NULL DEFAULT 0,
  `image` TEXT,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `discord_id` TEXT UNIQUE,
  `discord_username` TEXT,
  `is_kofi_member` INTEGER NOT NULL DEFAULT 0,
  `last_role_check` INTEGER
);

CREATE TABLE IF NOT EXISTS `session` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `expires_at` INTEGER NOT NULL,
  `token` TEXT NOT NULL UNIQUE,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `ip_address` TEXT,
  `user_agent` TEXT,
  `user_id` TEXT NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `account` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `account_id` TEXT NOT NULL,
  `provider_id` TEXT NOT NULL,
  `user_id` TEXT NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `access_token` TEXT,
  `refresh_token` TEXT,
  `id_token` TEXT,
  `access_token_expires_at` INTEGER,
  `refresh_token_expires_at` INTEGER,
  `scope` TEXT,
  `password` TEXT,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `verification` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `identifier` TEXT NOT NULL,
  `value` TEXT NOT NULL,
  `expires_at` INTEGER NOT NULL,
  `created_at` INTEGER,
  `updated_at` INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS `idx_session_user_id` ON `session`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_session_token` ON `session`(`token`);
CREATE INDEX IF NOT EXISTS `idx_account_user_id` ON `account`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_account_provider` ON `account`(`provider_id`, `account_id`);
CREATE INDEX IF NOT EXISTS `idx_user_discord_id` ON `user`(`discord_id`);
CREATE INDEX IF NOT EXISTS `idx_user_email` ON `user`(`email`);
