import { timestamp, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

// MCP Database Type
export type McpType = {
  mcpId?: string; // UUID type
  agentId: string; // Reference to agent table (UUID)
  agentIdOnChain: string; // The agent ID from the blockchain (for quick lookup)
  name: string;
  description: string;
  endpoints: string; // JSON array of endpoints
  capabilities?: string; // JSON array of capabilities stored as text (optional for backward compatibility)
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy: string;
};

// MCP Database Schema
export const MCP = MainSchema.table('mcp', {
  mcpId: uuid('mcp_id').defaultRandom().primaryKey(),
  agentId: uuid('agent_id').notNull(), // Foreign key to agent table
  agentIdOnChain: varchar('agent_id_on_chain', { length: 100 }).notNull(), // For quick lookup
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  endpoints: text('endpoints').notNull(), // JSON array stored as text
  capabilities: text('capabilities'), // JSON array of capabilities stored as text (optional)
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 40 }).notNull(),
  updatedBy: varchar('updated_by', { length: 40 }).notNull(),
});

