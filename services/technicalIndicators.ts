import yahooFinance from "yahoo-finance2";

import { Quote, TradingOpportunity } from "../types.ts";
import { logToFile } from "./logs.ts";

const getChartData = async (ticker: string, period: number) => {
  try {
    const data = await yahooFinance.chart(ticker, {
      period1: new Date(new Date().setDate(new Date().getDate() - period)),
      period2: new Date(),
      interval: "1d",
    });

    return data;
  } catch (error) {
    logToFile(error);
    throw new Error(`Failed to retrieve chart data for ticker: ${ticker}`);
  }
};

/**
 * Function to get the moving average from provided chart data.
 * @param {Array<Quote>} quotes - The array of quote data.
 * @param {number} period - The period over which to calculate the moving average. Common periods are 10, 50, and 200 days.
 * @returns {number} - The moving average.
 */
const getMovingAverage = (quotes: Quote[], period: number): number => {
  const data = quotes.slice(-period);

  const closePrices = data
    .map((item: Quote) => item.close)
    .filter((close): close is number => close !== null);

  const movingAverage =
    closePrices.reduce((a: number, b: number) => a + b, 0) / closePrices.length;

  return movingAverage;
};

const getEMA = (closePrices: number[], period: number) => {
  const k = 2 / (period + 1);
  let ema = closePrices[0];

  for (let i = 1; i < closePrices.length; i++) {
    ema = closePrices[i] * k + ema * (1 - k);
  }

  return ema;
};

/**
 * Retrieves the Moving Average Convergence Divergence (MACD) for a given stock data.
 *
 * @param {Array<Quote>} quotes - The array of quote data.
 * @returns {number | undefined} - The MACD value or undefined if an error occurs.
 *
 * @throws Will log an error to a file if the calculation fails.
 */
const getMACD = (quotes: Quote[]): number | undefined => {
  try {
    const closePrices = quotes
      .map((item: Quote) => item.close)
      .filter((close): close is number => close !== null);

    const shortTermEMA = getEMA(closePrices, 12);
    const longTermEMA = getEMA(closePrices, 26);

    const MACD = shortTermEMA - longTermEMA;

    return MACD;
  } catch (error) {
    logToFile(error);
  }
};

const getRSI = (quotes: Quote[]): number | undefined => {
  try {
    const period = 14; // Define the period for RSI calculation

    const closePrices = quotes
      .map((item: Quote) => item.close)
      .filter((close): close is number => close !== null);

    let gain = 0;
    let loss = 0;

    for (let i = 1; i <= period; i++) {
      const difference = closePrices[i] - closePrices[i - 1];

      if (difference > 0) {
        gain += difference;
      } else {
        loss += Math.abs(difference);
      }
    }

    gain /= period;
    loss /= period;

    for (let i = period + 1; i < closePrices.length; i++) {
      const difference = closePrices[i] - closePrices[i - 1];

      if (difference > 0) {
        gain = (gain * (period - 1) + difference) / period;
      } else {
        loss = (loss * (period - 1) + Math.abs(difference)) / period;
      }
    }

    const RS = gain / loss;
    const RSI = 100 - 100 / (1 + RS);

    return RSI;
  } catch (error) {
    logToFile(error);
  }
};

const getAverageVolume = (quotes: Quote[], period: number): number => {
  const data = quotes.slice(-period);

  const volumes = data
    .map((item: Quote) => item.volume)
    .filter((volume): volume is number => volume !== null);

  if (volumes.length === 0) {
    throw new Error("No volume data available to calculate average volume");
  }

  const averageVolume =
    volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;

  return averageVolume;
};

/**
 * Retrieves technical indicators for a given stock ticker.
 *
 * @param {string} ticker - The stock ticker symbol.
 * @returns {Promise<{
 *   ticker: string;
 *   shortMovingAverage: number[];
 *   mediumMovingAverage: number[];
 *   longMovingAverage: number[];
 *   macd: number[];
 *   rsi: number[];
 * }>} An object containing the stock ticker and its technical indicators.
 * @throws Will throw an error if the technical indicators cannot be retrieved.
 */
export const getTechnicalIndicators = async (ticker: string) => {
  try {
    const period = 200; // Ensure we have enough data for long-term indicators
    const chartData = await getChartData(ticker, period);

    const quotes = chartData.quotes as Quote[];

    const shortMovingAverage = getMovingAverage(quotes, 10);
    const mediumMovingAverage = getMovingAverage(quotes, 50);
    const longMovingAverage = getMovingAverage(quotes, 200);
    const macd = getMACD(quotes);
    const rsi = getRSI(quotes);
    const averageVolume = getAverageVolume(quotes, 10);

    return {
      ticker,
      shortMovingAverage,
      mediumMovingAverage,
      longMovingAverage,
      macd,
      rsi,
      averageVolume,
    };
  } catch (error) {
    logToFile(error);
    throw new Error("Failed to retrieve technical indicators");
  }
};

const getFundamentalData = async (ticker: string) => {
  try {
    const quoteSummary = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "financialData", "defaultKeyStatistics"],
    });

    const { summaryDetail, financialData, defaultKeyStatistics } = quoteSummary;

    const peRatio = summaryDetail?.trailingPE || 0;
    const eps = defaultKeyStatistics?.trailingEps || 0;
    const revenueGrowth = financialData?.revenueGrowth || 0;
    const debtToEquity = financialData?.debtToEquity || 0;
    const roe = financialData?.returnOnEquity || 0;

    return {
      peRatio,
      eps,
      revenueGrowth,
      debtToEquity,
      roe,
    };
  } catch (error) {
    logToFile(error);
    throw new Error(
      `Failed to retrieve fundamental data for ticker: ${ticker}`
    );
  }
};

export async function addTechnicalAndFundamentalIndicators(
  stocks: string[],
  tradingOpportunities: TradingOpportunity[]
): Promise<(TradingOpportunity | null)[]> {
  if (stocks.length === 0) {
    return [];
  }

  return Promise.all(
    stocks.map(async (stock) => {
      const {
        shortMovingAverage,
        mediumMovingAverage,
        longMovingAverage,
        macd,
        rsi,
        averageVolume,
      } = await getTechnicalIndicators(stock);

      const { peRatio, eps, revenueGrowth, debtToEquity, roe } =
        await getFundamentalData(stock);

      const opportunity = tradingOpportunities.find(
        (opportunity) => opportunity.shortName === stock
      );

      if (opportunity) {
        opportunity.technicalIndicators = {
          shortMovingAverage,
          mediumMovingAverage,
          longMovingAverage,
          macd,
          rsi,
          averageVolume,
        };

        opportunity.fundamentalIndicators = {
          peRatio,
          eps,
          revenueGrowth,
          debtToEquity,
          roe,
        };

        return opportunity;
      }

      return null;
    })
  );
}
