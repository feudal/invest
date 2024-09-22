import axios from "axios";
require("dotenv").config();

export const calculateMovingAverage = async (symbol, window = 50) => {
  const url = `https://www.alphavantage.co/query?function=SMA&symbol=${symbol}&interval=daily&time_period=${window}&series_type=close&apikey=${process.env.API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data["Technical Analysis: SMA"];
    const latestDate = Object.keys(data)[0];
    return parseFloat(data[latestDate]["SMA"]);
  } catch (error) {
    console.error("Error fetching Moving Average:", error);
  }
};
