import { AccountCreateTransaction, PrivateKey } from "@hashgraph/sdk";
import { HederaMcpConfig } from "../config/hedera-mcp.config.js";
import { CredentialRepository } from "@/features/credential/credential.repository.js";

/**
 * Create Wallet Tool
 * Creates a new Hedera account with a generated private key
 * 
 * @param userId - Optional user ID to fetch credentials from database
 * @returns MCP tool response with account details
 */
export async function createWalletTool({ userId }: { userId?: string } = {}) {
    console.log('Creating new Hedera wallet...');
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
        hederaClient = HederaMcpConfig.getClient();
    }
    
    const newPrivateKey = PrivateKey.generateECDSA();

    // Create an account with a small initial balance (1 tinybar)
    const transaction = await new AccountCreateTransaction()
        .setECDSAKeyWithAlias(newPrivateKey)
        .setInitialBalance(1) // tinybars
        .execute(hederaClient);

    const receipt = await transaction.getReceipt(hederaClient);
    const newAccountId = receipt.accountId?.toString() || "unknown";
    console.log('Receipt:', receipt);
    console.log('New Hedera wallet created:', newAccountId);

    return {
        content: [{
            type: "text" as const,
            text: JSON.stringify({
                accountId: newAccountId,
                evmAddress: '0x' + newPrivateKey.publicKey.toEvmAddress(),
                privateKey: newPrivateKey.toString() // Warning: For production, NEVER return private keys!
            }, null, 2)
        }]
    };
}

