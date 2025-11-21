import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { ERC8004Client } from '@/erc8004/index.js';
import { EthersAdapter } from '@/erc8004/adapters/ethers.js';
import { IdentityRepository } from './identity.repository.js';
import {
  RegisterAgentRequest,
  SetAgentUriRequest,
  SetAgentMetadataRequest,
  HCS10BroadcastRequest,
  HCS11ProfileRequest,
  HCS14UAIDRequest,
  ValidationRequest,
  ValidationResponse,
  FeedbackRequest,
  Agent,
  AgentType,
} from './identity.model.js';
import { Error as ErrorMessages } from '@/error/index.js';
import { AuthRepository } from '@/features/auth/auth.repository.js';
import { db } from '@/db/index.js';
import { MCP, McpType } from '@/features/mcp/mcp.model.js';
import { eq, desc } from 'drizzle-orm';

export class IdentityController {
  private identityRepository: IdentityRepository;
  private authRepository: AuthRepository;
  private provider: ethers.JsonRpcProvider;
  private identityRegistry: string;
  private reputationRegistry: string;
  private validationRegistry: string;
  private chainId: number;

  constructor() {
    this.identityRepository = new IdentityRepository();
    this.authRepository = new AuthRepository();

    // Initialize Hedera RPC provider
    const rpcUrl = process.env.HEDERA_RPC_URL;
    if (!rpcUrl) {
      throw new Error('HEDERA_RPC_URL environment variable is required');
    }
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Contract addresses
    this.identityRegistry = process.env.IDENTITY_REGISTRY || '0xfbbd1f90faf7eaf985c41b4a0aef3959d15b8072';
    this.reputationRegistry = process.env.REPUTATION_REGISTRY || '0x8a71cda97cb831ab30680e3b8ddb1625cc19c823';
    this.validationRegistry = process.env.VALIDATION_REGISTRY || '0xb9d0be53ab8d6713324e621d0a27e0df11fe4897';
    this.chainId = parseInt(process.env.CHAIN_ID || '296', 10);
  }

