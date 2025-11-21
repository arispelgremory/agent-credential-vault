# x402 Facilitator Server

This is a standalone Express server that implements the x402 facilitator endpoints for verifying and settling payments.

## Running the Facilitator

### Option 1: Using npm script (Recommended)

```bash
# Run once
npm run facilitator

# Run with auto-reload on file changes
npm run facilitator:dev
```

### Option 2: Using tsx directly

```bash
# From the backend directory
tsx src/x402/facilitator/index.ts
```

### Option 3: Using node (after building)

```bash
# Build first (if you have a build setup)
npm run build
node dist/x402/facilitator/index.js
```

## Environment Variables

The facilitator requires at least one of the following environment variables:

### For Hedera (Required for this project):
```env
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_ACCOUNT_ID=0.0.xxxxx
```

### Optional:
```env
PORT=3000  # Port to run the facilitator on (default: 3000)
EVM_PRIVATE_KEY=your_evm_private_key  # For EVM networks
SVM_PRIVATE_KEY=your_svm_private_key  # For Solana networks
SVM_RPC_URL=your_solana_rpc_url  # Custom Solana RPC URL
```

## Endpoints

- `GET /verify` - Get verify endpoint info
- `POST /verify` - Verify x402 payments
- `GET /settle` - Get settle endpoint info
- `POST /settle` - Settle x402 payments
- `GET /supported` - Get supported payment kinds

## Default Configuration

- **Port**: 3000 (or value from `PORT` env variable)
- **URL**: `http://localhost:3000`

The facilitator will be accessible at `http://localhost:3000` by default.

## Integration

The `call-facilitator.tool.ts` is configured to use `http://localhost:3000` by default. Make sure the facilitator server is running before calling the facilitator tool.
