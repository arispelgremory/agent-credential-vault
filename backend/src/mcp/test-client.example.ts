/**
 * MCP Test Client Example
 * 
 * This example demonstrates how to interact with the MCP server via SSE transport.
 * 
 * Prerequisites:
 * 1. Install eventsource package: pnpm add eventsource
 * 2. Start the server: pnpm run dev
 * 3. Run this script: tsx src/mcp/test-client.example.ts
 * 
 * The client will:
 * - Connect to the MCP server via SSE
 * - List available tools
 * - Create a new Hedera wallet
 * - Check the balance of the new account
 * - Build a transaction
 * - Sign the transaction (client-side)
 * - Submit the signed transaction
 * - Display results
 */

import { TransferTransaction, PrivateKey } from '@hashgraph/sdk';

const BASE_URL = 'http://localhost:9487';
const SSE_URL = `${BASE_URL}/api/v1/mcp/sse`;
const MESSAGES_URL = `${BASE_URL}/api/v1/mcp/messages`;

// Note: Install eventsource package: pnpm add eventsource
// This will be loaded dynamically in the connect method

interface McpMessage {
    jsonrpc: '2.0';
    id?: string | number;
    method?: string;
    params?: any;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

class McpTestClient {
    private eventSource: any = null;
    private messageQueue: Map<string | number, (result: any) => void> = new Map();
    private messageIdCounter = 0;
    private EventSourceClass: any = null;

    /**
     * Load EventSource class dynamically
     */
    private async loadEventSource(): Promise<void> {
        if (this.EventSourceClass) return;
        
        try {
            // @ts-ignore - eventsource is an optional dependency, installed via: pnpm add eventsource
            const eventsourceModule = await import('eventsource');
            this.EventSourceClass = eventsourceModule.default || eventsourceModule.EventSource;
        } catch (error) {
            console.error('❌ Please install eventsource package: pnpm add eventsource');
            console.error('   This package is required for SSE connections in Node.js');
            throw new Error('eventsource package not found');
        }
    }

    /**
     * Connect to the MCP server via SSE
     */
    async connect(): Promise<void> {
        await this.loadEventSource();
        
        return new Promise((resolve, reject) => {
            console.log('🔌 Connecting to MCP server...');
            
            this.eventSource = new this.EventSourceClass(SSE_URL);
            
            this.eventSource.onopen = () => {
                console.log('✅ Connected to MCP server');
                resolve();
            };
            
            this.eventSource.onerror = (error: any) => {
                console.error('❌ SSE connection error:', error);
                reject(error);
            };
            
            this.eventSource.onmessage = (event: any) => {
                try {
                    const message: McpMessage = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };
        });
    }

    /**
     * Handle incoming messages from the server
     */
    private handleMessage(message: McpMessage): void {
        if (message.id !== undefined && this.messageQueue.has(message.id)) {
            const resolver = this.messageQueue.get(message.id)!;
            this.messageQueue.delete(message.id);
            
            if (message.error) {
                resolver({ error: message.error });
            } else {
                resolver({ result: message.result });
            }
        } else {
            // Handle notifications or other messages
            console.log('📨 Received message:', message);
        }
    }

    /**
     * Send a message to the MCP server
     */
    private async sendMessage(method: string, params?: any): Promise<any> {
        const id = ++this.messageIdCounter;
        const message: McpMessage = {
            jsonrpc: '2.0',
            id,
            method,
            params: params || {}
        };

        return new Promise((resolve, reject) => {
            this.messageQueue.set(id, (response: any) => {
                if (response.error) {
                    reject(new Error(response.error.message));
                } else {
                    resolve(response.result);
                }
            });

            fetch(MESSAGES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            }).catch((error: any) => {
                this.messageQueue.delete(id);
                reject(error);
            });
        });
    }

