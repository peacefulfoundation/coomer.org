import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  discordId: text('discord_id').unique(),
  discordUsername: text('discord_username'),
  isKofiMember: integer('is_kofi_member', { mode: 'boolean' }).notNull().default(false),
  lastRoleCheck: integer('last_role_check', { mode: 'timestamp' }),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// Donation intent - stores user's intention to donate before going to Ko-fi
export const donationIntent = sqliteTable('donation_intent', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
});

// Donation record - created when Ko-fi webhook confirms payment
export const donation = sqliteTable('donation', {
  id: text('id').primaryKey(),
  visibleUntil: integer('visible_until', { mode: 'timestamp' }).notNull(),
  
  intentId: text('intent_id').references(() => donationIntent.id),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull(),
  
  kofiTransactionId: text('kofi_transaction_id').unique(),
  kofiEmail: text('kofi_email'),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  kofiMessage: text('kofi_message'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Comment - submitted after donation, requires approval
export const comment = sqliteTable('comment', {
  id: text('id').primaryKey(),
  donationId: text('donation_id')
    .notNull()
    .unique()
    .references(() => donation.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull(),
  
  content: text('content').notNull(),
  
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  reviewedBy: text('reviewed_by'),
  
  discordMessageId: text('discord_message_id'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type DonationIntent = typeof donationIntent.$inferSelect;
export type Donation = typeof donation.$inferSelect;
export type Comment = typeof comment.$inferSelect;
