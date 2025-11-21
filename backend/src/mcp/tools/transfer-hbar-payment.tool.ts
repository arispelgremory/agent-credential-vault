/**
 * Transfer HBAR Payment Tool
 * Transfers HBAR from user's account to system account on Hedera
 * 
 * This tool performs a direct HBAR transfer using the Hedera SDK.
 * It signs and executes the transaction directly without requiring a facilitator.
 * 
 * @param recipientAccountId - The system account ID to receive the HBAR payment
 * @param amount - The amount to transfer (in HBAR)
 * @param userId - User ID to fetch credentials from database
 * @returns MCP tool response with transaction execution status
 */
import { TransferTransaction, Hbar, PrivateKey } from "@hashgraph/sdk";
import { CredentialRepository } from "@/features/credential/credential.repository.js";
import { HederaMcpConfig } from "../config/hedera-mcp.config.js";

/**
 * Get Payment Requirements Tool
 * Retrieves x402 payment requirements for MCP endpoints
 * 
 * This tool returns the payment requirements that would be sent in an HTTP 402 response.
 * It uses the same configuration as the paymentMiddleware to ensure consistency.
 * 
 * @param endpoint - Optional endpoint path (defaults to "/api/v1/mcp/messages")
 * @returns MCP tool response with payment requirements (similar to HTTP 402 response)
 */
export async function getPaymentRequirementsTool({
    endpoint
}: {
    endpoint?: string;
}) {
    // Get system account ID from environment variables
    const payTo = process.env.HEDERA_SYSTEM_ACCOUNT_ID || 
                  process.env.HEDERA_OPERATOR_ID || 
                  '0.0.0';
    
    // Default endpoint if not provided
    const targetEndpoint = endpoint || '/api/v1/mcp/messages';
    
    // Payment configuration (matches paymentMiddleware in mcp.routes.ts)
    const price = '$0.001'; // Fixed price per MCP message
    const network = 'hedera-testnet'; // Default to hedera-testnet (x402-axios supports this format)
    const description = 'Access to MCP (Model Context Protocol) tools and operations';
    
    // Validate configuration
    if (!payTo || payTo === '0.0.0') {
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Payment configuration error",
                    message: "HEDERA_SYSTEM_ACCOUNT_ID or HEDERA_OPERATOR_ID environment variable is not set",
                    paymentRequirements: null
                }, null, 2)
            }]
        };
    }
    
    // Validate account ID format
    const accountIdPattern = /^0\.0\.\d+$/;
    if (!accountIdPattern.test(payTo)) {
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Invalid account ID format",
                    message: `Invalid system account ID format: ${payTo}. Expected format: 0.0.xxxxx`,
                    paymentRequirements: null
                }, null, 2)
            }]
        };
    }

    // Calculate amount in tinybars
    // $0.001 = 0.001 HBAR = 0.001 * 100,000,000 tinybars = 100,000 tinybars
    const priceInHbar = 0.001;
    const amountInTinybars = Math.floor(priceInHbar * 100_000_000);
    
    // Construct payment requirements (similar to HTTP 402 response format)
    // This structure matches what x402-express paymentMiddleware would return
    // Based on x402 protocol specification and x402-express implementation
    const paymentRequirements = {
        scheme: "exact" as const,
        network: network,
        maxAmountRequired: amountInTinybars.toString(), // Amount in tinybars (smallest unit)
        resource: targetEndpoint,
        description: description,
        mimeType: "application/json",
        payTo: payTo,
        maxTimeoutSeconds: 60,
        asset: null, // Hedera uses native HBAR, no asset contract address needed
        outputSchema: null,
        extra: {
            feePayer: payTo, // For Hedera, feePayer is the account ID
            x402Version: 1,
            price: price // Human-readable price for display
        }
    };
    
    // Return payment requirements in HTTP 402-like format
    return {
        content: [{
            type: "text" as const,
            text: JSON.stringify({
                success: true,
                httpStatus: 402,
                error: "X-PAYMENT header is required",
                message: `Payment required for endpoint: ${targetEndpoint}`,
                paymentRequirements: paymentRequirements
            }, null, 2)
        }]
    };
}

