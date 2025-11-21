import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import type { AgentCard, Message, TextPart } from "@a2a-js/sdk";
import {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
  DefaultRequestHandler,
  InMemoryTaskStore,
} from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";
import express from "express";
import { paymentMiddleware, Resource, type SolanaAddress, type HederaAddress } from "x402-express";
import { generateResponse } from "agent";

config();

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.ADDRESS as `0x${string}` | SolanaAddress | HederaAddress;
const port = Number(process.env.PORT) || 4021;

if (!facilitatorUrl || !payTo) {
  console.error("Missing required environment variables");
  process.exit(1);
}

console.log("payTo", payTo);
console.log("facilitatorUrl", facilitatorUrl);

const helloAgentCard: AgentCard = {
  name: "Hello Agent",
  description: "A simple agent that says hello.",
  protocolVersion: "0.3.0",
  version: "0.1.0",
  url: `http://localhost:${port}/a2a`,
  skills: [{ id: "chat", name: "Chat", description: "Say hello", tags: ["chat"] }],
  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true,
  },
  defaultInputModes: ["text"],
  defaultOutputModes: ["text"],
};

class AlphaAgentExecutor implements AgentExecutor {
  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    // Invoke our AI Agent
    const text = await generateResponse((requestContext.userMessage.parts[0] as TextPart).text);
    const responseMessage: Message = {
      kind: "message",
      messageId: randomUUID(),
      role: "agent",
      parts: [{ kind: "text", text }],
      contextId: requestContext.contextId,
    };

    eventBus.publish(responseMessage);
    eventBus.finished();
  }

  cancelTask = async (): Promise<void> => {};
}

const agentExecutor = new AlphaAgentExecutor();
const requestHandler = new DefaultRequestHandler(
  helloAgentCard,
  new InMemoryTaskStore(),
  agentExecutor,
);
const appBuilder = new A2AExpressApp(requestHandler);

const app = express();

app.use(
  paymentMiddleware(
    payTo,
    {
      "POST /a2a": {
        price: "$0.001",
        network: "hedera-testnet",
        config: {
          description: "Access to the Hello Agent A2A endpoint",
        },
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);

appBuilder.setupRoutes(app, "/a2a");

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log("  POST /a2a - A2A Hello Agent behind x402");
});
