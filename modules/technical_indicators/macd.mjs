import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const calculateMACD = async (symbol) => {
  const baseUrl = `https://financialmodelingprep.com/api/v3/`;
  // const url = `https://financialmodelingprep.com/api/v3/technical_indicator/daily/${symbol}?apikey=${process.env.API_KEY}&indicator=macd`;
  //https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=2HEDyA0O6OtCkrUPJH2jDknO0RGkeNpB
  //https://financialmodelingprep.com/api/v3/technical_indicator/5min/AAPL?type=sma&period=10&apikey=2HEDyA0O6OtCkrUPJH2jDknO0RGkeNpB
  // const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${process.env.API_KEY}`;
  // const url = `${baseUrl}/profile/${symbol}?apikey=${process.env.API_KEY}`;
  const url = `${baseUrl}/profile/${symbol}?apikey=${process.env.API_KEY}`;

  try {
    const response = await axios.get(url);
    const macdData = response.data;

    // Assuming data is sorted by date, and we take the latest date
    const latestData = macdData[0]; // Get the most recent MACD data

    console.log({
      response,
      latestData,
      macdData,
    });

    const macd = parseFloat(latestData["macd"]);
    const signal = parseFloat(latestData["signal"]);
    const histogram = parseFloat(latestData["histogram"]);

    return { macd, signal, histogram };
  } catch (error) {
    console.error("Error fetching MACD data:", error);
    return null;
  }
};