export async function transferHbarPaymentTool({
    recipientAccountId,
    amount,
    userId
}: {
    recipientAccountId: string;
    amount: number;
    userId: string;
}) {
    if (!userId) {
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "User ID is required",
                    message: "userId parameter is required to fetch credentials from database"
                }, null, 2)
            }]
        };
    }

    try {
        // Get user credentials from database (similar to how example gets from env)
        const credentialRepo = new CredentialRepository();
        const credentials = await credentialRepo.getDecryptedCredentialByUserId(userId);

        if (!credentials) {
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: false,
                        error: "Credentials not found",
                        message: `No Hedera credentials found in database for user from transfer-hbar-payment tool ${userId}`
                    }, null, 2)
                }]
            };
        }

        // Normalize network name for Hedera
        const normalizedNetwork = credentials.network === 'testnet' || credentials.network === 'hedera-testnet' 
            ? 'hedera-testnet' 
            : credentials.network === 'mainnet' || credentials.network === 'hedera-mainnet'
            ? 'hedera-mainnet'
            : credentials.network;

        // Create dummy signer object (not using x402-axios createSigner due to network support issues)
        // We'll use Hedera SDK directly to sign transactions
        const dummySigner = {
            accountId: credentials.operatorAccountId,
            network: normalizedNetwork,
            // Dummy methods for interface compatibility
            getAddress: async () => credentials.operatorAccountId,
            sign: async (transaction: any) => {
                // This won't be called, we'll sign directly with PrivateKey
                return transaction;
            }
        };
        // Get system account ID from environment variable or use provided recipientAccountId
        const systemAccountId = process.env.HEDERA_SYSTEM_ACCOUNT_ID || recipientAccountId;
        
        // Validate recipient account ID format
        const accountIdPattern = /^0\.0\.\d+$/;
        if (!accountIdPattern.test(systemAccountId)) {
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: false,
                        error: "Invalid account ID format",
                        message: `Invalid system account ID format: ${systemAccountId}. Expected format: 0.0.xxxxx`
                    }, null, 2)
                }]
            };
        }

        // Validate amount
        if (amount <= 0) {
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: false,
                        error: "Invalid amount",
                        message: "Amount must be greater than 0"
                    }, null, 2)
                }]
            };
        }

        console.log("Transfer HBAR Payment (using x402-axios approach):");
        console.log("  From:", credentials.operatorAccountId);
        console.log("  To:", systemAccountId);
        console.log("  Amount:", amount, "HBAR");
        console.log("  Network:", normalizedNetwork);

        // Get Hedera client for transaction execution
        const hederaClient = HederaMcpConfig.getClientForUser(
            credentials.operatorAccountId,
            credentials.privateKey,
            credentials.network,
            userId
        );

        // Convert amount from HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
        const amountInTinybars = amount * 100_000_000;

        // Build a transfer transaction from user's account to system account
        const transferTx = new TransferTransaction()
            .addHbarTransfer(credentials.operatorAccountId, Hbar.fromTinybars(-amountInTinybars))
            .addHbarTransfer(systemAccountId, Hbar.fromTinybars(amountInTinybars));

        // Freeze the transaction with the client
        const frozenTx = await transferTx.freezeWith(hederaClient);

        // Sign the transaction directly using Hedera SDK PrivateKey (not using x402-axios signer)
        const operatorPrivateKey = PrivateKey.fromString(credentials.privateKey);
        const signedTx = await frozenTx.sign(operatorPrivateKey);

        // Execute the signed transaction
        const txResponse = await signedTx.execute(hederaClient);
        const receipt = await txResponse.getReceipt(hederaClient);

        // Get transaction details
        const transactionId = txResponse.transactionId.toString();
        const status = receipt.status.toString();
        const amountInHbar = amount.toFixed(8);

        // Construct payment response (similar to X-PAYMENT-RESPONSE header in x402 protocol)
        // This follows the same pattern as the example in index.ts (lines 93-99)
        const paymentResponse = {
            transactionId: transactionId,
            status: status,
            from: credentials.operatorAccountId,
            to: systemAccountId,
            amount: amountInHbar,
            amountInTinybars: amountInTinybars.toString(),
            network: normalizedNetwork,
            timestamp: new Date().toISOString()
        };

        // Log payment response (similar to example in index.ts)
        console.log("Payment Response:", paymentResponse);

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: true,
                    transactionId: transactionId,
                    status: status,
                    from: credentials.operatorAccountId,
                    to: systemAccountId,
                    amount: `${amountInHbar} HBAR (${amountInTinybars} tinybars)`,
                    message: `Payment processed successfully. Transferred ${amountInHbar} HBAR from ${credentials.operatorAccountId} to system account ${systemAccountId}`,
                    paymentType: "hbar-transfer",
                    network: normalizedNetwork,
                    method: "hedera-sdk-direct",
                    paymentResponse: paymentResponse
                }, null, 2)
            }]
        };
    } catch (error: any) {
        console.error("Error transferring HBAR payment:", error);
        
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Transfer failed",
                    message: error.message || 'Unknown error',
                    details: error.toString()
                }, null, 2)
            }]
        };
    }
}