  /**
   * Create ERC8004Client instance for a wallet
   */
  private createERC8004Client(wallet: ethers.Wallet): ERC8004Client {
    const adapter = new EthersAdapter(this.provider, wallet);
    return new ERC8004Client({
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
   * Safely parse JSON stored as text in the database
   */
  private parseJsonField<T>(value: string | null | undefined, fallback: T): T {
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Normalize agent database records for API responses
   */
  private formatAgentRecord(agent: typeof Agent.$inferSelect) {
    return {
      ...agent,
      supportedTrust: this.parseJsonField<string[]>(agent.supportedTrust, []),
      endpoints: this.parseJsonField(agent.endpoints, [] as Array<Record<string, unknown>>),
      createdAt: agent.createdAt instanceof Date ? agent.createdAt.toISOString() : agent.createdAt,
      updatedAt: agent.updatedAt instanceof Date ? agent.updatedAt.toISOString() : agent.updatedAt,
    };
  }

  /**
   * Get owner private key from authenticated user
   */
  private async getOwnerPrivateKey(req: Request): Promise<string> {
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   throw new Error('Authorization token required');
    // }

    // const user = await this.authRepository.getUserDataByToken(token);
    // if (!user) {
    //   throw new Error('User not found');
    // }

    // In a real implementation, you'd retrieve the private key from secure storage
    // For now, we'll use an environment variable or request body
    const ownerPrivateKey = req.body.ownerPrivateKey || process.env.HEDERA_TESTNET_PRIVATE_KEY_1;
    if (!ownerPrivateKey) {
      throw new Error('Owner private key is required');
    }

    return ownerPrivateKey;
  }

  /**
   * Register a new agent or MCP server
   * 
   * @route POST /api/v1/identity/agent/register
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with agent registration details
   * 
   * @example
   * // Request body:
   * {
   *   "name": "Hello Agent",
   *   "description": "Agent description",
   *   "endpoints": [{"name": "A2A", "endpoint": "http://localhost:4021/a2a/.well-known/agent-card.json", "version": "0.3.0"}],
   *   "supportedTrust": ["reputation"],
   *   "tokenId": "0.0.7148856",
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async registerAgent(req: Request, res: Response) {
    try {
      // const ownerPrivateKey = await this.getOwnerPrivateKey(req);
      const ownerPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY_1;

      if (!ownerPrivateKey) {
        throw new Error('Owner private key is required');
      }

      const request: RegisterAgentRequest = req.body;

      // Validate required fields
      if (!request.name || !request.description || !request.endpoints || request.endpoints.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, and at least one endpoint are required',
          data: null,
        });
      }

      const wallet = this.getWallet(ownerPrivateKey);
      const client = this.createERC8004Client(wallet);

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

      // Build agent metadata
      const registrations = [
        {
          agentId: Number(agentId),
          agentRegistry: `eip155:${this.chainId}:${this.identityRegistry}`,
        },
      ];

      const agentMetadata = {
        type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
        name: request.name,
        description: request.description,
        endpoints: request.endpoints,
        registrations,
        supportedTrust: request.supportedTrust || ['reputation'],
      };

      let registrationUri: string | undefined;
      let metadataCid: string | undefined;

      try {
        // Use repository for IPFS operations (not part of ERC8004)
        const pinResult = await this.identityRepository.pinJsonToIpfs(
          agentMetadata,
          `agent-${agentId}-metadata`
        );
        registrationUri = pinResult.uri;
        metadataCid = pinResult.cid;

        // Set agent URI using ERC8004 SDK
        await client.identity.setAgentUri(agentId, registrationUri);

        // Set metadata using ERC8004 SDK
        await client.identity.setMetadata(
          agentId,
          'agentMetadata',
          JSON.stringify(agentMetadata)
        );
      } catch (error) {
        console.warn('⚠️  Failed to pin metadata to IPFS:', error);
      }

      // Save to database based on type
      const registrationType = request.type || 'Agent'; // Default to 'Agent' if not specified
      
      try {
        if (registrationType === 'Agent') {
          // Create Agent entry only
          const agentData: AgentType = {
            agentIdOnChain: agentId.toString(),
            name: request.name,
            description: request.description,
            owner: owner,
            registrationUri: registrationUri || null,
            metadataCid: metadataCid || null,
            txHash: result.txHash,
            tokenId: request.tokenId || null,
            supportedTrust: request.supportedTrust || ['reputation'],
            endpoints: JSON.stringify(request.endpoints),
            agentRegistry: this.identityRegistry,
            chainId: this.chainId,
            status: 'ACTIVE',
            createdBy: 'system', // TODO: Get from authenticated user
            updatedBy: 'system', // TODO: Get from authenticated user
          };

          await db.insert(Agent).values({
            agentIdOnChain: agentData.agentIdOnChain,
            name: agentData.name,
            description: agentData.description,
            owner: agentData.owner,
            registrationUri: agentData.registrationUri,
            metadataCid: agentData.metadataCid,
            txHash: agentData.txHash,
            tokenId: agentData.tokenId,
            supportedTrust: JSON.stringify(agentData.supportedTrust),
            endpoints: agentData.endpoints,
            agentRegistry: agentData.agentRegistry,
            chainId: agentData.chainId.toString(),
            status: agentData.status,
            createdBy: agentData.createdBy,
            updatedBy: agentData.updatedBy,
          }).returning();
        } else if (registrationType === 'MCP') {
          // Create both Agent (required for MCP foreign key) and MCP entries
          const agentData: AgentType = {
            agentIdOnChain: agentId.toString(),
            name: request.name,
            description: request.description,
            owner: owner,
            registrationUri: registrationUri || null,
            metadataCid: metadataCid || null,
            txHash: result.txHash,
            tokenId: request.tokenId || null,
            supportedTrust: request.supportedTrust || ['reputation'],
            endpoints: JSON.stringify(request.endpoints),
            agentRegistry: this.identityRegistry,
            chainId: this.chainId,
            status: 'ACTIVE',
            createdBy: 'system', // TODO: Get from authenticated user
            updatedBy: 'system', // TODO: Get from authenticated user
          };

          const [createdAgent] = await db.insert(Agent).values({
            agentIdOnChain: agentData.agentIdOnChain,
            name: agentData.name,
            description: agentData.description,
            owner: agentData.owner,
            registrationUri: agentData.registrationUri,
            metadataCid: agentData.metadataCid,
            txHash: agentData.txHash,
            tokenId: agentData.tokenId,
            supportedTrust: JSON.stringify(agentData.supportedTrust),
            endpoints: agentData.endpoints,
            agentRegistry: agentData.agentRegistry,
            chainId: agentData.chainId.toString(),
            status: agentData.status,
            createdBy: agentData.createdBy,
            updatedBy: agentData.updatedBy,
          }).returning();

          // Extract capabilities from endpoints
          const capabilities: string[] = [];
          request.endpoints.forEach((endpoint) => {
            if (endpoint.capabilities) {
              // If capabilities is an array, use it directly
              if (Array.isArray(endpoint.capabilities)) {
                capabilities.push(...endpoint.capabilities);
              } 
              // If capabilities is an object with a tools array
              else if (typeof endpoint.capabilities === 'object' && 'tools' in endpoint.capabilities && Array.isArray(endpoint.capabilities.tools)) {
                capabilities.push(...endpoint.capabilities.tools);
              }
              // If capabilities is an object, try to extract tool names
              else if (typeof endpoint.capabilities === 'object') {
                const toolNames = Object.keys(endpoint.capabilities);
                capabilities.push(...toolNames);
              }
            }
          });
          
          // Remove duplicates
          const uniqueCapabilities = [...new Set(capabilities)];

          // Save MCP entry
          const mcpData: McpType = {
            agentId: createdAgent.agentId,
            agentIdOnChain: agentId.toString(),
            name: request.name,
            description: request.description,
            endpoints: JSON.stringify(request.endpoints),
            capabilities: uniqueCapabilities.length > 0 ? JSON.stringify(uniqueCapabilities) : undefined,
            status: 'ACTIVE',
            createdBy: 'system', // TODO: Get from authenticated user
            updatedBy: 'system', // TODO: Get from authenticated user
          };

          await db.insert(MCP).values(mcpData);
        }
      } catch (dbError: any) {
        console.error('⚠️  Failed to save to database:', dbError);
        // Continue even if database save fails - the agent is already registered on-chain
      }

      return res.status(201).json({
        success: true,
        message: `${registrationType} registered successfully`,
        data: {
          agentId: agentId.toString(),
          txHash: result.txHash,
          owner,
          registrationUri,
          metadataCid,
          type: registrationType,
          registrations,
        },
      });
    } catch (error: any) {
      console.error('Register agent error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Set agent URI
   * 
   * @route POST /api/v1/identity/agent/:agentId/uri
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with transaction hash
   * 
   * @example
   * // Request body:
   * {
   *   "agentId": "1234567890",
   *   "uri": "ipfs://Qm...",
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async setAgentUri(req: Request, res: Response) {
    try {
      const ownerPrivateKey = await this.getOwnerPrivateKey(req);
      const request: SetAgentUriRequest = req.body;

      if (!request.agentId || !request.uri) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID and URI are required',
          data: null,
        });
      }

      const wallet = this.getWallet(ownerPrivateKey);
      const client = this.createERC8004Client(wallet);
      const result = await client.identity.setAgentUri(BigInt(request.agentId), request.uri);

      return res.status(200).json({
        success: true,
        message: 'Agent URI updated successfully',
        data: {
          agentId: request.agentId,
          uri: request.uri,
          txHash: result.txHash,
        },
      });
    } catch (error: any) {
      console.error('Set agent URI error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Set agent metadata
   * 
   * @route POST /api/v1/identity/agent/:agentId/metadata
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with transaction hash
   * 
   * @example
   * // Request body:
   * {
   *   "agentId": "1234567890",
   *   "key": "agentMetadata",
   *   "value": "{\"type\":\"https://eips.ethereum.org/EIPS/eip-8004#registration-v1\",...}",
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async setAgentMetadata(req: Request, res: Response) {
    try {
      const ownerPrivateKey = await this.getOwnerPrivateKey(req);
      const request: SetAgentMetadataRequest = req.body;

      if (!request.agentId || !request.key || !request.value) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID, key, and value are required',
          data: null,
        });
      }

      const wallet = this.getWallet(ownerPrivateKey);
      const client = this.createERC8004Client(wallet);
      const result = await client.identity.setMetadata(BigInt(request.agentId), request.key, request.value);

      return res.status(200).json({
        success: true,
        message: 'Agent metadata updated successfully',
        data: {
          agentId: request.agentId,
          key: request.key,
          value: request.value,
          txHash: result.txHash,
        },
      });
    } catch (error: any) {
      console.error('Set agent metadata error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Get agent metadata
   * 
   * @route GET /api/v1/identity/agent/:agentId/metadata
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with agent metadata
   * 
   * @example
   * // Query parameters:
   * ?key=agentMetadata
   */
  async getAgentMetadata(req: Request, res: Response) {
    try {
      const agentId = req.params.agentId;
      const key = req.query.key as string || 'agentMetadata';

      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID is required',
          data: null,
        });
      }

      // Use a default wallet for read operations
      const defaultPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY_1;
      if (!defaultPrivateKey) {
        throw new Error('HEDERA_TESTNET_PRIVATE_KEY_1 is required for read operations');
      }
      const wallet = this.getWallet(defaultPrivateKey);
      const client = this.createERC8004Client(wallet);
      const value = await client.identity.getMetadata(BigInt(agentId), key);

      return res.status(200).json({
        success: true,
        message: 'Agent metadata retrieved successfully',
        data: {
          agentId,
          key,
          value,
        },
      });
    } catch (error: any) {
      console.error('Get agent metadata error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Get agent owner
   * 
   * @route GET /api/v1/identity/agent/:agentId/owner
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with agent owner address
   */
  async getAgentOwner(req: Request, res: Response) {
    try {
      const agentId = req.params.agentId;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID is required',
          data: null,
        });
      }

      // Use a default wallet for read operations
      const defaultPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY_1;
      if (!defaultPrivateKey) {
        throw new Error('HEDERA_TESTNET_PRIVATE_KEY_1 is required for read operations');
      }
      const wallet = this.getWallet(defaultPrivateKey);
      const client = this.createERC8004Client(wallet);
      const owner = await client.identity.getOwner(BigInt(agentId));

      return res.status(200).json({
        success: true,
        message: 'Agent owner retrieved successfully',
        data: {
          agentId,
          owner,
        },
      });
    } catch (error: any) {
      console.error('Get agent owner error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Broadcast agent via HCS-10
   * 
   * @route POST /api/v1/identity/agent/hcs10/broadcast
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with HCS reference
   * 
   * @example
   * // Request body:
   * {
   *   "agentId": "1234567890",
   *   "topicId": "0.0.7135055",
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async broadcastHCS10(req: Request, res: Response) {
    try {
      const ownerPrivateKey = await this.getOwnerPrivateKey(req);
      const request: HCS10BroadcastRequest = req.body;

      if (!request.agentId || !request.topicId) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID and topic ID are required',
          data: null,
        });
      }

      const result = await this.identityRepository.broadcastHCS10(ownerPrivateKey, request);

      return res.status(200).json({
        success: true,
        message: 'HCS-10 broadcast successful',
        data: {
          agentId: request.agentId,
          topicId: request.topicId,
          reference: result.reference,
          txHash: result.txHash,
        },
      });
    } catch (error: any) {
      console.error('HCS-10 broadcast error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Publish profile via HCS-11
   * 
   * @route POST /api/v1/identity/agent/hcs11/publish
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with profile URI and HCS reference
   * 
   * @example
   * // Request body:
   * {
   *   "agentId": "1234567890",
   *   "topicId": "0.0.7135055",
   *   "displayName": "Hello Agent",
   *   "description": "Agent description",
   *   "maintainer": "0x...",
   *   "capabilities": ["greetings", "feedback"],
   *   "websites": ["http://localhost:4021/a2a/.well-known/agent-card.json"],
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async publishHCS11(req: Request, res: Response) {
    try {
      const ownerPrivateKey = await this.getOwnerPrivateKey(req);
      const request: HCS11ProfileRequest = req.body;

      if (!request.agentId || !request.topicId || !request.displayName || !request.description) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID, topic ID, display name, and description are required',
          data: null,
        });
      }

      const result = await this.identityRepository.publishHCS11(ownerPrivateKey, request);

      return res.status(200).json({
        success: true,
        message: 'HCS-11 profile published successfully',
        data: {
          agentId: request.agentId,
          topicId: request.topicId,
          reference: result.reference,
          profileUri: result.profileUri,
          profileCid: result.profileCid,
        },
      });
    } catch (error: any) {
      console.error('HCS-11 publish error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Request validation
   * 
   * @route POST /api/v1/identity/agent/validation/request
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with validation request details
   * 
   * @example
   * // Request body:
   * {
   *   "agentId": "1234567890",
   *   "validatorAddress": "0x...",
   *   "intent": "baseline-quality-check",
   *   "referenceUri": "ipfs://Qm...",
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async requestValidation(req: Request, res: Response) {
    try {
      const ownerPrivateKey = await this.getOwnerPrivateKey(req);
      const request: ValidationRequest = req.body;

      if (!request.agentId || !request.validatorAddress || !request.intent || !request.referenceUri) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID, validator address, intent, and reference URI are required',
          data: null,
        });
      }

      const wallet = this.getWallet(ownerPrivateKey);
      const client = this.createERC8004Client(wallet);
      const agentId = BigInt(request.agentId);

      // Build validation request payload and pin to IPFS
      const validationRequestPayload = {
        agentId: request.agentId,
        validator: request.validatorAddress.toLowerCase(),
        intent: request.intent,
        reference: request.referenceUri,
        createdAt: new Date().toISOString(),
      };

      const requestPin = await this.identityRepository.pinJsonToIpfs(
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

      return res.status(200).json({
        success: true,
        message: 'Validation request submitted successfully',
        data: {
          agentId: request.agentId,
          validatorAddress: request.validatorAddress,
          requestUri: requestPin.uri,
          requestHash,
          txHash: result.txHash,
        },
      });
    } catch (error: any) {
      console.error('Validation request error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Submit validation response
   * 
   * @route POST /api/v1/identity/agent/validation/response
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with transaction hash
   * 
   * @example
   * // Request body:
   * {
   *   "requestHash": "0x...",
   *   "response": 95,
   *   "responseUri": "ipfs://Qm...",
   *   "responseHash": "0x...",
   *   "tag": "validator:baseline-pass",
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async submitValidationResponse(req: Request, res: Response) {
    try {
      const validatorPrivateKey = await this.getOwnerPrivateKey(req);
      const response: ValidationResponse = req.body;

      if (!response.requestHash || !response.responseUri || !response.responseHash) {
        return res.status(400).json({
          success: false,
          message: 'Request hash, response URI, and response hash are required',
          data: null,
        });
      }

      const wallet = this.getWallet(validatorPrivateKey);
      const client = this.createERC8004Client(wallet);

      const result = await client.validation.validationResponse({
        requestHash: response.requestHash,
        response: response.response,
        responseUri: response.responseUri,
        responseHash: response.responseHash,
        tag: response.tag,
      });

      return res.status(200).json({
        success: true,
        message: 'Validation response submitted successfully',
        data: {
          requestHash: response.requestHash,
          response: response.response,
          txHash: result.txHash,
        },
      });
    } catch (error: any) {
      console.error('Validation response error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }
  /**
   * Give feedback
   * 
   * @route POST /api/v1/identity/agent/feedback
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} JSON response with transaction hash
   * 
   * @example
   * // Request body:
   * {
   *   "agentId": "1234567890",
   *   "score": 95,
   *   "tag1": "excellent",
   *   "tag2": "reliable",
   *   "feedbackUri": "hcs://0.0.7135055/12347",
   *   "feedbackAuth": "0x...",
   *   "ownerPrivateKey": "0x..."
   * }
   */
  async giveFeedback(req: Request, res: Response) {
    try {
      const giverPrivateKey = await this.getOwnerPrivateKey(req);
      const feedback: FeedbackRequest = req.body;

      if (!feedback.agentId || !feedback.score || !feedback.feedbackUri || !feedback.feedbackAuth) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID, score, feedback URI, and feedback auth are required',
          data: null,
        });
      }

      const wallet = this.getWallet(giverPrivateKey);
      const client = this.createERC8004Client(wallet);

      const result = await client.reputation.giveFeedback({
        agentId: BigInt(feedback.agentId),
        score: feedback.score,
        tag1: feedback.tag1,
        tag2: feedback.tag2,
        feedbackUri: feedback.feedbackUri,
        feedbackAuth: feedback.feedbackAuth,
      });

      return res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          agentId: feedback.agentId,
          score: feedback.score,
          txHash: result.txHash,
        },
      });
    } catch (error: any) {
      console.error('Give feedback error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  async getAgent(req: Request, res: Response) {
    try {
      const paramAgentId = req.params.agentId;
      const queryAgentId = Array.isArray(req.query.agentId) ? req.query.agentId[0] : (req.query.agentId as string | undefined);
      const agentId = paramAgentId || queryAgentId;

      if (agentId) {
        const [agent] = await db.select().from(Agent).where(eq(Agent.agentIdOnChain, agentId));
        if (!agent) {
          return res.status(404).json({
            success: false,
            message: `Agent with ID ${agentId} not found`,
            data: null,
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Agent retrieved successfully',
          data: this.formatAgentRecord(agent),
        });
      }

      const agents = await db.select().from(Agent).orderBy(desc(Agent.createdAt));
      const formattedAgents = agents.map((agent) => this.formatAgentRecord(agent));

      return res.status(200).json({
        success: true,
        message: 'Agents retrieved successfully',
        data: formattedAgents,
      });
    } catch (error: any) {
      console.error('Get agent error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

}
