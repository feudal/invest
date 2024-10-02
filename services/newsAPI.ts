import axios from "axios";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { formatDate } from "../utils/time.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fetchNews = async (lastMinutes?: number) => {
  let timeQuery = "";
  if (lastMinutes) {
    const timeFrom = new Date(Date.now() - lastMinutes * 60000);
    const formattedTime = formatDate(timeFrom);
    timeQuery = `&time_from=${encodeURIComponent(formattedTime)}`;
  }

  console.log({
    url: `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${timeQuery}&limit=1000&apikey=${process.env.NEWS_API}`,
  });

  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${timeQuery}&limit=1000&apikey=${process.env.NEWS_API}`
    );

    if (response.data) {
      const targetPath = path.join(
        __dirname,
        `../data/news/${new Date().toISOString()}.json`
      );
      fs.writeFileSync(targetPath, JSON.stringify(response.data, null, 2));
      console.log(`Data stored in ${targetPath}`);
    }
  } catch (error) {
    console.error("Error fetching news:", error.message);
  }
};
