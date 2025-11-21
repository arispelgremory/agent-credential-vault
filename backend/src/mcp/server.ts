import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    checkBalanceSchema,
    buildTransactionSchema,
    sendTransactionSchema,
    getPaymentRequirementsSchema,
    processX402PaymentSchema,
    transferHbarPaymentSchema,
    callFacilitatorSchema,
    processX402PaymentFlowSchema,
    saveMessageToTopicSchema
} from "./schemas/tool-schemas.js";
import { createWalletTool } from "./tools/create-wallet.tool.js";
import { checkBalanceTool } from "./tools/check-balance.tool.js";
import { buildTransactionTool } from "./tools/build-transaction.tool.js";
import { sendTransactionTool } from "./tools/send-transaction.tool.js";
import { getPaymentRequirementsTool, transferHbarPaymentTool } from "./tools/transfer-hbar-payment.tool.js";
import { processX402PaymentTool } from "./tools/process-x402-payment.tool.js";
import { callFacilitatorTool } from "./tools/call-facilitator.tool.js";
import { processX402PaymentFlowTool } from "./tools/process-x402-payment-flow.tool.js";
import { saveMessageToTopicTool } from "./tools/save-message-to-topic.tool.js";

/**
 * MCP Server Setup
 * Creates and configures the MCP server with all registered tools
 */
export function createMcpServer(): McpServer {
    const mcpServer = new McpServer({
        name: "Hedera-MCP-Server",
        version: "1.0.0"
    });

    // Register all MCP tools
    registerTools(mcpServer);

    return mcpServer;
}

/**
 * Register all MCP tools with the server
 */
function registerTools(mcpServer: McpServer): void {
    // 1. Create Wallet Tool
    mcpServer.tool(
        "create-wallet",
        "Create a new Hedera account",
        createWalletTool
    );

    // 2. Check Balance Tool
    mcpServer.tool(
        "check-balance",
        "Check the balance of a Hedera account",
        checkBalanceTool,
        async (args: { accountId: string }) => {
            const balance = await checkBalanceTool({ accountId: args.accountId });
            return balance;
        }
        
    );

    // 3. Build Transaction Tool
    mcpServer.tool(
        "build-transaction",
        "Build a transfer transaction",
        buildTransactionSchema,
        async (args: { senderAccountId: string, recipientAccountId: string, amount: number }) => {
            const transaction = await buildTransactionTool({ senderAccountId: args.senderAccountId, recipientAccountId: args.recipientAccountId, amount: args.amount });
            return transaction;
        }
    );

    // 4. Send Transaction Tool
    mcpServer.tool(
        "send-transaction",
        "Send a signed transaction",
        sendTransactionSchema,
        async (args: { signedTransaction: string }) => {
            const transaction = await sendTransactionTool({ signedTransaction: args.signedTransaction });
            return transaction;
        }
    );

    // 5. Get Payment Requirements Tool (x402)
    mcpServer.tool(
        "get-payment-requirements",
        "Get x402 payment requirements for MCP endpoints. Returns payment information that would be sent in HTTP 402 response.",
        getPaymentRequirementsSchema,
        async (args: { endpoint?: string }) => {
            const result = await getPaymentRequirementsTool({ endpoint: args.endpoint });
            return result;
        }
    );

    // 6. Process x402 Payment Tool
    mcpServer.tool(
        "process-x402-payment",
        "Process x402 payment using backend credentials. Handles payment via facilitator and returns payment status.",
        processX402PaymentSchema,
        async (args: { userId: string; endpoint?: string }) => {
            const result = await processX402PaymentTool({ userId: args.userId, endpoint: args.endpoint });
            return result;
        }
    );

    // 7. Transfer HBAR Payment Tool (using x402-axios approach)
    mcpServer.tool(
        "transfer-hbar-payment",
        "Transfer HBAR from user account to system account using x402-axios approach. Uses createSigner pattern similar to x402-axios example.",
        transferHbarPaymentSchema,
        async (args: { recipientAccountId: string; amount: number; userId: string }) => {
            const result = await transferHbarPaymentTool({ 
                recipientAccountId: args.recipientAccountId, 
                amount: args.amount,
                userId: args.userId
            });
            return result;
        }
    );

    // 8. Call Facilitator Tool
    mcpServer.tool(
        "call-facilitator",
        "Call x402 facilitator to verify or settle payments. Creates x-payment header with base64-encoded payload and calls facilitator endpoints.",
        callFacilitatorSchema,
        async (args: { userId: string; paymentPayload: any; paymentRequirements: any; action?: 'verify' | 'settle' }) => {
            const result = await callFacilitatorTool({
                userId: args.userId,
                paymentPayload: args.paymentPayload,
                paymentRequirements: args.paymentRequirements,
                action: args.action || 'verify'
            });
            return result;
        }
    );

    // 9. Process x402 Payment Flow Tool (Unified Flow)
    mcpServer.tool(
        "process-x402-payment-flow",
        "Complete x402 payment flow: Get payment requirements → Transfer HBAR → Verify/Settle with facilitator → Return transaction info. This is the recommended tool for processing x402 payments.",
        processX402PaymentFlowSchema,
        async (args: { userId: string; paymentRequirements?: any; action?: 'verify' | 'settle' }) => {
            const result = await processX402PaymentFlowTool({
                userId: args.userId,
                paymentRequirements: args.paymentRequirements,
                action: args.action || 'verify'
            });
            return result;
        }
    );

    // 10. Save Message to Topic Tool
    mcpServer.tool(
        "save-message-to-topic",
        "Save conversation messages (inbound/outbound) to a Hedera topic. Messages are uploaded to IPFS and then submitted to the topic.",
        saveMessageToTopicSchema,
        async (args: { topicId: string; messages: Array<{ type: 'inbound' | 'outbound'; sender: string; timestamp: string; text: string }>; userId: string }) => {
            const result = await saveMessageToTopicTool({
                topicId: args.topicId,
                messages: args.messages,
                userId: args.userId
            });
            return result;
        }
    );
}

