import axios from "axios";
import dotenv from "dotenv";
import process from "node:process";

import { formatDate } from "../utils/time.ts";
import { logToFile } from "./logs.ts";

dotenv.config();

export const fetchNews = async (lastMinutes?: number) => {
  let timeQuery = "";
  if (lastMinutes) {
    const timeFrom = new Date(Date.now() - lastMinutes * 60000);
    const formattedTime = formatDate(timeFrom);
    timeQuery = `&time_from=${encodeURIComponent(formattedTime)}`;
  }

  try {
    logToFile("Receiving news");
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${timeQuery}&limit=1000&apikey=${process.env.NEWS_API}`
    );

    if (response.data) {
      const feed = response.data.feed; // Assuming the feed contains the news articles
      const summaries: string = feed
        .map((news: { summary: string }) => news.summary)
        .join("\n\n");
      const newsData = JSON.stringify(response.data, null, 2); // Stringify the news data
      return { newsData, summaries }; // Return both the news data and summaries
    }
  } catch (error) {
    logToFile(`Error fetching news: ${error.message}`);
  }
};
