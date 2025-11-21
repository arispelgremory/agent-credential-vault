![Metamynd logo](https://metamynd.gremoryyx.com/images/metamynd-full-logo.png)
# Metamynd.ai

## Project Description

AgentSafe is a secure access layer that allows AI agents to perform real-world actions without ever seeing user credentials. Users save their credentials into an encrypted offline Credential Vault which decrypts and executes API calls on demand through a verified MCP server. Every agent action is validated, policy-checked, and immutably logged on Hedera HCS. AgentSafe enables safe, auditable, revocable delegated access, empowering agents to schedule meetings, send emails, or manage data through a range of MCP servers while keeping credentials fully protected. Demo video: https://youtu.be/HJutd6kCk0w

Core Components:

Granite 4 (Mixture-of-Experts LLM) – intent parsing, tool-calling, reasoning
Model Context Protocol (MCP) – standardized agent → server capabilities
Credential Vault – encrypted credential execution environment
Hedera Hashgraph HCS-10 / HCS-14 for proof logs
ERC-8004 identity & capability registry

### Artifacts

X402 Payment:
Transaction ID: 

https://hashscan.io/testnet/transaction/1763739030.398532000

Chat Transcript:

https://hashscan.io/testnet/topic/0.0.7255202

https://hashscan.io/testnet/topic/0.0.7255214

---

## 🚀 Deployment & Setup Instructions

### Project Structure

```
agent-credential-vault/
├── frontend/   # NextJS application
├── backend/    # Express.js backend API
├── facilitator/      # Facilitator
├── docker-compose.yml  # Docker services configuration
└── README.md         # This file
```

### Getting Started
For getting started we recommend to use `docker compose` to start all the services.

#### Pre-requisite
- Docker Compose
- Git / Github Desktop
- A Hedera Testnet Account

### Steps
Make sure you have registered the hedera testnet account at https://portal.hedera.com/register as the operator account with hbar

1. Clone this project with
```
git clone git@github.com:arispelgremory/agent-credential-vault.git
```
2. Create a .env file frontend, backend and facilitator
#### Frontend
```
<!-- Assuming terminal is at agent-credential-vault/ -->
cd frontend
cp .env.example .env
```

Then you could modify the .env file where by default it will be:
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_HF_TOKEN=
NEXT_PUBLIC_INBOUND_TOPIC_ID=
NEXT_PUBLIC_OUTBOUND_TOPIC_ID=
```

#### Backend
```
<!-- Assuming terminal is at agent-credential-vault/frontend -->
cd ../backend
cp .env.example .env
```

Then you could modify the .env file where by default it will be:
```
# Runtime environment
NODE_ENV=production
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
JWT_ACCESS_TOKEN_EXPIRATION=30d
JWT_REFRESH_TOKEN_EXPIRATION=30d

# Database Configurations
POSTGRES_HOST=postgres # If uses the instance inside docker compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD_HERE
POSTGRES_PORT=5432
POSTGRES_DB=silsilat-db
DATABASE_URL=postgresql://postgres:yourpassword@postgres:5432/metamynd

# Hedera Configurations
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=
HEDERA_OPERATOR_KEY=
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_ACCOUNT_1=
HEDERA_TESTNET_PRIVATE_KEY_1=
ENCRYPTION_MASTER_KEY=
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
IPFS_ENCRYPTION_KEY=

# Hedera ERC-8004 registry
IDENTITY_REGISTRY=0xfbbd1f90faf7eaf985c41b4a0aef3959d15b8072
REPUTATION_REGISTRY=0x8a71cda97cb831ab30680e3b8ddb1625cc19c823
VALIDATION_REGISTRY=0xb9d0be53ab8d6713324e621d0a27e0df11fe4897

```
#### Facilitator
```
<!-- Assuming terminal is at agent-credential-vault/backend -->
cd ../facilitator
cp .env.example .env
```
Then you could modify the .env file where by default it will be:
```
HEDERA_OPERATOR_ID=0.0.xxx
HEDERA_OPERATOR_KEY=0xxx
PORT=3001
```

### How to Start metamynd
``` 
<!-- Assuming terminal is at agent-credential-vault/ -->
docker compose up -d
```

### Account created on initialization
**Default Account:**
```
Email: admin@mail.com
Password: admin123
```
