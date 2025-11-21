import { timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

// Credential Type
export type CredentialType = {
  credentialId?: string;
  userId: string;
  credentialType: string; // e.g., 'hedera', 'aws', 'github', etc.
  credentialData: Record<string, unknown>; // Generic JSON data (encrypted values should be stored here)
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy: string;
};

// Credential Database Schema
export const Credential = MainSchema.table('credential', {
  credentialId: uuid('credential_id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 40 }).notNull(),
  credentialType: varchar('credential_type', { length: 50 }).notNull(), // Type identifier
  credentialData: jsonb('credential_data').notNull(), // Generic JSON data
  status: varchar('status', { length: 20 }).default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 40 }).notNull(),
  updatedBy: varchar('updated_by', { length: 40 }).notNull(),
});

// Request/Response Types
export type CreateCredentialRequest = {
  credentialType: string;
  credentialData: Record<string, unknown>;
};

export type UpdateCredentialRequest = {
  credentialType?: string;
  credentialData?: Record<string, unknown>;
  status?: string;
};

export type CredentialResponse = {
  credentialId: string;
  userId: string;
  credentialType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  // Note: credentialData is NOT returned for security
};

