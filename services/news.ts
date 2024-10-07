import axios from "axios";
import dotenv from "dotenv";
import process from "node:process";

import { formatDate } from "../utils/time.ts";
import { logToFile } from "./logs.ts";
import { News } from "../types.ts";

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
    const response: News = await axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${timeQuery}&limit=1000&apikey=${process.env.NEWS_API}`
    );

    if (response) {
      const feeds = response.feed;
      const summaries = feeds.map((news) => news.summary).join("\n\n");
      const newsData = JSON.stringify(response.feed, null, 2);
      return { newsData, summaries };
    } else {
      logToFile("No news data received");
    }
  } catch (error) {
    logToFile(`Error fetching news: ${error.message}`);
  }
};
