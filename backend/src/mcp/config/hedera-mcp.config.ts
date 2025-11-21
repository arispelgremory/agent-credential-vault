import { Client } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

/**
 * Hedera Client Configuration for MCP Server
 * Reads configuration from environment variables and creates a configured Hedera client instance.
 */
export class HederaMcpConfig {
    private static client: Client | null = null;
    private static userClients: Map<string, Client> = new Map();

    /**
     * Get or create the Hedera client instance (uses environment variables)
     * @returns Configured Hedera Client instance
     * @throws Error if required environment variables are not set
     */
    public static getClient(): Client {
        if (this.client) {
            return this.client;
        }

        const operatorId = process.env.HEDERA_OPERATOR_ID;
        const operatorKey = process.env.HEDERA_OPERATOR_KEY;
        const hederaNetwork = process.env.HEDERA_NETWORK || "testnet";

        if (!operatorId || !operatorKey) {
            throw new Error(
                "Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables."
            );
        }

        this.client = Client.forName(hederaNetwork);
        this.client.setOperator(operatorId, operatorKey);

        return this.client;
    }

    /**
     * Get or create a Hedera client instance for a specific user
     * @param operatorAccountId - The Hedera operator account ID
     * @param privateKey - The private key for the operator account
     * @param network - The Hedera network (testnet or mainnet)
     * @param userId - Optional user ID for caching
     * @returns Configured Hedera Client instance
     */
    public static getClientForUser(
        operatorAccountId: string,
        privateKey: string,
        network: string = "testnet",
        userId?: string
    ): Client {
        // If userId is provided and we have a cached client, return it
        if (userId && this.userClients.has(userId)) {
            return this.userClients.get(userId)!;
        }

        const client = Client.forName(network);
        client.setOperator(operatorAccountId, privateKey);

        // Cache the client if userId is provided
        if (userId) {
            this.userClients.set(userId, client);
        }

        return client;
    }

    /**
     * Close the Hedera client connection
     */
    public static async close(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
    }

    /**
     * Close a user-specific client connection
     */
    public static async closeUserClient(userId: string): Promise<void> {
        const client = this.userClients.get(userId);
        if (client) {
            await client.close();
            this.userClients.delete(userId);
        }
    }

    /**
     * Close all user client connections
     */
    public static async closeAllUserClients(): Promise<void> {
        const closePromises = Array.from(this.userClients.values()).map(client => client.close());
        await Promise.all(closePromises);
        this.userClients.clear();
    }
}

