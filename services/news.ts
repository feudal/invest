import axios from "axios";
import dotenv from "dotenv";
import process from "node:process";

import { News } from "../types.ts";
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
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${timeQuery}&limit=1000&apikey=${process.env.NEWS_API}`;
    logToFile("Receiving news from: " + url);
    const response: News = await axios.get(url);

    if (response.feed.length > 0) {
      logToFile(`Received ${response.feed.length} news data`);

      return response;
    } else {
      logToFile("No news data received");
    }
  } catch (error) {
    logToFile(`Error fetching news: ${error.message}`);
  }
};
