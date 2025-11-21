import { TransferTransaction, Hbar, PrivateKey } from "@hashgraph/sdk";
import { HederaMcpConfig } from "../config/hedera-mcp.config.js";
import { CredentialRepository } from "@/features/credential/credential.repository.js";

/**
 * Build and Send Transaction Tool
 * Builds, signs, and sends a transfer transaction automatically
 * 
 * @param senderAccountId - The account ID of the sender
 * @param recipientAccountId - The account ID of the recipient
 * @param amount - The amount to transfer (in HBAR)
 * @param userId - Optional user ID to fetch credentials from database
 * @returns MCP tool response with transaction execution status
 */
export async function buildTransactionTool({
    senderAccountId,
    recipientAccountId,
    amount,
    userId
}: {
    senderAccountId: string;
    recipientAccountId: string;
    amount: number;
    userId?: string;
}) {
    let hederaClient;
    let operatorKey: string;
    let operatorAccountId: string;

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
                operatorKey = credentials.privateKey;
                operatorAccountId = credentials.operatorAccountId;
            }
        } catch (error) {
            console.warn('Failed to get user credentials, falling back to environment variables:', error);
        }
    }
    
    // Fallback to environment variables if no user credentials
    if (!hederaClient) {
        try {
            hederaClient = HederaMcpConfig.getClient();
            operatorKey = process.env.HEDERA_OPERATOR_KEY || '';
            operatorAccountId = process.env.HEDERA_OPERATOR_ID || '';
            
            if (!operatorKey) {
                throw new Error("HEDERA_OPERATOR_KEY environment variable is not set");
            }
        } catch (error) {
            throw new Error(
                userId 
                    ? 'No Hedera credentials found in database for this user. Please add credentials via the credential API or set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables.'
                    : 'No Hedera credentials available. Please authenticate and add credentials via the credential API, or set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables.'
            );
        }
    }

    console.log("senderAccountId", senderAccountId);
    console.log("recipientAccountId", recipientAccountId);
    console.log("amount", amount);
    // Convert amount from HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
    const amountInTinybars = amount * 100_000_000;

    // Build a transfer transaction from sender to recipient
    const transferTx = new TransferTransaction()
        .addHbarTransfer(senderAccountId, Hbar.fromTinybars(-amountInTinybars))
        .addHbarTransfer(recipientAccountId, Hbar.fromTinybars(amountInTinybars));

    // Freeze the transaction with the client
    const frozenTx = await transferTx.freezeWith(hederaClient);

    // Sign the transaction with the operator's private key
    const operatorPrivateKey = PrivateKey.fromString(operatorKey!);
    const signedTx = await frozenTx.sign(operatorPrivateKey);

    // Execute the signed transaction on the Hedera network
    const txResponse = await signedTx.execute(hederaClient);
    const receipt = await txResponse.getReceipt(hederaClient);

    // Get transaction details
    const transactionId = txResponse.transactionId.toString();
    const status = receipt.status.toString();
    const amountInHbar = amount.toFixed(8);

    return {
        content: [{
            type: "text" as const,
            text: JSON.stringify({
                success: true,
                transactionId: transactionId,
                status: status,
                from: senderAccountId,
                to: recipientAccountId,
                amount: `${amountInHbar} HBAR (${amountInTinybars} tinybars)`,
                message: `Transaction executed successfully. Transferred ${amountInHbar} HBAR from ${senderAccountId} to ${recipientAccountId}`
            }, null, 2)
        }]
    };
}

