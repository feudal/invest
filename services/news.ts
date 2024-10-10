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
    const response = await axios.get(url);
    const newsData: News = response.data;

    if (newsData.feed.length > 0) {
      logToFile(`Received ${newsData?.feed?.length ?? 0} news data`);

      return newsData;
    } else {
      logToFile("No news data received");
    }
  } catch (error) {
    logToFile(`Error fetching news: ${error.message}`);
  }
};
