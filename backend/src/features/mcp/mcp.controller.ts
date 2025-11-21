import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { ERC8004Client } from '@/erc8004/index.js';
import { EthersAdapter } from '@/erc8004/adapters/ethers.js';
import { IdentityRepository } from '@/features/identity/identity.repository.js';
import { Error as ErrorMessages } from '@/error/index.js';
import { db } from '@/db/index.js';
import { MCP, McpType } from './mcp.model.js';
import { eq, and, or, like, ilike, sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/util/get-user-from-request.js';

export type SearchMcpRequest = {
  prompt: string;
  limit?: number;
};

export type ValidateMcpRequest = {
  mcpId: string;
  agentId: string;
  validatorAddress: string;
  intent?: string;
  referenceUri?: string;
};

export type CallMcpRequest = {
  mcpId: string;
  toolName: string;
  arguments: Record<string, any>;
};

export type SearchAndCallMcpRequest = {
  prompt: string;
  autoCall?: boolean; // If true, automatically calls the tool after finding it
};

export class McpController {
  private identityRepository: IdentityRepository;
  private provider: ethers.JsonRpcProvider;
  private identityRegistry: string;
  private reputationRegistry: string;
  private validationRegistry: string;
  private chainId: number;

  constructor() {
    this.identityRepository = new IdentityRepository();

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
   * Normalize private key format for ethers.js
   * Handles different formats: with/without 0x prefix
   */
  private normalizePrivateKey(privateKey: string): string {
    if (!privateKey) {
      throw new Error('Private key is required');
    }

    // Remove whitespace
    let normalized = privateKey.trim();

    // If it starts with 0x, keep it; otherwise add it
    if (!normalized.startsWith('0x')) {
      normalized = '0x' + normalized;
    }

    // Validate length (should be 66 characters with 0x: 0x + 64 hex chars = 32 bytes)
    if (normalized.length !== 66) {
      throw new Error(`Invalid private key length: expected 64 hex characters (got ${normalized.length - 2} after 0x prefix)`);
    }

    // Validate hex format
    if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
      throw new Error('Invalid private key format: must be a valid hex string');
    }

    return normalized;
  }

  /**
   * Verify that the agent exists in the ERC-8004 Identity Registry
   * Checks if the agent is registered on-chain by querying the Identity Registry
   * @param mcp - MCP object containing agent information
   * @returns true if agent exists in registry, false otherwise
   */
  private async verifyAgentExists(mcp: McpType): Promise<{ exists: boolean; owner?: string; reason?: string }> {
    try {
      // Check if agentIdOnChain is valid (non-zero)
      if (!mcp.agentIdOnChain || mcp.agentIdOnChain === '0' || mcp.agentIdOnChain === '') {
        console.log('Agent verification failed: Invalid agentIdOnChain');
        return { exists: false, reason: 'Invalid agentIdOnChain' };
      }

      // Get platform private key for read-only operations
      const privateKey = process.env.PLATFORM_HEDERA_PRIVATE_KEY || process.env.DEFAULT_PRIVATE_KEY || process.env.HEDERA_TESTNET_PRIVATE_KEY_1;
      if (!privateKey) {
        console.warn('PLATFORM_HEDERA_PRIVATE_KEY or HEDERA_TESTNET_PRIVATE_KEY_1 not set, cannot verify agent');
        return { exists: false, reason: 'No private key configured for read operations' };
      }

      // Normalize the private key format
      const normalizedKey = this.normalizePrivateKey(privateKey);
      const wallet = this.getWallet(normalizedKey);
      const client = this.createERC8004Client(wallet);

      const agentId = BigInt(mcp.agentIdOnChain);

      try {
        // Try to get the owner of the agent from Identity Registry
        // If the agent doesn't exist, this will throw an error
        const owner = await client.identity.getOwner(agentId);
        
        console.log('Agent verification result:', {
          mcpId: mcp.mcpId,
          agentId: mcp.agentIdOnChain,
          owner,
          exists: true,
        });

        return { exists: true, owner };
      } catch (error: any) {
        // If getOwner fails, the agent doesn't exist in the registry
        console.warn('Agent not found in Identity Registry:', mcp.agentIdOnChain, error.message);
        return { exists: false, reason: `Agent not found in Identity Registry: ${error.message}` };
      }
    } catch (error: any) {
      console.error('Error verifying agent existence:', error);
      return { exists: false, reason: `Error checking agent: ${error.message}` };
    }
  }

  /**
   * Get owner private key from authenticated user
   */
  private async getOwnerPrivateKey(req: Request): Promise<string> {
    // For now, get from body. In production, get from JWT token
    const privateKey = (req.body as any).ownerPrivateKey || process.env.DEFAULT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Private key is required');
    }
    return privateKey;
  }

  /**
   * Search MCPs by prompt
   * Searches in name, description, and capabilities fields
   */
  async searchMcps(req: Request, res: Response) {
    try {
      const { prompt, limit = 10 }: SearchMcpRequest = req.body;

      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required',
          data: null,
        });
      }

      const searchPattern = `%${prompt.trim()}%`;
      console.log('Search pattern:', searchPattern);

      // Search in name, description, and capabilities fields
      const mcps = await db
        .select()
        .from(MCP)
        .where(
          and(
            eq(MCP.status, 'ACTIVE'),
            or(
              ilike(MCP.name, searchPattern),
              ilike(MCP.description, searchPattern),
              sql`COALESCE(${MCP.capabilities}, '') ILIKE ${searchPattern}`
            )
          )
        )
        .limit(limit);

      console.log('MCPs found:', mcps);

      return res.status(200).json({
        success: true,
        message: 'MCPs found successfully',
        data: {
          mcps: mcps.map((mcp) => ({
            mcpId: mcp.mcpId,
            agentId: mcp.agentId,
            agentIdOnChain: mcp.agentIdOnChain,
            name: mcp.name,
            description: mcp.description,
            endpoints: JSON.parse(mcp.endpoints),
            capabilities: mcp.capabilities ? JSON.parse(mcp.capabilities) : [],
            status: mcp.status,
            createdAt: mcp.createdAt,
            updatedAt: mcp.updatedAt,
          })),
          count: mcps.length,
        },
      });
    } catch (error: any) {
      console.error('Search MCPs error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Validate an MCP
   * Creates a validation request for the MCP's agent
   */
  async validateMcp(req: Request, res: Response) {
    try {
      const ownerPrivateKey = await this.getOwnerPrivateKey(req);
      const request: ValidateMcpRequest = req.body;

      if (!request.mcpId || !request.agentId || !request.validatorAddress) {
        return res.status(400).json({
          success: false,
          message: 'MCP ID, agent ID, and validator address are required',
          data: null,
        });
      }

      // Get MCP from database
      const [mcp] = await db
        .select()
        .from(MCP)
        .where(eq(MCP.mcpId, request.mcpId));

      if (!mcp) {
        return res.status(404).json({
          success: false,
          message: 'MCP not found',
          data: null,
        });
      }

      const wallet = this.getWallet(ownerPrivateKey);
      const client = this.createERC8004Client(wallet);
      const agentId = BigInt(request.agentId);

      // Build validation request payload
      const validationRequestPayload = {
        agentId: request.agentId,
        validator: request.validatorAddress.toLowerCase(),
        intent: request.intent || 'mcp-validation',
        reference: request.referenceUri || mcp.endpoints,
        mcpId: request.mcpId,
        mcpName: mcp.name,
        createdAt: new Date().toISOString(),
      };

      const requestPin = await this.identityRepository.pinJsonToIpfs(
        validationRequestPayload,
        `mcp-${request.mcpId}-validation-request`
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
        message: 'MCP validation request submitted successfully',
        data: {
          mcpId: request.mcpId,
          agentId: request.agentId,
          validatorAddress: request.validatorAddress,
          requestUri: requestPin.uri,
          requestHash,
          txHash: result.txHash,
        },
      });
    } catch (error: any) {
      console.error('Validate MCP error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Call an MCP tool
   * Makes an HTTP request to the MCP endpoint
   */
  async callMcp(req: Request, res: Response) {
    try {
      const request: CallMcpRequest = req.body;
      if (!request.mcpId || !request.toolName) {
        return res.status(400).json({
          success: false,
          message: 'MCP ID and tool name are required',
          data: null,
        });
      }

      // Get MCP from database
      const [mcp] = await db
        .select()
        .from(MCP)
        .where(eq(MCP.mcpId, request.mcpId));

      if (!mcp) {
        return res.status(404).json({
          success: false,
          message: 'MCP not found',
          data: null,
        });
      }

      if (mcp.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'MCP is not active',
          data: null,
        });
      }

      // Parse endpoints
      const endpoints = JSON.parse(mcp.endpoints);
      if (!Array.isArray(endpoints) || endpoints.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'MCP has no valid endpoints',
          data: null,
        });
      }

      // Use the first endpoint (or find the one matching the tool name)
      const endpoint = endpoints[0];
      const baseUrl = endpoint.url || endpoint;

      // Build the tool call URL
      const toolUrl = `${baseUrl}/tools/${request.toolName}`;

      // Make the API call
      const response = await fetch(toolUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arguments: request.arguments || {},
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          message: `MCP call failed: ${errorText}`,
          data: null,
        });
      }

      const result = await response.json();

      return res.status(200).json({
        success: true,
        message: 'MCP called successfully',
        data: {
          mcpId: request.mcpId,
          toolName: request.toolName,
          result,
        },
      });
    } catch (error: any) {
      console.error('Call MCP error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }

  /**
   * Parse prompt to extract intent and parameters
   */
  private parsePrompt(prompt: string): { toolName: string | null; arguments: Record<string, any> } {
    const lowerPrompt = prompt.toLowerCase();
    
    // Map intents to tool names
    const intentMap: Record<string, string> = {
      'check balance': 'check-balance',
      'check my balance': 'check-balance',
      'wallet balance': 'check-balance',
      'hedera balance': 'check-balance',
      'account balance': 'check-balance',
      'create wallet': 'create-wallet',
      'new wallet': 'create-wallet',
      'build transaction': 'build-transaction',
      'create transaction': 'build-transaction',
      'send transaction': 'send-transaction',
      'submit transaction': 'send-transaction',
    };

    // Find matching intent
    let toolName: string | null = null;
    for (const [intent, tool] of Object.entries(intentMap)) {
      if (lowerPrompt.includes(intent)) {
        toolName = tool;
        break;
      }
    }

    const arguments_: Record<string, any> = {};

    // Extract account ID (Hedera format: 0.0.xxxxx) for check-balance
    if (toolName === 'check-balance') {
      const accountIdMatch = prompt.match(/\b0\.0\.\d+\b/);
      if (accountIdMatch) {
        arguments_.accountId = accountIdMatch[0];
      }
      
      // Extract EVM address (0x...)
      const evmAddressMatch = prompt.match(/\b0x[a-fA-F0-9]{40}\b/);
      if (evmAddressMatch) {
        arguments_.accountId = evmAddressMatch[0];
      }
    }

    // Extract sender and recipient for transactions
    if (toolName === 'build-transaction' || toolName === 'send-transaction') {
      // Extract all account IDs from the prompt
      const accountIds = prompt.match(/\b0\.0\.\d+\b/g) || [];
      
      // Try to extract using "from X to Y" pattern
      const fromToMatch = prompt.match(/from\s+(\S+)\s+to\s+(\S+)/i);
      if (fromToMatch) {
        arguments_.senderAccountId = fromToMatch[1];
        arguments_.recipientAccountId = fromToMatch[2];
      } else if (accountIds.length >= 2) {
        // If we have at least 2 account IDs, use first as sender, second as recipient
        arguments_.senderAccountId = accountIds[0];
        arguments_.recipientAccountId = accountIds[1];
      } else {
        // Fallback to individual patterns
        const senderMatch = prompt.match(/from\s+(\S+)|sender[:\s]+(\S+)/i);
        const recipientMatch = prompt.match(/to\s+(\S+)|recipient[:\s]+(\S+)/i);
        
        if (senderMatch) {
          arguments_.senderAccountId = senderMatch[1] || senderMatch[2];
        }
        if (recipientMatch) {
          arguments_.recipientAccountId = recipientMatch[1] || recipientMatch[2];
        }
      }

      // Extract amount for transactions (supports HBAR and tinybars)
      // Look for patterns like "for 1 HBAR", "for 10 hbars", "amount: 5 HBAR", etc.
      // This avoids matching account IDs like 0.0.12345
      const amountPatterns = [
        /for\s+(\d+(?:\.\d+)?)\s*(?:hbar|hbars|tinybar|tinybars)?/i,
        /amount[:\s]+(\d+(?:\.\d+)?)\s*(?:hbar|hbars|tinybar|tinybars)?/i,
        /(\d+(?:\.\d+)?)\s+(?:hbar|hbars)\b/i,  // Match "X HBAR" or "X hbars" (not part of account ID)
        /transfer\s+(\d+(?:\.\d+)?)\s*(?:hbar|hbars|tinybar|tinybars)?/i,
      ];
      
      let amountMatch = null;
      for (const pattern of amountPatterns) {
        amountMatch = prompt.match(pattern);
        if (amountMatch) {
          break;
        }
      }
      
      if (amountMatch) {
        arguments_.amount = parseFloat(amountMatch[1]);
      } else {
        // Fallback: find numbers followed by HBAR/hbars that are NOT part of account IDs
        // We check that the number is not preceded by "0.0." pattern
        const allMatches = [...prompt.matchAll(/(\d+(?:\.\d+)?)\s*(?:hbar|hbars|tinybar|tinybars)?/gi)];
        for (const match of allMatches) {
          const numStr = match[1];
          const matchIndex = match.index!;
          // Check if this number is part of an account ID (0.0.xxxxx)
          const beforeMatch = prompt.substring(Math.max(0, matchIndex - 4), matchIndex);
          if (!beforeMatch.endsWith('0.0.')) {
            arguments_.amount = parseFloat(numStr);
            break;
          }
        }
      }
    }

    // Extract signed transaction for send-transaction
    if (toolName === 'send-transaction') {
      const signedTxMatch = prompt.match(/signed[:\s]+([A-Za-z0-9+/=]+)/i);
      if (signedTxMatch) {
        arguments_.signedTransaction = signedTxMatch[1];
      }
    }

    return { toolName, arguments: arguments_ };
  }

  /**
   * Call MCP tool via JSON-RPC
   */
  private async callMcpToolViaJsonRpc(
    endpoint: string,
    toolName: string,
    arguments_: Record<string, any>,
    userId?: string
  ): Promise<any> {
    const requestId = Date.now();

    // First, initialize the connection
    const initMessage = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'mcp-controller',
          version: '1.0.0',
        },
      },
    };

    try {
      // Send initialize (we'll ignore the response for now)
      const initResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initMessage),
      });
      
      if (!initResponse.ok) {
        console.warn('Initialize response not OK, continuing anyway');
      } else {
        const initResult = await initResponse.json();
        console.log('Initialize result:', initResult);
      }
    } catch (error) {
      console.warn('Initialize failed, continuing anyway:', error);
    }

    // Then call the tool
    const callMessage = {
      jsonrpc: '2.0',
      id: requestId + 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: {
          ...arguments_,
          ...(userId ? { userId } : {}), // Include userId in arguments if provided
        },
      },
    };

    console.log('Calling MCP tool:', JSON.stringify(callMessage, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCP call failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('MCP tool response:', JSON.stringify(result, null, 2));
    
    // Handle JSON-RPC response
    if (result.error) {
      throw new Error(result.error.message || 'MCP tool call failed');
    }

    // Extract the result content
    const toolResult = result.result || result;
    
    // If result has content array, extract the text
    if (toolResult.content && Array.isArray(toolResult.content)) {
      const textContent = toolResult.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');
      
      return {
        ...toolResult,
        text: textContent,
        raw: toolResult,
      };
    }

    return {
      ...toolResult,
      raw: result,
    };
  }

  /**
   * Search and automatically call MCP based on prompt
   * Parses the prompt, finds suitable MCP, and calls the appropriate tool
   */
  async searchAndCallMcp(req: Request, res: Response) {
    try {
      const { prompt, autoCall = true }: SearchAndCallMcpRequest = req.body;

      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required',
          data: null,
        });
      }

      // Get userId from request if available
      let userId = "USR_0b29aef7-b7fb-4196-b735-837714c1";
      // let userId: string | undefined;
      // try {
      //   const user = await getUserFromRequest(req);
      //   userId = user?.userId;
      // } catch (error) {
      //   console.log('No authenticated user found, will try to use credentials from database if available');
      // }

      // Parse prompt to extract intent
      const { toolName, arguments: extractedArgs } = this.parsePrompt(prompt);

      if (!toolName) {
        return res.status(400).json({
          success: false,
          message: 'Could not determine intent from prompt. Supported actions: check balance, create wallet, build transaction, send transaction',
          data: null,
        });
      }

      console.log('Parsed prompt:', { toolName, arguments: extractedArgs, userId });

      // Search for MCPs with the required capability
      const mcps = await db
        .select()
        .from(MCP)
        .where(
          and(
            eq(MCP.status, 'ACTIVE'),
            sql`COALESCE(${MCP.capabilities}, '') LIKE ${`%${toolName}%`}`
          )
        )
        .limit(5);

      if (mcps.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No MCP found with capability: ${toolName}`,
          data: null,
        });
      }

      // Use the first matching MCP
      const mcp = mcps[0];
      const endpoints = JSON.parse(mcp.endpoints);
      if (!Array.isArray(endpoints) || endpoints.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'MCP has no valid endpoints',
          data: null,
        });
      }

      const endpoint = endpoints[0];
      const endpointUrl = typeof endpoint === 'string' ? endpoint : endpoint.endpoint;

      // Verify agent exists in ERC-8004 Identity Registry before calling (if autoCall is true)
      if (autoCall) {
        const agentVerification = await this.verifyAgentExists(mcp);
        if (!agentVerification.exists) {
          return res.status(403).json({
            success: false,
            message: 'Agent not found in ERC-8004 Identity Registry. The MCP agent must be registered on-chain.',
            data: {
              mcpId: mcp.mcpId,
              mcpName: mcp.name,
              agentId: mcp.agentIdOnChain,
              reason: agentVerification.reason,
              requiresRegistration: true,
              registrationEndpoint: '/api/v1/identity/agent/register',
            },
          });
        }

        console.log('✅ MCP access granted - Agent verified in Identity Registry:', {
          mcpId: mcp.mcpId,
          agentId: mcp.agentIdOnChain,
          owner: agentVerification.owner,
          status: 'verified',
        });
      }

      if (!autoCall) {
        // Just return the found MCP without calling
        return res.status(200).json({
          success: true,
          message: 'MCP found',
          data: {
            mcpId: mcp.mcpId,
            mcpName: mcp.name,
            toolName,
            arguments: extractedArgs,
            endpoint: endpointUrl,
          },
        });
      }

      // Call the tool via JSON-RPC
      console.log('Calling MCP tool:', { endpoint: endpointUrl, toolName, arguments: extractedArgs, userId });
      
      const toolResult = await this.callMcpToolViaJsonRpc(
        endpointUrl,
        toolName,
        extractedArgs,
        userId
      );

      return res.status(200).json({
        success: true,
        message: 'MCP tool called successfully',
        data: {
          mcpId: mcp.mcpId,
          mcpName: mcp.name,
          toolName,
          arguments: extractedArgs,
          endpoint: endpointUrl,
          result: toolResult,
        },
      });
    } catch (error: any) {
      console.error('Search and call MCP error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        data: null,
        error: error.message,
      });
    }
  }
}

