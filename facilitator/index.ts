/* eslint-env node */
import { config } from "dotenv";
import express, { Request, Response } from "express";
import { z } from "zod";
import { Client, TransactionId, TransactionReceiptQuery } from "@hashgraph/sdk";

// Simplified types and schemas (not using x402 package)
const PaymentRequirementsSchema = z.object({
  scheme: z.string(),
  network: z.string(),
  maxAmountRequired: z.string(),
  resource: z.string(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  payTo: z.string(),
  maxTimeoutSeconds: z.number().optional(),
  asset: z.string().nullable().optional(),
  outputSchema: z.any().optional(),
  extra: z.record(z.string(), z.any()).optional(),
});

const PaymentPayloadSchema = z.object({
  network: z.string(),
  accountId: z.string(),
  amount: z.string(),
  token: z.string(),
  nonce: z.string(),
  sessionId: z.string(),
  metadata: z.record(z.string(), z.any()),
  signature: z.string(),
});

type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;
type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;

// Verify function - checks if payment transaction exists and is valid on Hedera
async function verify(
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<{
  valid: boolean;
  transactionId?: string;
  status?: string;
  proof?: {
    transactionId: string;
    status: string;
    network: string;
    timestamp: string;
  };
  error?: string;
}> {
  // Basic validation: check that payload matches requirements
  if (paymentPayload.network !== paymentRequirements.network) {
    return {
      valid: false,
      error: `Network mismatch: payload has ${paymentPayload.network}, requirements expect ${paymentRequirements.network}`
    };
  }
  
  if (!paymentPayload.signature || paymentPayload.signature === '') {
    return {
      valid: false,
      error: "Payment signature is missing"
    };
  }

  // Get transaction ID from metadata
  const transactionIdString = paymentPayload.metadata?.transactionId;
  if (!transactionIdString || typeof transactionIdString !== 'string') {
    return {
      valid: false,
      error: "Transaction ID not found in payment payload metadata"
    };
  }

  // Verify transaction on Hedera network
  try {
    // Parse transaction ID
    const transactionId = TransactionId.fromString(transactionIdString);
    
    // Get Hedera client for the network
    // Hedera SDK expects: 'testnet', 'mainnet', or 'previewnet'
    let network = paymentPayload.network;
    if (network.startsWith('hedera-')) {
      network = network.replace('hedera-', '');
    }
    
    const hederaClient = Client.forName(network);
    
    // Query transaction receipt to verify it exists and check status
    const receiptQuery = new TransactionReceiptQuery()
      .setTransactionId(transactionId);
    
    const receipt = await receiptQuery.execute(hederaClient);
    const status = receipt.status.toString();
    
    // Check if transaction was successful
    const isValid = receipt.status.toString() === 'SUCCESS';
    
    // Get transaction proof (always includes timestamp)
    const proof: {
      transactionId: string;
      status: string;
      network: string;
      timestamp: string;
    } = {
      transactionId: transactionIdString,
      status: status,
      network: paymentPayload.network,
      timestamp: new Date().toISOString()
    };

    await hederaClient.close();

    return {
      valid: isValid,
      transactionId: transactionIdString,
      status: status,
      proof: proof,
      error: isValid ? undefined : `Transaction status: ${status}`
    };
  } catch (error: any) {
    console.error('Error verifying transaction on Hedera:', error);
    return {
      valid: false,
      error: `Failed to verify transaction on Hedera: ${error.message || error.toString()}`
    };
  }
}

// Settle function - verifies payment and returns settlement result
async function settle(
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<{
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
  proof?: {
    transactionId: string;
    status: string;
    network: string;
    timestamp: string;
  };
  error?: string;
}> {
  // First verify the payment transaction on Hedera
  const verification = await verify(paymentPayload, paymentRequirements);
  
  if (!verification.valid) {
    return {
      success: false,
      message: "Payment verification failed",
      error: verification.error || "Transaction verification failed",
      proof: verification.proof
    };
  }
  
  // If verification passed, settlement is successful
  // The transaction is already on-chain, so settlement is just confirming it
  return {
    success: true,
    transactionId: verification.transactionId,
    status: verification.status,
    message: "Payment settled successfully",
    proof: verification.proof
  };
}

// Network support constants
const SupportedEVMNetworks = ["base-sepolia", "ethereum-sepolia"];
const SupportedSVMNetworks = ["solana-devnet", "solana-mainnet"];
const SupportedHederaNetworks = ["hedera-testnet", "hedera-mainnet", "hedera-previewnet"];

type SupportedPaymentKind = {
  x402Version: number;
  scheme: string;
  network: string;
  extra?: {
    feePayer?: string;
    [key: string]: any;
  };
};

config();

const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || "";
const SVM_PRIVATE_KEY = process.env.SVM_PRIVATE_KEY || "";
const SVM_RPC_URL = process.env.SVM_RPC_URL || "";
const HEDERA_PRIVATE_KEY = process.env.HEDERA_OPERATOR_KEY || "";
const HEDERA_ACCOUNT_ID = process.env.HEDERA_OPERATOR_ID || "";
console.log("HEDERA_OPERATOR_ID: ", HEDERA_ACCOUNT_ID || "not found");

if (!EVM_PRIVATE_KEY && !SVM_PRIVATE_KEY && (!HEDERA_PRIVATE_KEY || !HEDERA_ACCOUNT_ID)) {
  console.error("Missing required environment variables");
  console.error(
    "Provide at least one of: EVM_PRIVATE_KEY, SVM_PRIVATE_KEY, or HEDERA_PRIVATE_KEY (with HEDERA_ACCOUNT_ID)",
  );
  process.exit(1);
}

// Validate Hedera configuration
if (HEDERA_PRIVATE_KEY && !HEDERA_ACCOUNT_ID) {
  console.error("HEDERA_ACCOUNT_ID is required when HEDERA_PRIVATE_KEY is provided");
  process.exit(1);
}

// No x402 config needed for simplified implementation

const app = express();

// Configure express to parse JSON bodies
app.use(express.json());

type VerifyRequest = {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
};

type SettleRequest = {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
};

app.get("/facilitator/verify", (req: Request, res: Response) => {
  res.json({
    endpoint: "/facilitator/verify",
    description: "POST to verify x402 payments",
    body: {
      paymentPayload: "PaymentPayload",
      paymentRequirements: "PaymentRequirements",
    },
  });
});

app.post("/facilitator/verify", async (req: Request, res: Response) => {
  try {
    const body: VerifyRequest = req.body;
    const paymentRequirements = PaymentRequirementsSchema.parse(body.paymentRequirements);
    const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);
    console.log("paymentPayload", paymentPayload);
    // Verify payment - checks transaction on Hedera network
    const verification = await verify(paymentPayload, paymentRequirements);
    res.json(verification);
  } catch (error) {
    console.error("error", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

app.get("/facilitator/settle", (req: Request, res: Response) => {
  res.json({
    endpoint: "/facilitator/settle",
    description: "POST to settle x402 payments",
    body: {
      paymentPayload: "PaymentPayload",
      paymentRequirements: "PaymentRequirements",
    },
  });
});

app.get("/facilitator/supported", async (req: Request, res: Response) => {
  let kinds: SupportedPaymentKind[] = [];

  // evm
  if (EVM_PRIVATE_KEY) {
    kinds.push({
      x402Version: 1,
      scheme: "exact",
      network: "base-sepolia",
    });
  }

  // svm
  if (SVM_PRIVATE_KEY) {
    // Use dummy signer (not using createSigner due to network support issues)
    const feePayer = "dummy-svm-address";

    kinds.push({
      x402Version: 1,
      scheme: "exact",
      network: "solana-devnet",
      extra: {
        feePayer,
      },
    });
  }

  // hedera
  if (HEDERA_PRIVATE_KEY && HEDERA_ACCOUNT_ID) {
    // Use account ID directly (not using createSigner due to network support issues)
    const feePayer = HEDERA_ACCOUNT_ID;

    kinds.push({
      x402Version: 1,
      scheme: "exact",
      network: "hedera-testnet",
      extra: {
        feePayer,
      },
    });

    // Also support mainnet if available
    kinds.push({
      x402Version: 1,
      scheme: "exact",
      network: "hedera-mainnet",
      extra: {
        feePayer,
      },
    });
  }
  res.json({
    kinds,
  });
});

app.post("/facilitator/settle", async (req: Request, res: Response) => {
  try {
    const body: SettleRequest = req.body;
    const paymentRequirements = PaymentRequirementsSchema.parse(body.paymentRequirements);
    const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);

    // Settle payment (simplified implementation)
    const response = await settle(paymentPayload, paymentRequirements);
    res.json(response);
  } catch (error) {
    console.error("error", error);
    res.status(400).json({ error: `Invalid request: ${error}` });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server listening at http://localhost:${process.env.FACILITATOR_PORT || 3001}`);
});
