/**
 * Identity Models for ERC-8004 Agent Registration
 */

import { timestamp, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

export type AgentMetadata = {
  type: string;
  name: string;
  description: string;
  endpoints: Array<{
    name: string;
    endpoint: string;
    version: string;
    capabilities?: Record<string, unknown>; // Optional capabilities as per MCP spec
  }>;
  registrations: Array<{
    agentId: number;
    agentRegistry: string;
  }>;
  supportedTrust: string[];
};

export type RegisterAgentRequest = {
  type?: 'Agent' | 'MCP'; // Type of registration: 'Agent' creates agent entry, 'MCP' creates MCP entry
  name: string;
  description: string;
  endpoints: Array<{
    name: string;
    endpoint: string;
    version: string;
    capabilities?: Record<string, unknown>; // Optional capabilities as per MCP spec
  }>;
  supportedTrust?: string[];
  tokenId?: string; // Optional: Hedera account ID (e.g., "0.0.7148856") or token ID as string
};

export type RegisterAgentResponse = {
  success: boolean;
  message: string;
  data: {
    agentId: string;
    txHash: string;
    owner: string;
    registrationUri?: string;
    metadataCid?: string;
  } | null;
  error?: string;
};

export type SetAgentUriRequest = {
  agentId: string;
  uri: string;
};

export type SetAgentMetadataRequest = {
  agentId: string;
  key: string;
  value: string;
};

export type GetAgentMetadataResponse = {
  success: boolean;
  message: string;
  data: {
    agentId: string;
    key: string;
    value: string;
  } | null;
  error?: string;
};

export type HCS10BroadcastRequest = {
  agentId: string;
  topicId: string;
};

export type HCS11ProfileRequest = {
  agentId: string;
  topicId: string;
  displayName: string;
  description: string;
  maintainer: string;
  capabilities: string[];
  websites?: string[];
};

export type HCS14UAIDRequest = {
  agentId: string;
  topicId: string;
};

export type ValidationRequestPayload = {
  agentId: string;
  validator: string;
  intent: string;
  reference: string;
  createdAt: string;
};

export type ValidationResponsePayload = {
  agentId: string;
  validator: string;
  conclusion: string;
  notes: string;
  createdAt: string;
};

export type ValidationRequest = {
  agentId: string;
  validatorAddress: string;
  intent: string;
  referenceUri: string;
};

export type ValidationResponse = {
  requestHash: string;
  response: number;
  responseUri: string;
  responseHash: string;
  tag: string;
};

export type FeedbackRequest = {
  agentId: string;
  score: number;
  tag1?: string;
  tag2?: string;
  feedbackUri: string;
  feedbackAuth: string;
};

// Agent Database Type
export type AgentType = {
  agentId?: string; // UUID type
  agentIdOnChain: string; // The agent ID from the blockchain (bigint as string)
  name: string;
  description: string;
  owner: string; // Owner wallet address
  registrationUri?: string | null; // IPFS URI
  metadataCid?: string | null; // IPFS CID
  txHash: string; // Transaction hash
  tokenId?: string | null; // Optional token ID used for registration
  supportedTrust: string[]; // JSON array of supported trust types
  endpoints: string; // JSON array of endpoints
  agentRegistry: string; // Registry address
  chainId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy: string;
};

// Agent Database Schema
export const Agent = MainSchema.table('agent', {
  agentId: uuid('agent_id').defaultRandom().primaryKey(),
  agentIdOnChain: varchar('agent_id_on_chain', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  owner: varchar('owner', { length: 100 }).notNull(),
  registrationUri: text('registration_uri'),
  metadataCid: varchar('metadata_cid', { length: 200 }),
  txHash: varchar('tx_hash', { length: 100 }).notNull(),
  tokenId: varchar('token_id', { length: 50 }),
  supportedTrust: text('supported_trust').notNull(), // JSON array stored as text
  endpoints: text('endpoints').notNull(), // JSON array stored as text
  agentRegistry: varchar('agent_registry', { length: 100 }).notNull(),
  chainId: varchar('chain_id', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 40 }).notNull(),
  updatedBy: varchar('updated_by', { length: 40 }).notNull(),
});

