import cron from "node-cron";

import {
  addTechnicalIndicators,
  analyzeInfo,
  fetchNews,
  logToFile,
  saveFiles,
} from "./services/index.ts";
import { TradingOpportunity } from "./types.ts";
import { checkTicker } from "./utils/tickers.ts";

// Every 10 minutes
const TEN_MINUTES = 10;
// from monday to friday from 9am-11am and 1:30pm-4pm
const CRON_EXPRESSION = `*/${TEN_MINUTES} 9-10,13-14 * * 1-5`;

const processNews = async (period: number) => {
  const TODAY_DATE = new Date().toISOString().split("T")[0];
  const CURRENT_ISO_TIME = new Date().toISOString().split("T")[1].split(".")[0];

  const data = await fetchNews(period);

  const relevantNewsSummaries =
    data?.feed
      .filter((item) => item.overall_sentiment_score > 0.3)
      .map((item) => item.summary)
      .join("\n\n") || "";

  const analysisResult = await analyzeInfo(relevantNewsSummaries, "first");

  const tradingOpportunities: TradingOpportunity[] = JSON.parse(
    analysisResult || ""
  );

  const validStocks = tradingOpportunities
    .map((opportunity) => opportunity.shortName)
    .filter((shortName) => checkTicker(shortName));
  logToFile("Stocks: " + validStocks);

  const opportunitiesWithIndicators = await addTechnicalIndicators(
    validStocks,
    tradingOpportunities
  );

  saveFiles(
    JSON.stringify(opportunitiesWithIndicators),
    `opportunities/${TODAY_DATE}`,
    "json",
    CURRENT_ISO_TIME
  );

  const finalAnalysisResult = await analyzeInfo(
    JSON.stringify(opportunitiesWithIndicators),
    "final"
  );

  saveFiles(
    finalAnalysisResult || "",
    `opportunities/${TODAY_DATE}`,
    "txt",
    CURRENT_ISO_TIME
  );
};

function scheduleJobs() {
  cron.schedule(CRON_EXPRESSION, async () => {
    await processNews(TEN_MINUTES);
  });
}

scheduleJobs();
