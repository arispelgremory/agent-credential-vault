# Identity API - ERC-8004 Agent Registration

This module provides API endpoints for registering and managing agents or MCP servers using the ERC-8004 standard on Hedera.

## Prerequisites

### Required Dependencies

Install the following packages:

```bash
npm install ethers
npm install @pinata/sdk
```

### ERC8004 SDK

The `@hedera-sandbox/erc8004-sdk` package is required. This is a local package from the `hedera-sandbox` workspace. 

**Option 1: If using a monorepo**
- Ensure the package is properly linked in your workspace
- The package should be accessible from `@hedera-sandbox/erc8004-sdk`

**Option 2: If using separate repositories**
- Install the SDK package locally or publish it to a private registry
- Link it using: `npm link @hedera-sandbox/erc8004-sdk`

### Environment Variables

Add these to your `.env` file:

```env
# Hedera Configuration
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_ACCOUNT_1=0.0.xxxxx
HEDERA_TESTNET_PRIVATE_KEY_1=your_private_key_here
HEDERA_CHAIN_ID=296

# Contract Addresses (optional, defaults provided)
IDENTITY_REGISTRY=0x4c74ebd72921d537159ed2053f46c12a7d8e5923
REPUTATION_REGISTRY=0xc565edcba77e3abeade40bfd6cf6bf583b3293e0
VALIDATION_REGISTRY=0x18df085d85c586e9241e0cd121ca422f571c2da6

# Pinata IPFS (optional, for metadata storage)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
```

## API Endpoints

### Agent Registration

- `POST /api/v1/identity/agent/register` - Register a new agent or MCP server
- `POST /api/v1/identity/agent/:agentId/uri` - Set agent URI
- `POST /api/v1/identity/agent/:agentId/metadata` - Set agent metadata
- `GET /api/v1/identity/agent/:agentId/metadata` - Get agent metadata
- `GET /api/v1/identity/agent/:agentId/owner` - Get agent owner

### HCS Standards

- `POST /api/v1/identity/agent/hcs10/broadcast` - Broadcast agent via HCS-10
- `POST /api/v1/identity/agent/hcs11/publish` - Publish profile via HCS-11

### Validation

- `POST /api/v1/identity/agent/validation/request` - Request validation
- `POST /api/v1/identity/agent/validation/response` - Submit validation response

### Reputation

- `POST /api/v1/identity/agent/feedback` - Give feedback/reputation

## Usage Examples

### Register an Agent

```bash
curl -X POST http://localhost:9487/api/v1/identity/agent/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Agent",
    "description": "A helpful agent",
    "endpoints": [
      {
        "name": "A2A",
        "endpoint": "http://localhost:4021/a2a/.well-known/agent-card.json",
        "version": "0.3.0"
      }
    ],
    "supportedTrust": ["reputation"],
    "ownerPrivateKey": "your_private_key_here"
  }'
```

### Get Agent Metadata

```bash
curl http://localhost:9487/api/v1/identity/agent/123/metadata?key=agentMetadata
```

## Authentication

All endpoints (except GET operations) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Notes

- The `ownerPrivateKey` can be provided in the request body or will default to `HEDERA_TESTNET_PRIVATE_KEY_1` from environment variables
- IPFS features require Pinata credentials to be configured
- All transactions are executed on Hedera Testnet by default

