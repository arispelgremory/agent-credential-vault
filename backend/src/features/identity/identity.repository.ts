/**
 * Identity Repository for ERC-8004 Agent Registration
 * 
 * Required dependencies:
 * - ethers: npm install ethers (installed)
 * - @pinata/sdk: npm install @pinata/sdk (installed)
 * - @hedera-sandbox/erc8004-sdk: Local package from hedera-sandbox workspace
 */

import { Client, PrivateKey, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { createHash } from 'crypto';
import { ethers } from 'ethers';
import pinataSDK from '@pinata/sdk';
import type { 
  AgentMetadata, 
  RegisterAgentRequest,
  HCS10BroadcastRequest,
  HCS11ProfileRequest,
  HCS14UAIDRequest,
  ValidationRequest,
  ValidationResponse,
  FeedbackRequest
} from './identity.model.js';

type PinataClient = InstanceType<typeof pinataSDK>;

/**
 * Identity Repository
 * Handles ERC-8004 agent registration and management
 */
export class IdentityRepository {
  private provider: ethers.JsonRpcProvider;
  private hederaClient: Client;
  private pinataClient: PinataClient | null;
  private identityRegistry: string;
  private reputationRegistry: string;
  private validationRegistry: string;
  private chainId: number;
  private ERC8004Client: any = null;
  private EthersAdapter: any = null;

  constructor() {
    // Initialize Hedera RPC provider
    const rpcUrl = process.env.HEDERA_RPC_URL;
    if (!rpcUrl) {
      throw new Error('HEDERA_RPC_URL environment variable is required');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize Hedera client
    const accountId = process.env.HEDERA_TESTNET_ACCOUNT_1;
    const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY_1;
    if (!accountId || !privateKey) {
      throw new Error('HEDERA_TESTNET_ACCOUNT_1 and HEDERA_TESTNET_PRIVATE_KEY_1 are required');
    }
    this.hederaClient = Client.forTestnet().setOperator(
      accountId,
      PrivateKey.fromStringECDSA(privateKey)
    );

    // Initialize Pinata client
    const apiKey = process.env.PINATA_API_KEY;
    const secret = process.env.PINATA_SECRET_API_KEY;
    if (apiKey && secret) {
      this.pinataClient = new pinataSDK({
        pinataApiKey: apiKey,
        pinataSecretApiKey: secret,
      });
    } else {
      this.pinataClient = null;
      console.warn('⚠️  Pinata credentials not provided. IPFS features will be limited.');
    }

    // Contract addresses
    this.identityRegistry = process.env.IDENTITY_REGISTRY || '0xfbbd1f90faf7eaf985c41b4a0aef3959d15b8072';
    this.reputationRegistry = process.env.REPUTATION_REGISTRY || '0x8a71cda97cb831ab30680e3b8ddb1625cc19c823';
    this.validationRegistry = process.env.VALIDATION_REGISTRY || '0xb9d0be53ab8d6713324e621d0a27e0df11fe4897';
    this.chainId = parseInt(process.env.CHAIN_ID || '296', 10);
  }

  /**
   * Create ERC8004Client instance for a wallet
   */
  private async createClient(wallet: ethers.Wallet): Promise<any> {
    const adapter = new this.EthersAdapter(this.provider, wallet);
    return new this.ERC8004Client({
      adapter,
      addresses: {
        identityRegistry: this.identityRegistry,
        reputationRegistry: this.reputationRegistry,
        validationRegistry: this.validationRegistry,
        chainId: this.chainId,
      },
    });
  }

  /**
   * Get wallet from private key
   */
  private getWallet(privateKey: string): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Pin JSON to IPFS using Pinata
   */
  async pinJsonToIpfs<T extends Record<string, unknown>>(
    payload: T,
    label: string
  ): Promise<{ uri: string; cid: string }> {
    if (!this.pinataClient) {
      throw new Error('Pinata client not configured. Set PINATA_API_KEY and PINATA_SECRET_API_KEY.');
    }

    try {
      const result = await this.pinataClient.pinJSONToIPFS(payload, {
        pinataMetadata: { name: label },
        pinataOptions: { cidVersion: 1 },
      });

      const cid = result.IpfsHash;
      if (!cid) {
        throw new Error('Pinata response missing IpfsHash');
      }

      return { uri: `ipfs://${cid}`, cid };
    } catch (error: any) {
      console.error(`❌ Pinata upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit message to HCS topic
   */
  private async submitHcsMessage(
    topicId: string,
    payload: unknown,
    label: string
  ): Promise<string> {
    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(payload))
      .execute(this.hederaClient);
    
    const receipt = await tx.getReceipt(this.hederaClient);
    const reference = `hcs://${topicId}/${receipt.topicSequenceNumber}`;
    console.log(`✅ ${label} recorded: ${reference}`);
    return reference;
  }

  /**
   * Build agent metadata
   */
  private buildAgentMetadata(agentId: bigint, request: RegisterAgentRequest): AgentMetadata {
    return {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: request.name,
      description: request.description,
      endpoints: request.endpoints,
      registrations: [
        {
          agentId: Number(agentId),
          agentRegistry: `eip155:${this.chainId}:${this.identityRegistry}`,
        },
      ],
      supportedTrust: request.supportedTrust || ['reputation'],
    };
  }

  /**
   * Convert Hedera account ID to tokenId
   * Format: "0.0.7148856" -> BigInt(7148856)
   */
  private parseTokenId(tokenIdOrAccountId: string): bigint {
    // Check if it's a Hedera account ID format (shard.realm.account)
    if (tokenIdOrAccountId.includes('.')) {
      const accountParts = tokenIdOrAccountId.split('.');
      if (accountParts.length !== 3) {
        throw new Error(`Invalid Hedera account ID format: ${tokenIdOrAccountId}. Expected format: shard.realm.account`);
      }
      const accountNumber = accountParts[2];
      return BigInt(accountNumber);
    }
    // Otherwise, treat as direct tokenId
    return BigInt(tokenIdOrAccountId);
  }

  /**
   * Register a new agent
   */
  async registerAgent(
    ownerPrivateKey: string,
    request: RegisterAgentRequest
  ): Promise<{
    agentId: bigint;
    txHash: string;
    owner: string;
    registrationUri?: string;
    metadataCid?: string;
  }> {
    const wallet = this.getWallet(ownerPrivateKey);
    const client = await this.createClient(wallet);

    // Register agent - use registerWithTokenId if tokenId is provided
    let result: { agentId: bigint; txHash: string };
    if (request.tokenId) {
      const tokenId = this.parseTokenId(request.tokenId);
      result = await client.identity.registerWithTokenId(tokenId);
    } else {
      result = await client.identity.register();
    }
    
    const agentId = result.agentId;
    const owner = await client.identity.getOwner(agentId);

    // Build and pin metadata
    const agentMetadata = this.buildAgentMetadata(agentId, request);
    let registrationUri: string | undefined;
    let metadataCid: string | undefined;

    try {
      const pinResult = await this.pinJsonToIpfs(
        agentMetadata,
        `agent-${agentId}-metadata`
      );
      registrationUri = pinResult.uri;
      metadataCid = pinResult.cid;

      // Set agent URI
      await client.identity.setAgentUri(agentId, registrationUri);

      // Set metadata
      await client.identity.setMetadata(
        agentId,
        'agentMetadata',
        JSON.stringify(agentMetadata)
      );
    } catch (error) {
      console.warn('⚠️  Failed to pin metadata to IPFS:', error);
    }

    return {
      agentId,
      txHash: result.txHash,
      owner,
      registrationUri,
      metadataCid,
    };
  }

  /**
   * Set agent URI
   */
  async setAgentUri(
    ownerPrivateKey: string,
    agentId: string,
    uri: string
  ): Promise<{ txHash: string }> {
    const wallet = this.getWallet(ownerPrivateKey);
    const client = await this.createClient(wallet);
    const result = await client.identity.setAgentUri(BigInt(agentId), uri);
    return { txHash: result.txHash };
  }

  /**
   * Set agent metadata
   */
  async setAgentMetadata(
    ownerPrivateKey: string,
    agentId: string,
    key: string,
    value: string
  ): Promise<{ txHash: string }> {
    const wallet = this.getWallet(ownerPrivateKey);
    const client = await this.createClient(wallet);
    const result = await client.identity.setMetadata(BigInt(agentId), key, value);
    return { txHash: result.txHash };
  }

  /**
   * Get agent metadata
   */
  async getAgentMetadata(
    agentId: string,
    key: string
  ): Promise<string> {
    // Use a default wallet for read operations
    const defaultPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY_1;
    if (!defaultPrivateKey) {
      throw new Error('HEDERA_TESTNET_PRIVATE_KEY_1 is required for read operations');
    }
    const wallet = this.getWallet(defaultPrivateKey);
    const client = await this.createClient(wallet);
    return await client.identity.getMetadata(BigInt(agentId), key);
  }

  /**
   * Get agent owner
   */
  async getAgentOwner(agentId: string): Promise<string> {
    const defaultPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY_1;
    if (!defaultPrivateKey) {
      throw new Error('HEDERA_TESTNET_PRIVATE_KEY_1 is required for read operations');
    }
    const wallet = this.getWallet(defaultPrivateKey);
    const client = await this.createClient(wallet);
    return await client.identity.getOwner(BigInt(agentId));
  }

  /**
   * Broadcast agent via HCS-10
   */
  async broadcastHCS10(
    ownerPrivateKey: string,
    request: HCS10BroadcastRequest
  ): Promise<{ reference: string; txHash: string }> {
    const wallet = this.getWallet(ownerPrivateKey);
    const client = await this.createClient(wallet);
    const agentId = BigInt(request.agentId);

    // Get agent metadata
    const metadataStr = await client.identity.getMetadata(agentId, 'agentMetadata');
    const agentMetadata: AgentMetadata = JSON.parse(metadataStr);
    const tokenUri = await client.identity.getTokenURI(agentId);
    const owner = await client.identity.getOwner(agentId);

    const hcs10Payload = {
      standard: 'hcs-10',
      version: '1.0.0',
      agent: {
        agentId: request.agentId,
        registry: `eip155:${this.chainId}:${this.identityRegistry.toLowerCase()}`,
        owner: owner.toLowerCase(),
        endpoints: agentMetadata.endpoints,
        supportedTrust: agentMetadata.supportedTrust,
        registrationUri: tokenUri,
      },
      timestamp: new Date().toISOString(),
    };

    const reference = await this.submitHcsMessage(
      request.topicId,
      hcs10Payload,
      'HCS-10 agent announcement'
    );

    // Store HCS-10 reference in metadata
    await client.identity.setMetadata(
      agentId,
      'hcs10',
      JSON.stringify({
        topicId: request.topicId,
        reference,
        payload: hcs10Payload,
      })
    );

    return { reference, txHash: 'hcs-tx' };
  }

  /**
   * Publish profile via HCS-11
   */
  async publishHCS11(
    ownerPrivateKey: string,
    request: HCS11ProfileRequest
  ): Promise<{ reference: string; profileUri: string; profileCid: string }> {
    const wallet = this.getWallet(ownerPrivateKey);
    const client = await this.createClient(wallet);
    const agentId = BigInt(request.agentId);

    // Get HCS-10 reference if available
    let hcs10Reference: string | null = null;
    try {
      const hcs10Data = await client.identity.getMetadata(agentId, 'hcs10');
      const parsed = JSON.parse(hcs10Data);
      hcs10Reference = parsed.reference;
    } catch {
      // HCS-10 not set, continue without it
    }

    const profileDocument = {
      version: '1.0.0',
      profile: {
        agentId: request.agentId,
        displayName: request.displayName,
        description: request.description,
        maintainer: request.maintainer.toLowerCase(),
        capabilities: request.capabilities,
        websites: request.websites || [],
        hcs10Reference,
      },
      timestamp: new Date().toISOString(),
    };

    const profilePin = await this.pinJsonToIpfs(
      profileDocument,
      `agent-${request.agentId}-profile`
    );

    const hcs11Payload = {
      standard: 'hcs-11',
      version: profileDocument.version,
      profileUri: profilePin.uri,
      profileCid: profilePin.cid,
      profile: profileDocument.profile,
      timestamp: profileDocument.timestamp,
      hcs10Reference,
    };

    const reference = await this.submitHcsMessage(
      request.topicId,
      hcs11Payload,
      'HCS-11 profile metadata'
    );

    // Store HCS-11 reference in metadata
    await client.identity.setMetadata(
      agentId,
      'hcs11',
      JSON.stringify({
        topicId: request.topicId,
        reference,
        payload: hcs11Payload,
        profileDocument,
      })
    );

    return {
      reference,
      profileUri: profilePin.uri,
      profileCid: profilePin.cid,
    };
  }

  /**
   * Request validation
   */
  async requestValidation(
    ownerPrivateKey: string,
    request: ValidationRequest
  ): Promise<{ txHash: string; requestUri: string; requestHash: string }> {
    const wallet = this.getWallet(ownerPrivateKey);
    const client = await this.createClient(wallet);
    const agentId = BigInt(request.agentId);

    const validationRequestPayload = {
      agentId: request.agentId,
      validator: request.validatorAddress.toLowerCase(),
      intent: request.intent,
      reference: request.referenceUri,
      createdAt: new Date().toISOString(),
    };

    const requestPin = await this.pinJsonToIpfs(
      validationRequestPayload,
      `agent-${request.agentId}-validation-request`
    );

    const requestHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(validationRequestPayload))
    );

    const result = await client.validation.validationRequest({
      validatorAddress: request.validatorAddress,
      agentId,
      requestUri: requestPin.uri,
      requestHash,
    });

    return {
      txHash: result.txHash,
      requestUri: requestPin.uri,
      requestHash,
    };
  }

  /**
   * Submit validation response
   */
  async submitValidationResponse(
    validatorPrivateKey: string,
    response: ValidationResponse
  ): Promise<{ txHash: string }> {
    const wallet = this.getWallet(validatorPrivateKey);
    const client = await this.createClient(wallet);

    const result = await client.validation.validationResponse({
      requestHash: response.requestHash,
      response: response.response,
      responseUri: response.responseUri,
      responseHash: response.responseHash,
      tag: response.tag,
    });

    return { txHash: result.txHash };
  }

  /**
   * Give feedback
   */
  async giveFeedback(
    giverPrivateKey: string,
    feedback: FeedbackRequest
  ): Promise<{ txHash: string }> {
    const wallet = this.getWallet(giverPrivateKey);
    const client = await this.createClient(wallet);

    const result = await client.reputation.giveFeedback({
      agentId: BigInt(feedback.agentId),
      score: feedback.score,
      tag1: feedback.tag1,
      tag2: feedback.tag2,
      feedbackUri: feedback.feedbackUri,
      feedbackAuth: feedback.feedbackAuth,
    });

    return { txHash: result.txHash };
  }
}
