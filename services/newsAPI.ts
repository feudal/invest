import axios from "axios";
import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

export const fetchNews = async () => {
  const lastHour = "20240929T2100";

  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&time_from=${lastHour}&apikey=${process.env.NEWS_API}`,
    );

    console.log({
      //   response,
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching news:", error.message);
  }
};
