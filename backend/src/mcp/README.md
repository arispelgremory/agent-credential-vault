# MCP (Model Context Protocol) Server - Hedera Integration

This MCP server provides tools for interacting with the Hedera network through a standardized protocol interface.

## API Endpoints

The MCP server exposes two main endpoints:

### 1. SSE Connection Endpoint
**GET** `/api/v1/mcp/sse`

Establishes a Server-Sent Events (SSE) connection for receiving messages from the server.

### 2. Messages Endpoint
**POST** `/api/v1/mcp/messages`

Sends JSON-RPC 2.0 formatted messages to the MCP server.

## Available Tools

1. **create-wallet** - Create a new Hedera account
2. **check-balance** - Check the balance of a Hedera account
3. **build-transaction** - Build a frozen (unsigned) transfer transaction
4. **send-transaction** - Submit a signed transaction to the Hedera network

## How to Use

### Option 1: Browser-Based Test Client

1. Start the server:
   ```bash
   pnpm run dev
   ```

2. Open the test client in your browser:
   ```
   http://localhost:9487/mcp-test-client.html
   ```

3. Click "Connect" to establish the SSE connection
4. Use the buttons to test each tool individually, or click "Run All Tests" for a complete workflow

### Option 2: Node.js Test Client

1. Install the required dependency:
   ```bash
   pnpm add eventsource
   ```

2. Start the server:
   ```bash
   pnpm run dev
   ```

3. Run the test client:
   ```bash
   tsx src/mcp/test-client.example.ts
   ```

## Message Format

All messages follow the JSON-RPC 2.0 specification:

### Initialize Connection
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}
```

### List Tools
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

### Call a Tool
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "create-wallet",
    "arguments": {}
  }
}
```

## Complete Workflow Example

Here's the complete workflow for creating a wallet, checking balance, building a transaction, signing it, and sending it:

### Step 1: Connect via SSE
Open an EventSource connection to `/api/v1/mcp/sse`

### Step 2: Initialize
Send an `initialize` message to establish the protocol version and capabilities.

### Step 3: List Tools
Send a `tools/list` message to see all available tools.

### Step 4: Create Wallet
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "create-wallet",
    "arguments": {}
  }
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"accountId\":\"0.0.123456\",\"evmAddress\":\"0x...\",\"privateKey\":\"302e...\"}"
    }]
  }
}
```

### Step 5: Check Balance
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "check-balance",
    "arguments": {
      "accountId": "0.0.123456"
    }
  }
}
```

### Step 6: Build Transaction
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "build-transaction",
    "arguments": {
      "senderAccountId": "0.0.123456",
      "recipientAccountId": "0.0.789012",
      "amount": 1000000
    }
  }
}
```

Response contains a base64-encoded frozen transaction that needs to be signed.

### Step 7: Sign Transaction (Client-Side)
Using the Hedera SDK on the client:
```typescript
import { TransferTransaction, PrivateKey } from '@hashgraph/sdk';

const frozenTxBytes = Buffer.from(base64Transaction, 'base64');
const frozenTx = TransferTransaction.fromBytes(frozenTxBytes);
const signedTx = await frozenTx.sign(privateKey);
const signedTxBase64 = Buffer.from(signedTx.toBytes()).toString('base64');
```

### Step 8: Send Transaction
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "send-transaction",
    "arguments": {
      "signedTransaction": "base64-encoded-signed-transaction"
    }
  }
}
```

## Security Notes

⚠️ **Important**: The `create-wallet` tool returns the private key in the response. In production:
- Never expose private keys in API responses
- Use secure key management systems
- Implement proper authentication and authorization
- Use HTTPS for all communications

## Error Handling

All errors follow the JSON-RPC 2.0 error format:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": "Additional error details"
  }
}
```

## Testing

See the test client examples:
- Browser: `public/mcp-test-client.html`
- Node.js: `src/mcp/test-client.example.ts`

