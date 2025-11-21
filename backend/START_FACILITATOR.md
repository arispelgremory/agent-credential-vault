# How to Start the x402 Facilitator Server

The facilitator server needs to be running before you can use the `call-facilitator` MCP tool.

## Quick Start

### Step 1: Open a Terminal

Open a **new terminal window** (keep your main backend server running in another terminal).

### Step 2: Navigate to Backend Directory

```bash
cd backend
```

### Step 3: Set Environment Variables (if not already set)

Make sure you have these in your `.env` file:

```env
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_ACCOUNT_ID=0.0.xxxxx
PORT=3000  # Optional, defaults to 3000
```

### Step 4: Start the Facilitator

```bash
# Option 1: Run once
npm run facilitator

# Option 2: Run with auto-reload (recommended for development)
npm run facilitator:dev
```

### Step 5: Verify It's Running

You should see:
```
Server listening at http://localhost:3000
```

You can also test it:
```bash
# Test the /supported endpoint
curl http://localhost:3000/supported

# Test the /verify endpoint info
curl http://localhost:3000/verify
```

## Running Both Servers

You need **two terminals**:

**Terminal 1 - Main Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Facilitator Server:**
```bash
cd backend
npm run facilitator:dev
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change the port:

```env
PORT=3001
```

Then update `call-facilitator.tool.ts` to use port 3001, or set:
```env
X402_FACILITATOR_URL=http://localhost:3001
```

### Missing Environment Variables

Make sure you have at least:
- `HEDERA_PRIVATE_KEY`
- `HEDERA_ACCOUNT_ID`

### Cannot Connect to Facilitator

1. Check if facilitator is running: `curl http://localhost:3000/supported`
2. Check the facilitator logs for errors
3. Verify the URL in `call-facilitator.tool.ts` matches your facilitator port

## Integration

Once the facilitator is running, your MCP tools can call it:
- `call-facilitator` tool will use `http://localhost:3000` by default
- `process-x402-payment-flow` tool will call the facilitator after transferring HBAR


