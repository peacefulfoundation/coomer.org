import type { Insertable, Selectable, Updateable } from 'kysely';
import type {
  AccountTable,
  CommentTable,
  CommentStatus,
  DB,
  Database,
  DonationIntentTable,
  DonationTable,
  SessionTable,
  UserTable,
  VerificationTable,
} from './db';

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;

export type Account = Selectable<AccountTable>;
export type NewAccount = Insertable<AccountTable>;
export type AccountUpdate = Updateable<AccountTable>;

export type Verification = Selectable<VerificationTable>;
export type NewVerification = Insertable<VerificationTable>;
export type VerificationUpdate = Updateable<VerificationTable>;

export type DonationIntent = Selectable<DonationIntentTable>;
export type NewDonationIntent = Insertable<DonationIntentTable>;
export type DonationIntentUpdate = Updateable<DonationIntentTable>;

export type Donation = Selectable<DonationTable>;
export type NewDonation = Insertable<DonationTable>;
export type DonationUpdate = Updateable<DonationTable>;

export type Comment = Selectable<CommentTable>;
export type NewComment = Insertable<CommentTable>;
export type CommentUpdate = Updateable<CommentTable>;

export type {
  AccountTable,
  CommentStatus,
  CommentTable,
  DB,
  Database,
  DonationIntentTable,
  DonationTable,
  SessionTable,
  UserTable,
  VerificationTable,
};
