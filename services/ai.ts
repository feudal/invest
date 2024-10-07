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
    "sector": "Healthcare",
    "summary": "Shares are trading higher due to increased trading volume and social media traction.",
    "recommendationBasedOnNews": "Potential for short-term momentum trading based on heightened market attention."
  },
    ...
  ]
  IN RESPONSE PUT ONLY THE OBJECT!
  PLEASE PROVIDE THE RESPONSE WITHOUT USING ANY CODE FORMATTING!
  THE NEWS MUST AFECT ONLY STOCKS
  `;

export const analysisNews = async (news?: string) => {
  if (!news) {
    logToFile("Don't received any news.");
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.PROJECT_ID,
  });

  try {
    // Log the incoming news
    logToFile(`News received: ${news}`);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "assistant", content: myContext },
        { role: "user", content: news },
      ],
      model: "gpt-4o",
    });

    const response = completion.choices[0].message.content;

    // Log the response from OpenAI
    logToFile(`Response generated.`);

    return response;
  } catch (error) {
    // Log any error that occurs during the process
    logToFile(`Error: ${error.message}`);
  }
};
