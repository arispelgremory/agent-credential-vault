import { Client, AccountId, PrivateKey, Hbar, AccountBalanceQuery, AccountInfoQuery } from '@hashgraph/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface HederaConfig {
  operatorId: string;
  operatorKey: string;
  network: 'testnet' | 'mainnet' | 'previewnet';
}

export class HederaClient {
  private client: Client | null = null;
  private config: HederaConfig | null = null;

  constructor(config?: Partial<HederaConfig>) {
    // Only set config if provided, don't create client yet
    if (config && (config.operatorId || config.operatorKey)) {
      this.config = {
        operatorId: config.operatorId || process.env.HEDERA_OPERATOR_ID || '',
        operatorKey: config.operatorKey || process.env.HEDERA_OPERATOR_KEY || '',
        network: config.network || (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet' | 'previewnet') || 'testnet',
      };
    } else {
      // Try to use environment variables as fallback
      const operatorId = process.env.HEDERA_OPERATOR_ID;
      const operatorKey = process.env.HEDERA_OPERATOR_KEY;
      if (operatorId && operatorKey) {
        this.config = {
          operatorId,
          operatorKey,
          network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet' | 'previewnet') || 'testnet',
        };
      }
    }
  }

  /**
   * Initialize the client with credentials
   * This should be called before using the client
   */
  public initialize(config: HederaConfig): void {
    this.config = config;
    this.validateConfig();
    this.client = this.createClient();
  }

  private validateConfig(): void {
    if (!this.config) {
      throw new Error('Hedera client not initialized. Call initialize() with credentials first.');
    }
    if (!this.config.operatorId) {
      throw new Error('operatorId is required');
    }
    if (!this.config.operatorKey) {
      throw new Error('operatorKey is required');
    }
  }

  private createClient(): Client {
    if (!this.config) {
      throw new Error('Hedera client not initialized. Call initialize() with credentials first.');
    }

    try {
      const operatorId = AccountId.fromString(this.config.operatorId);
      const operatorKey = PrivateKey.fromStringECDSA(this.config.operatorKey);

      const client = Client.forName(this.config.network);
      client.setOperator(operatorId, operatorKey);

      return client;
    } catch (error) {
      throw new Error(`Failed to create Hedera client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the client, ensuring it's initialized
   */
  public getClient(): Client {
    if (!this.client) {
      if (!this.config) {
        throw new Error('Hedera client not initialized. Call initialize() with credentials first or provide credentials in constructor.');
      }
      this.client = this.createClient();
    }
    return this.client;
  }

  public getOperatorId(): AccountId {
    if (!this.config) {
      throw new Error('Hedera client not initialized');
    }
    return AccountId.fromString(this.config.operatorId);
  }

  public getOperatorKey(): PrivateKey {
    if (!this.config) {
      throw new Error('Hedera client not initialized');
    }
    return PrivateKey.fromStringECDSA(this.config.operatorKey);
  }

  public getNetwork(): string {
    if (!this.config) {
      throw new Error('Hedera client not initialized');
    }
    return this.config.network;
  }

  public async getAccountBalance(accountId: string): Promise<Hbar> {
    try {
      const client = this.getClient();
      const accountIdObj = AccountId.fromString(accountId);
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountIdObj)
        .execute(client);
      
      return balance.hbars;
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getAccountInfo(accountId: string) {
    try {
      const client = this.getClient();
      const accountIdObj = AccountId.fromString(accountId);
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(accountIdObj)
        .execute(client);
      
      return accountInfo;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

// Create a singleton instance (lazy initialization)
let hederaClientInstance: HederaClient | null = null;

/**
 * Get or create a Hedera client instance
 * If config is provided, it will initialize the client
 * If no config is provided, it returns an uninitialized client (must call initialize() later)
 */
export const getHederaClient = (config?: Partial<HederaConfig>): HederaClient => {
  if (!hederaClientInstance) {
    hederaClientInstance = new HederaClient(config);
    // If config is provided with credentials, initialize immediately
    if (config && config.operatorId && config.operatorKey) {
      hederaClientInstance.initialize({
        operatorId: config.operatorId,
        operatorKey: config.operatorKey,
        network: config.network || 'testnet',
      });
    }
  } else if (config && config.operatorId && config.operatorKey) {
    // If instance exists but new config is provided, reinitialize
    hederaClientInstance.initialize({
      operatorId: config.operatorId,
      operatorKey: config.operatorKey,
      network: config.network || 'testnet',
    });
  }
  return hederaClientInstance;
};

/**
 * Create a new Hedera client instance (not singleton)
 */
export const createHederaClient = (config?: Partial<HederaConfig>): HederaClient => {
  const client = new HederaClient(config);
  // If config is provided with credentials, initialize immediately
  if (config && config.operatorId && config.operatorKey) {
    client.initialize({
      operatorId: config.operatorId,
      operatorKey: config.operatorKey,
      network: config.network || 'testnet',
    });
  }
  return client;
};

/**
 * Create a Hedera client from credentials (for use with credential table)
 */
export const createHederaClientFromCredentials = (
  operatorAccountId: string,
  privateKey: string,
  network: 'testnet' | 'mainnet' | 'previewnet' = 'testnet'
): HederaClient => {
  const client = new HederaClient();
  client.initialize({
    operatorId: operatorAccountId,
    operatorKey: privateKey,
    network,
  });
  return client;
};


