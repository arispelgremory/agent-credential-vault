import axios from "axios";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { withPaymentInterceptor, decodeXPaymentResponse, createSigner, type Hex } from "x402-axios";

config();

const privateKey = process.env.PRIVATE_KEY as Hex | string;
const hederaAccountId = process.env.HEDERA_ACCOUNT_ID as string;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /a2a

if (!baseURL || !privateKey || !endpointPath) {
  console.error("Missing required environment variables");
  process.exit(1);
}

/**
 * This example shows how to use the x402-axios package to make a request to a resource server that requires a payment.
 *
 * To run this example, you need to set the following environment variables:
 * - PRIVATE_KEY: The private key of the signer
 * - RESOURCE_SERVER_URL: The URL of the resource server
 * - ENDPOINT_PATH: The path of the endpoint to call on the resource server (e.g. /a2a)
 *
 */
async function main(): Promise<void> {
  const signer = await createSigner("hedera-testnet", privateKey, { accountId: hederaAccountId });

  const api = withPaymentInterceptor(
    axios.create({
      baseURL,
    }),
    signer,
  );

  const rpcRequest = {
    jsonrpc: "2.0" as const,
    id: uuidv4(),
    method: "message/send" as const,
    params: {
      message: {
        kind: "message" as const,
        messageId: uuidv4(),
        role: "user" as const,
        parts: [{ kind: "text" as const, text: "Tell me about a stock" }],
      },
    },
  };

  const response = await api.post(endpointPath, rpcRequest, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const rpcResponse = response.data as
    | { jsonrpc: "2.0"; id: string | number; result: { kind: string } }
    | { jsonrpc: "2.0"; id: string | number; error: { message: string; code: number } };

  if ("error" in rpcResponse) {
    console.error(`Agent returned error (${rpcResponse.error.code}): ${rpcResponse.error.message}`);
  } else {
    const { result } = rpcResponse;

    if (result.kind === "message") {
      const message = result as {
        kind: "message";
        parts: Array<{ kind: string; text?: string }>;
        contextId?: string;
      };

      const text = message.parts
        .filter(part => part.kind === "text" && typeof part.text === "string")
        .map(part => part.text)
        .join("\n");

      console.log(`Agent message (context ${message.contextId ?? "n/a"}):`);
      console.log(text || "<no text parts returned>");
    } else if (result.kind === "task") {
      const task = result as {
        kind: "task";
        id: string;
        status?: { state: string };
      };
      console.log(`Agent started task ${task.id} (status: ${task.status?.state ?? "unknown"})`);
    } else {
      console.log("Received unsupported result shape:", result);
    }
  }

  const paymentHeader = response.headers["x-payment-response"];
  if (paymentHeader) {
    const paymentResponse = decodeXPaymentResponse(paymentHeader);
    console.log(paymentResponse);
  } else {
    console.warn("No X-PAYMENT-RESPONSE header present on the response.");
  }
}

main();
