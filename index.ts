import cron from "node-cron";

import {
  addTechnicalIndicators,
  analyzeInfo,
  fetchNews,
  logToFile,
  saveFiles,
} from "./services/index.ts";
import { TradingOpportunity } from "./types.ts";

// Every 10 minutes
const TEN_MINUTES = 10;
// from monday to friday from 9am-11am and 1:30pm-4pm
const CRON_EXPRESSION = `*/${TEN_MINUTES} 9-10,13-14 * * 1-5`;

const processNews = async (period: number) => {
  const TODAY_DATE = new Date().toISOString().split("T")[0];
  const CURRENT_ISO_TIME = new Date().toISOString().split("T")[1].split(".")[0];

  const news = await fetchNews(period);
  logToFile("Fetched news: " + JSON.stringify(news));

  if (!news || news.length === 0) {
    logToFile("No news found");
    return;
  }

  saveFiles(
    JSON.stringify(news),
    `news/${TODAY_DATE}`,
    "json",
    CURRENT_ISO_TIME
  );

  const relevantNewsSummaries =
    news?.map((item) => item.summary).join("\n\n") || "";

  const analysisResult = await analyzeInfo(relevantNewsSummaries, "first");

  const tradingOpportunities: TradingOpportunity[] = JSON.parse(
    analysisResult || ""
  );

  saveFiles(
    JSON.stringify(tradingOpportunities),
    `opportunities/${TODAY_DATE}`,
    "json",
    CURRENT_ISO_TIME
  );

  const stocks = tradingOpportunities.map(
    (opportunity) => opportunity.shortName
  );
  logToFile("Stocks: " + stocks);

  const opportunitiesWithIndicators = await addTechnicalIndicators(
    stocks,
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
