import { AccountBalanceQuery } from "@hashgraph/sdk";
import { HederaMcpConfig } from "../config/hedera-mcp.config.js";
import { CredentialRepository } from "@/features/credential/credential.repository.js";

/**
 * Check Balance Tool
 * Checks the balance of a Hedera account
 * 
 * This tool is registered in the MCP server at src/mcp/server.ts
 * 
 * How to call from an agent/client:
 * 1. Connect to MCP server via SSE: GET /api/v1/mcp/sse
 * 2. Initialize: POST /api/v1/mcp/messages with method "initialize"
 * 3. Call tool: POST /api/v1/mcp/messages with:
 *    {
 *      "jsonrpc": "2.0",
 *      "id": 1,
 *      "method": "tools/call",
 *      "params": {
 *        "name": "check-balance",
 *        "arguments": { "accountId": "0.0.123456" }
 *      }
 *    }
 * 
 * Or use the McpTestClient class:
 *    const client = new McpTestClient();
 *    await client.connect();
 *    await client.initialize();
 *    const result = await client.callTool('check-balance', { accountId: '0.0.123456' });
 * 
 * See src/mcp/AGENT_USAGE_GUIDE.md for detailed examples
 * 
 * @param accountId - The Hedera account ID to check (optional, uses operator account if not provided)
 * @param userId - Optional user ID to fetch credentials from database
 * @returns MCP tool response with account balance
 */
export async function checkBalanceTool({ 
    accountId, 
    userId 
}: { 
    accountId?: string; 
    userId?: string;
}) {
    let hederaClient;
    
    // If userId is provided, try to get credentials from database
    if (userId) {
        try {
            const credentialRepo = new CredentialRepository();
            const credentials = await credentialRepo.getDecryptedCredentialByUserId(userId);
            
            if (credentials) {
                hederaClient = HederaMcpConfig.getClientForUser(
                    credentials.operatorAccountId,
                    credentials.privateKey,
                    credentials.network,
                    userId
                );
                // Use operator account if accountId not provided
                if (!accountId) {
                    accountId = credentials.operatorAccountId;
                }
            }
        } catch (error) {
            console.warn('Failed to get user credentials, falling back to environment variables:', error);
        }
    }
    
    // Fallback to environment variables if no user credentials
    if (!hederaClient) {
        try {
            hederaClient = HederaMcpConfig.getClient();
            if (!accountId) {
                accountId = process.env.HEDERA_OPERATOR_ID || process.env.OPERATOR_ID || '0.0.123456';
            }
        } catch (error) {
            throw new Error(
                userId 
                    ? 'No Hedera credentials found in database for this user. Please add credentials via the credential API or set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables.'
                    : 'No Hedera credentials available. Please authenticate and add credentials via the credential API, or set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables.'
            );
        }
    }

    const balance = await new AccountBalanceQuery()
        .setAccountId(accountId!)
        .execute(hederaClient);
    console.log('Balance:', balance);
    return {
        content: [{
            type: "text" as const,
            text: `Balance for account ${accountId}: ${balance.hbars.toTinybars()} tinybars`
        }]
    };
}

