import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';

export interface UserTable {
  id: string;
  name: string;
  email: string;
  email_verified: number;
  image: string | null;
  created_at: number;
  updated_at: number;
  discord_id: string | null;
  discord_username: string | null;
  is_kofi_member: number;
  last_role_check: number | null;
}

export interface SessionTable {
  id: string;
  expires_at: number;
  token: string;
  created_at: number;
  updated_at: number;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string;
}

export interface AccountTable {
  id: string;
  account_id: string;
  provider_id: string;
  user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  id_token: string | null;
  access_token_expires_at: number | null;
  refresh_token_expires_at: number | null;
  scope: string | null;
  password: string | null;
  created_at: number;
  updated_at: number;
}

export interface VerificationTable {
  id: string;
  identifier: string;
  value: string;
  expires_at: number;
  created_at: number | null;
  updated_at: number | null;
}

export interface DonationIntentTable {
  id: string;
  user_id: string;
  post_id: string;
  created_at: number;
  expires_at: number;
  completed: number;
}

export interface DonationTable {
  id: string;
  visible_until: number;
  intent_id: string | null;
  user_id: string;
  post_id: string;
  kofi_transaction_id: string | null;
  kofi_email: string | null;
  amount: number;
  currency: string;
  kofi_message: string | null;
  created_at: number;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface CommentTable {
  id: string;
  donation_id: string;
  user_id: string;
  post_id: string;
  content: string;
  status: CommentStatus;
  reviewed_at: number | null;
  reviewed_by: string | null;
  discord_message_id: string | null;
  created_at: number;
}

export interface Database {
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
  donation_intent: DonationIntentTable;
  donation: DonationTable;
  comment: CommentTable;
}

export type DB = Database;

export function createDb(d1: CloudflareEnv['DB']): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: d1 }),
  });
}

export type User = UserTable;
export type Session = SessionTable;
export type Account = AccountTable;
export type Verification = VerificationTable;
export type DonationIntent = DonationIntentTable;
export type Donation = DonationTable;
export type Comment = CommentTable;
