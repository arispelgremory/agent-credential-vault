import { z } from "zod";

/**
 * Schema definitions for MCP tool parameters
 * These must be Zod object schemas for the MCP SDK to work correctly
 */

export const checkBalanceSchema = z.object({
    accountId: z.string().describe("The Hedera account ID to check the balance for")
});

export const buildTransactionSchema = z.object({
    senderAccountId: z.string().describe("The account ID of the sender"),
    recipientAccountId: z.string().describe("The account ID of the recipient"),
    amount: z.number().describe("The amount to transfer in tinybars")
});

export const sendTransactionSchema = z.object({
    signedTransaction: z.string().describe("Base64-encoded signed transaction bytes")
});

export const getPaymentRequirementsSchema = z.object({
    endpoint: z.string().optional().describe("Optional endpoint path to get payment requirements for (defaults to '/api/v1/mcp/messages')")
});

export const processX402PaymentSchema = z.object({
    userId: z.string().describe("User ID to fetch credentials from database for payment processing"),
    endpoint: z.string().optional().describe("Optional endpoint path to process payment for (defaults to '/mcp/messages')")
});

export const transferHbarPaymentSchema = z.object({
    recipientAccountId: z.string().describe("The system account ID to receive the HBAR payment"),
    amount: z.number().describe("The amount to transfer in HBAR"),
    userId: z.string().describe("User ID to fetch credentials from database")
});

export const callFacilitatorSchema = z.object({
    userId: z.string().describe("User ID to fetch credentials from database"),
    paymentPayload: z.object({
        network: z.string().describe("Network name (e.g., hedera-testnet, hedera-mainnet, hedera-previewnet)"),
        accountId: z.string().describe("Hedera account ID"),
        amount: z.string().describe("Amount in tinybars as string"),
        token: z.string().describe("Token type (e.g., HBAR)"),
        nonce: z.string().describe("Nonce for the payment"),
        sessionId: z.string().describe("Session ID for the payment"),
        metadata: z.object({
            agentId: z.string().optional().describe("Agent ID"),
            purpose: z.string().optional().describe("Purpose of payment"),
        }).passthrough().describe("Metadata object"),
        signature: z.string().describe("Signature of the payment payload")
    }).describe("Payment payload object"),
    paymentRequirements: z.object({
        scheme: z.string().describe("Payment scheme (e.g., 'exact')"),
        network: z.string().describe("Network name"),
        maxAmountRequired: z.string().describe("Maximum amount required in tinybars"),
        resource: z.string().describe("Resource endpoint"),
        description: z.string().optional().describe("Payment description"),
        mimeType: z.string().optional().describe("MIME type"),
        payTo: z.string().describe("Account ID to pay to"),
        maxTimeoutSeconds: z.number().optional().describe("Maximum timeout in seconds"),
        asset: z.string().nullable().optional().describe("Asset contract address (null for HBAR)"),
        outputSchema: z.any().optional().describe("Output schema"),
        extra: z.record(z.any()).optional().describe("Extra payment requirements")
    }).describe("Payment requirements from the server"),
    action: z.enum(['verify', 'settle']).optional().default('verify').describe("Action to perform: 'verify' or 'settle'")
});

export const processX402PaymentFlowSchema = z.object({
    userId: z.string().describe("User ID to fetch credentials from database"),
    paymentRequirements: z.object({
        scheme: z.string().describe("Payment scheme (e.g., 'exact')"),
        network: z.string().describe("Network name"),
        maxAmountRequired: z.string().describe("Maximum amount required in tinybars"),
        resource: z.string().describe("Resource endpoint"),
        description: z.string().optional().describe("Payment description"),
        mimeType: z.string().optional().describe("MIME type"),
        payTo: z.string().describe("Account ID to pay to"),
        maxTimeoutSeconds: z.number().optional().describe("Maximum timeout in seconds"),
        asset: z.string().nullable().optional().describe("Asset contract address (null for HBAR)"),
        outputSchema: z.any().optional().describe("Output schema"),
        extra: z.record(z.any()).optional().describe("Extra payment requirements")
    }).optional().describe("Optional payment requirements (if not provided, will be fetched)"),
    action: z.enum(['verify', 'settle']).optional().default('verify').describe("Action to perform: 'verify' or 'settle'")
});

export const saveMessageToTopicSchema = z.object({
    topicId: z.string().describe("The Hedera topic ID to save messages to"),
    messages: z.array(z.object({
        type: z.enum(['inbound', 'outbound']).describe("Message type: 'inbound' for user messages, 'outbound' for assistant messages"),
        sender: z.string().describe("Sender identifier (user ID for inbound, 'assistant' for outbound)"),
        timestamp: z.string().describe("ISO timestamp of when the message was created"),
        text: z.string().describe("The message text content")
    })).describe("Array of messages to save to the topic"),
    userId: z.string().describe("User ID to fetch credentials from database")
});

