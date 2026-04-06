-- Base schema for better-auth and application tables

-- User table
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  discord_id TEXT UNIQUE,
  discord_username TEXT,
  is_kofi_member INTEGER NOT NULL DEFAULT 0,
  last_role_check INTEGER
);

CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
CREATE INDEX IF NOT EXISTS idx_user_discord_id ON user(discord_id);

-- Session table
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);

-- Account table (OAuth providers)
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_user_id ON account(user_id);
CREATE INDEX IF NOT EXISTS idx_account_provider ON account(provider_id, account_id);

-- Verification table
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);

-- Donation intent table
CREATE TABLE IF NOT EXISTS donation_intent (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_donation_intent_user ON donation_intent(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_intent_expires ON donation_intent(expires_at);

-- Donation table
CREATE TABLE IF NOT EXISTS donation (
  id TEXT PRIMARY KEY,
  visible_until INTEGER NOT NULL,
  intent_id TEXT REFERENCES donation_intent(id),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  kofi_transaction_id TEXT UNIQUE,
  kofi_email TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  kofi_message TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donation_user ON donation(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_post ON donation(post_id);
CREATE INDEX IF NOT EXISTS idx_donation_visible ON donation(visible_until);

-- Comment table
CREATE TABLE IF NOT EXISTS comment (
  id TEXT PRIMARY KEY,
  donation_id TEXT NOT NULL UNIQUE REFERENCES donation(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  reviewed_at INTEGER,
  reviewed_by TEXT,
  discord_message_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comment_post ON comment(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_status ON comment(status);
CREATE INDEX IF NOT EXISTS idx_comment_user ON comment(user_id);
