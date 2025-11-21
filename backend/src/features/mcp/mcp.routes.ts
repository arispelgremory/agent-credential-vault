/**
 * MCP Routes with x402 Payment Protocol Integration
 * 
 * x402 payment handling is done via MCP tools on the backend.
 * The frontend calls MCP tools which handle x402 payments using backend credentials.
 */

import { Router, Request, Response } from 'express';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMcpServer } from '@/mcp/server.js';
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { McpController } from './mcp.controller.js';
import authenticateJWT from '@/middleware/authenticate-jwt.js';
import { getUserFromRequest } from '@/util/get-user-from-request.js';
import { paymentMiddleware } from 'x402-express';

const router = Router();

// x402 payment configuration
const facilitatorUrl = (process.env.X402_FACILITATOR_URL || process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://x402.org/facilitator') as any;
// For Hedera, account IDs are strings in format "0.0.xxxxx"
// paymentMiddleware accepts Address (from viem) or Address (from @solana/kit) or Hedera account ID string
const payTo = (process.env.HEDERA_SYSTEM_ACCOUNT_ID || process.env.HEDERA_OPERATOR_ID || '0.0.0') as any;

// Validate payment configuration
if (!payTo || payTo === '0.0.0') {
  console.warn('⚠️  WARNING: HEDERA_SYSTEM_ACCOUNT_ID or HEDERA_OPERATOR_ID not set. x402 payments may not work correctly.');
}

console.log('🔧 x402 Payment Configuration:');
console.log(`  Facilitator URL: ${facilitatorUrl}`);
console.log(`  Pay To: ${payTo}`);
console.log(`  Network: hedera-testnet`);
console.log(`  Price: $0.001 per MCP message`);

// Apply x402 payment middleware to the messages endpoint
// This middleware will:
// 1. Intercept POST requests to /messages
// 2. Check for X-PAYMENT header
// 3. If missing, return HTTP 402 with payment requirements
// 4. If present, verify payment via facilitator
// 5. If valid, allow request to proceed
router.use(
  '/messages',
  paymentMiddleware(
    payTo,
    {
      'POST /api/v1/mcp/messages': {
        price: '$0.001', // Fixed price per MCP message
        network: 'testnet' as any, // Hedera testnet (type assertion needed for x402-express types)
        config: {
          description: 'Access to MCP (Model Context Protocol) tools and operations',
        },
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);
const mcpController = new McpController();
const mcpServer = createMcpServer();
let transport: SSEServerTransport | null = null;

// Map to store pending responses by request ID
const pendingResponses = new Map<number | string, {
    resolve: (message: JSONRPCMessage) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
}>();

// SSE endpoint for server-to-client streaming
router.get('/sse', (req: Request, res: Response) => {
    // Create a new SSE transport with the message endpoint set to "/api/v1/mcp/messages"
    transport = new SSEServerTransport("/api/v1/mcp/messages", res);
    console.log("SSE transport created");

    // Wrap the transport's send method to capture responses
    const originalSend = transport.send.bind(transport);
    transport.send = async (message: JSONRPCMessage) => {
        // If this is a response to a pending request, resolve it
        if ('id' in message && pendingResponses.has(message.id)) {
            const pending = pendingResponses.get(message.id);
            if (pending) {
                clearTimeout(pending.timeout);
                pendingResponses.delete(message.id);
                pending.resolve(message);
                return; // Don't send via SSE for direct POST responses
            }
        }
        // Otherwise, send via SSE as normal
        return originalSend(message);
    };

    // Connect the MCP server to this transport
    mcpServer.connect(transport).catch((err: unknown) => {
        console.error("Error connecting MCP server via SSE:", err);
    });
});

// Endpoint for client-to-server messages (HTTP POST)
router.post('/messages', async (req: Request, res: Response) => {
    try {
        const requestId = req.body.id;
        let responsePromise: Promise<JSONRPCMessage>;
        let tempTransport: Transport | null = null;

        if (transport) {
            // Use existing transport with response interception
            responsePromise = new Promise<JSONRPCMessage>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    pendingResponses.delete(requestId);
                    reject(new Error("Request timeout"));
                }, 30000);

                pendingResponses.set(requestId, { resolve, reject, timeout });
            });

            // Handle the message through the existing transport
            await transport.handleMessage(req.body, {});
        } else {
            // Create a simple in-memory transport for this request
            responsePromise = new Promise<JSONRPCMessage>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Request timeout"));
                }, 30000);

                // Create a proper transport implementation with all required methods
                class InMemoryTransport implements Transport {
                    private responseResolver: ((message: JSONRPCMessage) => void) | null = null;
                    private responseRejector: ((error: Error) => void) | null = null;
                    private connected: boolean = false;

                    constructor(resolve: (message: JSONRPCMessage) => void, reject: (error: Error) => void) {
                        this.responseResolver = resolve;
                        this.responseRejector = reject;
                    }

                    async start(): Promise<void> {
                        this.connected = true;
                    }

                    async close(): Promise<void> {
                        this.connected = false;
                    }

                    async send(message: JSONRPCMessage): Promise<void> {
                        // The server sends responses through this method
                        if ('id' in message && message.id === requestId) {
                            if (this.responseResolver) {
                                clearTimeout(timeout);
                                this.responseResolver(message);
                            }
                        }
                    }

                    onmessage?: ((message: JSONRPCMessage, context?: any) => void) | undefined;
                    onclose?: (() => void) | undefined;
                    onerror?: ((error: Error) => void) | undefined;
                }

                tempTransport = new InMemoryTransport(resolve, reject);

                // Process the request directly by calling tools
                // This is more reliable than trying to access server internals
                (async () => {
                    try {
                        const method = req.body.method;
                        
                        if (method === 'initialize') {
                            // Handle initialize
                            const response: JSONRPCMessage = {
                                jsonrpc: '2.0',
                                id: requestId,
                                result: {
                                    protocolVersion: '2024-11-05',
                                    capabilities: {
                                        tools: {},
                                    },
                                    serverInfo: {
                                        name: 'Hedera-MCP-Server',
                                        version: '1.0.0',
                                    },
                                },
                            };
                            clearTimeout(timeout);
                            resolve(response);
                            return;
                        } else if (method === 'tools/call' && req.body.params) {
                            // Directly call the tool
                            const toolName = req.body.params.name;
                            const toolArgs = req.body.params.arguments || {};
                            
                            // Get user from request if available (for authenticated requests)
                            // Also check if userId was passed in the arguments (from internal calls)
                            let userId: string | undefined = toolArgs.userId;
                            
                            if (!userId) {
                                try {
                                    const user = await getUserFromRequest(req);
                                    userId = user?.userId;
                                } catch (error) {
                                    // Not authenticated, continue without userId
                                    console.log('No authenticated user found, will try to use credentials from database if available');
                                }
                            }
                            
                            // Remove userId from toolArgs to avoid passing it twice
                            const { userId: _, ...cleanToolArgs } = toolArgs;
                            
                            // Import and call tools directly
                            const { checkBalanceTool } = await import('@/mcp/tools/check-balance.tool.js');
                            const { createWalletTool } = await import('@/mcp/tools/create-wallet.tool.js');
                            const { buildTransactionTool } = await import('@/mcp/tools/build-transaction.tool.js');
                            const { sendTransactionTool } = await import('@/mcp/tools/send-transaction.tool.js');
                            const { getPaymentRequirementsTool, transferHbarPaymentTool } = await import('@/mcp/tools/transfer-hbar-payment.tool.js');
                            const { processX402PaymentTool } = await import('@/mcp/tools/process-x402-payment.tool.js');
                            const { callFacilitatorTool } = await import('@/mcp/tools/call-facilitator.tool.js');
                            const { processX402PaymentFlowTool } = await import('@/mcp/tools/process-x402-payment-flow.tool.js');
                            const { saveMessageToTopicTool } = await import('@/mcp/tools/save-message-to-topic.tool.js');
                            
                            let result: any;
                            switch (toolName) {
                                case 'check-balance':
                                    result = await checkBalanceTool({ ...cleanToolArgs, userId });
                                    break;
                                case 'create-wallet':
                                    result = await createWalletTool({ userId });
                                    break;
                                case 'build-transaction':
                                    result = await buildTransactionTool({ ...cleanToolArgs, userId });
                                    break;
                                case 'send-transaction':
                                    result = await sendTransactionTool({ ...cleanToolArgs, userId });
                                    break;
                                case 'get-payment-requirements':
                                    // This tool doesn't need userId, it just returns payment requirements
                                    result = await getPaymentRequirementsTool({ ...cleanToolArgs });
                                    break;
                                case 'process-x402-payment':
                                    // This tool requires userId to fetch credentials
                                    if (!userId) {
                                        throw new Error('userId is required for process-x402-payment tool');
                                    }
                                    result = await processX402PaymentTool({ ...cleanToolArgs, userId });
                                    break;
                                case 'transfer-hbar-payment':
                                    // This tool requires userId to fetch credentials and uses x402-axios approach
                                    if (!userId) {
                                        throw new Error('userId is required for transfer-hbar-payment tool');
                                    }
                                    result = await transferHbarPaymentTool({ ...cleanToolArgs, userId });
                                    break;
                                case 'call-facilitator':
                                    // This tool requires userId to fetch credentials and calls facilitator
                                    if (!userId) {
                                        throw new Error('userId is required for call-facilitator tool');
                                    }
                                    result = await callFacilitatorTool({ ...cleanToolArgs, userId });
                                    break;
                                case 'process-x402-payment-flow':
                                    // This tool orchestrates the complete x402 payment flow
                                    if (!userId) {
                                        throw new Error('userId is required for process-x402-payment-flow tool');
                                    }
                                    result = await processX402PaymentFlowTool({ ...cleanToolArgs, userId });
                                    break;
                                case 'save-message-to-topic':
                                    // This tool saves conversation messages to a Hedera topic
                                    if (!userId) {
                                        throw new Error('userId is required for save-message-to-topic tool');
                                    }
                                    result = await saveMessageToTopicTool({ ...cleanToolArgs, userId });
                                    break;
                                default:
                                    throw new Error(`Unknown tool: ${toolName}`);
                            }
                            
                            // Format as JSON-RPC response
                            const response: JSONRPCMessage = {
                                jsonrpc: '2.0',
                                id: requestId,
                                result: result,
                            };
                            
                            clearTimeout(timeout);
                            resolve(response);
                            return;
                        } else if (method === 'tools/list') {
                            // Handle tools/list
                            const response: JSONRPCMessage = {
                                jsonrpc: '2.0',
                                id: requestId,
                                result: {
                                    tools: [
                                        {
                                            name: 'create-wallet',
                                            description: 'Create a new Hedera account',
                                        },
                                        {
                                            name: 'check-balance',
                                            description: 'Check the balance of a Hedera account',
                                        },
                                        {
                                            name: 'build-transaction',
                                            description: 'Build a transfer transaction',
                                        },
                                        {
                                            name: 'send-transaction',
                                            description: 'Send a signed transaction',
                                        },
                                        {
                                            name: 'get-payment-requirements',
                                            description: 'Get x402 payment requirements for MCP endpoints. Returns payment information that would be sent in HTTP 402 response.',
                                        },
                                        {
                                            name: 'process-x402-payment',
                                            description: 'Process x402 payment using backend credentials. Handles payment via facilitator and returns payment status.',
                                        },
                                        {
                                            name: 'transfer-hbar-payment',
                                            description: 'Transfer HBAR from user account to system account using x402-axios approach. Uses createSigner pattern similar to x402-axios example.',
                                        },
                                        {
                                            name: 'call-facilitator',
                                            description: 'Call x402 facilitator to verify or settle payments. Creates x-payment header with base64-encoded payload and calls facilitator endpoints.',
                                        },
                                        {
                                            name: 'process-x402-payment-flow',
                                            description: 'Complete x402 payment flow: Get payment requirements → Transfer HBAR → Verify/Settle with facilitator → Return transaction info. This is the recommended tool for processing x402 payments.',
                                        },
                                    ],
                                },
                            };
                            clearTimeout(timeout);
                            resolve(response);
                            return;
                        } else {
                            throw new Error(`Unsupported method: ${method}`);
                        }
                    } catch (err: any) {
                        clearTimeout(timeout);
                        reject(new Error(`Failed to process request: ${err.message}`));
                    }
                })();
            });
        }

        // Wait for the response
        const response = await responsePromise;
        
        console.log("Sending response:", JSON.stringify(response, null, 2));
        res.status(200).json(response);
    } catch (error) {
        console.error("Error handling message:", error);
        
        // Clean up pending response
        if (req.body.id && pendingResponses.has(req.body.id)) {
            const pending = pendingResponses.get(req.body.id);
            if (pending) {
                clearTimeout(pending.timeout);
                pendingResponses.delete(req.body.id);
            }
        }

        res.status(500).json({
            jsonrpc: "2.0",
            id: req.body.id || null,
            error: {
                code: -32000,
                message: "Internal error",
                data: error instanceof Error ? error.message : String(error)
            }
        });
    }
});

// MCP management endpoints
router.post('/search', authenticateJWT, (req, res) => mcpController.searchMcps(req, res));
router.post('/search-and-call', (req, res) => mcpController.searchAndCallMcp(req, res));
router.post('/validate', authenticateJWT, (req, res) => mcpController.validateMcp(req, res));
router.post('/call', authenticateJWT, (req, res) => mcpController.callMcp(req, res));

export default router;
