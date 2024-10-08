import dotenv from "dotenv";
import process from "node:process";
import OpenAI from "openai";
import { logToFile } from "./logs.ts";

dotenv.config();

const myContext = `Can you create an object that contains stock names, a brief summary for each, and your comments on potential trading opportunities based on the following news?

Example of the desired structure: 
[
  {
    "stock": "Clover Health Investments (CLOV)",
    "shortName": "CLOV",
    "founded: "2014, in San Francisco, United States / or no information"
    "sector": "Healthcare",
    "summary": "Shares are trading higher due to increased trading volume and social media traction.",
    "recommendationBasedOnNews": "Potential for short-term momentum trading based on heightened market attention."
  },
    ...
  ]
  IN RESPONSE PUT ONLY THE OBJECT!
  PLEASE PROVIDE THE RESPONSE WITHOUT USING ANY CODE FORMATTING!
  THE NEWS MUST AFECT ONLY USA STOCKS
  `;

const secondContext = `As a trader and programmer, I'm evaluating potential stock investments for strategic gains. 
Based on the provided stock information, which includes recent news updates and technical indicators, I aim to assess the suitability of investing in these stocks for both short-term and medium-term gains. 
Could you provide an analysis or recommendation on whether to buy or invest in these stocks, considering factors like recent news, moving averages, MACD, and RSI?`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.PROJECT_ID,
});

export const analyzeInfo = async (info: string, analyze: "first" | "final") => {
  if (!info) {
    logToFile("Don't received any news.");
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: analyze === "first" ? myContext : secondContext,
        },
        { role: "user", content: info },
      ],
      model: "gpt-4o",
    });

    const response = completion.choices[0].message.content;

    logToFile(response ? "Response generated." : "No response generated.");

    return response;
  } catch (error) {
    // Log any error that occurs during the process
    logToFile(`Error: ${error.message}`);
  }
};