    /**
     * Initialize the MCP connection
     */
    async initialize(): Promise<void> {
        console.log('🚀 Initializing MCP connection...');
        await this.sendMessage('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
                name: 'hedera-mcp-test-client',
                version: '1.0.0'
            }
        });
        console.log('✅ MCP connection initialized');
    }

    /**
     * List available tools
     */
    async listTools(): Promise<any> {
        console.log('📋 Listing available tools...');
        const result = await this.sendMessage('tools/list');
        console.log('Available tools:', JSON.stringify(result, null, 2));
        return result;
    }

    /**
     * Call a tool
     */
    async callTool(name: string, arguments_: any): Promise<any> {
        console.log(`🔧 Calling tool: ${name}`, arguments_);
        const result = await this.sendMessage('tools/call', {
            name,
            arguments: arguments_
        });
        console.log(`✅ Tool ${name} result:`, JSON.stringify(result, null, 2));
        return result;
    }

    /**
     * Disconnect from the server
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            console.log('👋 Disconnected from MCP server');
        }
    }
}

/**
 * Main test function
 */
async function runTest() {
    const client = new McpTestClient();
    
    try {
        // Step 1: Connect to the MCP server
        await client.connect();
        await client.initialize();
        
        // Step 2: List available tools
        const toolsResult = await client.listTools();
        console.log('\n📦 Available tools:', toolsResult.tools?.map((t: any) => t.name) || []);
        
        // Step 3: Create a new Hedera wallet
        console.log('\n💰 Creating new Hedera wallet...');
        const createWalletResult = await client.callTool('create-wallet', {});
        const walletData = JSON.parse(createWalletResult.content[0].text);
        console.log('✅ Wallet created:', walletData);
        
        const newAccountId = walletData.accountId;
        const privateKey = PrivateKey.fromString(walletData.privateKey);
        
        // Step 4: Check the balance of the new account
        console.log('\n💵 Checking account balance...');
        await client.callTool('check-balance', {
            accountId: newAccountId
        });
        
        // Step 5: Build a transaction (transfer entire balance to operator)
        // Note: You'll need to set OPERATOR_ID in your .env file
        const operatorId = process.env.OPERATOR_ID || '0.0.123456'; // Replace with your operator ID
        console.log(`\n📝 Building transaction to transfer balance to operator (${operatorId})...`);
        
        // First, get the current balance to transfer
        const balanceResult = await client.callTool('check-balance', {
            accountId: newAccountId
        });
        const balanceText = balanceResult.content[0].text;
        const balanceMatch = balanceText.match(/(\d+)\s+tinybars/);
        const balance = balanceMatch ? parseInt(balanceMatch[1]) : 0;
        
        if (balance > 0) {
            const buildTxResult = await client.callTool('build-transaction', {
                senderAccountId: newAccountId,
                recipientAccountId: operatorId,
                amount: balance
            });
            
            const txData = JSON.parse(buildTxResult.content[0].text);
            console.log('✅ Transaction built:', txData.info);
            
            // Step 6: Sign the transaction on the client side
            console.log('\n✍️  Signing transaction...');
            const frozenTxBytes = Buffer.from(txData.transaction, 'base64');
            const frozenTx = TransferTransaction.fromBytes(frozenTxBytes);
            const signedTx = await frozenTx.sign(privateKey);
            const signedTxBytes = signedTx.toBytes();
            const signedTxBase64 = Buffer.from(signedTxBytes).toString('base64');
            console.log('✅ Transaction signed');
            
            // Step 7: Submit the signed transaction
            console.log('\n📤 Submitting signed transaction...');
            const sendTxResult = await client.callTool('send-transaction', {
                signedTransaction: signedTxBase64
            });
            console.log('✅ Transaction submitted:', sendTxResult.content[0].text);
        } else {
            console.log('⚠️  Account has zero balance, skipping transaction');
        }
        
        console.log('\n✅ Test completed successfully!');
        
    } catch (error: any) {
        console.error('❌ Test failed:', error);
    } finally {
        client.disconnect();
        process.exit(0);
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTest();
}

export { McpTestClient, runTest };
