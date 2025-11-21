import { Transaction } from "@hashgraph/sdk";
import { HederaMcpConfig } from "../config/hedera-mcp.config.js";
import { CredentialRepository } from "@/features/credential/credential.repository.js";

/**
 * Send Transaction Tool
 * Sends a signed transaction to the Hedera network
 * 
 * @param signedTransaction - Base64-encoded signed transaction bytes
 * @param userId - Optional user ID to fetch credentials from database
 * @returns MCP tool response with transaction execution status
 */
export async function sendTransactionTool({
    signedTransaction,
    userId
}: {
    signedTransaction: string;
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
            }
        } catch (error) {
            console.warn('Failed to get user credentials, falling back to environment variables:', error);
        }
    }
    
    // Fallback to environment variables if no user credentials
    if (!hederaClient) {
        try {
            hederaClient = HederaMcpConfig.getClient();
        } catch (error) {
            throw new Error(
                userId 
                    ? 'No Hedera credentials found in database for this user. Please add credentials via the credential API or set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables.'
                    : 'No Hedera credentials available. Please authenticate and add credentials via the credential API, or set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables.'
            );
        }
    }

    // Decode the base64-encoded transaction bytes
    const txBytes = Buffer.from(signedTransaction, "base64");

    // Recreate the transaction object
    const signedTx = Transaction.fromBytes(txBytes);

    // Execute the signed transaction on the Hedera network
    const txResponse = await signedTx.execute(hederaClient);
    const receipt = await txResponse.getReceipt(hederaClient);

    return {
        content: [{
            type: "text" as const,
            text: `Transaction executed. Status: ${receipt.status.toString()}, Transaction ID: ${txResponse.transactionId.toString()}`
        }]
    };
}

