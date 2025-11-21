import { timestamp, uuid, varchar, text, boolean, numeric } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

// User Login
export type UserLogin = {
  username: string;
  password: string;
}

// User Type
// export type UserType = {
//   userId?:        string; // UUID type
//   userEmail:      string;
//   userContactNo:  string;
//   userPassword:   string;
//   userFirstName:  string;
//   userLastName:   string;
//   gender:         string;
//   accountId:      string;
//   roleId:         string | null;
//   sessionId:      string | null;
//   balance:        number;
//   status:         string;
//   kycStatus?:     string;
//   kycSubmittedAt?: Date | null;
//   createdAt?:     Date; // Timestamp type
//   updatedAt?:     Date; // Timestamp type
//   createdBy:      string;
//   updatedBy:      string;
// }

// User
export const User = MainSchema.table('user', {
  userId:         varchar('user_id', { length: 40 }).notNull(),
  userEmail:      varchar('user_email', { length: 100 }).unique().notNull(),
  userContactNo:  varchar('user_contact_no', { length: 20 }).unique().notNull(),
  userPassword:   varchar('user_password', { length: 100 }).notNull(),
  userFirstName:  varchar('user_first_name', { length: 50 }).notNull(),
  userLastName:   varchar('user_last_name', { length: 50 }).notNull(),
  gender:         varchar('gender', { length: 10 }).notNull(),
  accountId:      varchar('account_id', { length: 40 }).notNull(),
  roleId:         varchar('role_id', { length: 40 }),
  sessionId:      varchar('session_id', { length: 40 }),
  status:         varchar('status', { length: 20 }).notNull(),
  kycStatus:      varchar('kyc_status', { length: 20 }).default('pending_verification'),
  kycSubmittedAt: timestamp('kyc_submitted_at'),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
  createdBy:      varchar('created_by', { length: 40 }).notNull(),
  updatedBy:      varchar('updated_by', { length: 40 }).notNull(),
});

export type UserType = typeof User.$inferSelect;

