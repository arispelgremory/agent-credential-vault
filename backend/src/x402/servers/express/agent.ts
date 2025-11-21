import OpenAI from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateResponse = async (text: string) => {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: "Design an AI agent that, upon request, randomly selects a stock from the NASDAQ exchange and provides a brief, informative summary about the selected company. The summary should include at minimum the company’s full name, ticker symbol, primary business activity or sector, and one recent notable fact or piece of relevant information (such as a product launch, financial result, or news event).  \nThe agent must ensure randomness in the stock selection for each invocation and avoid choosing the same stock repeatedly in close succession.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text,
          },
        ],
      },
    ],
  });
  return response.output_text;
};
