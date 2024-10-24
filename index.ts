import cron from "node-cron";

import {
  addTechnicalIndicators,
  analyzeInfo,
  fetchNews,
  logToFile,
  saveFiles,
  sendSMS,
} from "./services/index.ts";
import { TradingOpportunity } from "./types.ts";

const ONE_HOUR = 60;
// from monday to friday from 8 to 20
const CRON_EXPRESSION = `*/30 8-20 * * 1-5`;

const processNews = async (period: number) => {
  const TODAY_DATE = new Date().toISOString().split("T")[0];
  const CURRENT_ISO_TIME = new Date().toISOString().split("T")[1].split(".")[0];

  const news = await fetchNews(period);

  if (!news || news.length === 0) {
    logToFile("No news found");
    return;
  }

  saveFiles(news, `news/${TODAY_DATE}`, "txt", CURRENT_ISO_TIME);

  const analysisResult = await analyzeInfo(news, "first");

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

  if (finalAnalysisResult) {
    saveFiles(
      finalAnalysisResult || "",
      `opportunities/${TODAY_DATE}`,
      "txt",
      CURRENT_ISO_TIME
    );

    // const sms = await analyzeInfo(finalAnalysisResult, "sms");

    // if (sms || sms === "NULL") {
    //   await sendSMS(sms);
    // }
  }
};

function scheduleJobs() {
  cron.schedule(CRON_EXPRESSION, async () => {
    await processNews(ONE_HOUR);
  });
}

scheduleJobs();
