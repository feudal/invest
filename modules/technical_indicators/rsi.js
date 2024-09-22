import axios from "axios";
require("dotenv").config();

export const calculateRSI = async (symbol: string, window = 14) => {
  const url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=${window}&series_type=close&apikey=${process.env.API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data["Technical Analysis: RSI"];
    const latestDate = Object.keys(data)[0];
    return parseFloat(data[latestDate]["RSI"]);
  } catch (error) {
    console.error("Error fetching RSI:", error);
  }
};
