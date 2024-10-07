import cron from "node-cron";

import {
  analysisNews,
  fetchNews,
  getTechnicalIndicators,
  logToFile,
  saveFiles,
  sendSMS,
} from "./services/index.ts";
import { TradingOpportunity } from "./types.ts";

const intervals = [
  { start: { hour: 14, minute: 30 }, step: 6, count: 10 },
  { start: { hour: 15, minute: 30 }, step: 15, count: 10 },
  { start: { hour: 18, minute: 0 }, step: 36, count: 5 },
];

function scheduleJobs() {
  let firstTime = true;

  intervals.forEach((interval) => {
    let { hour, minute } = interval.start;
    let currentMinute = minute;

    for (let i = 0; i < interval.count; i++) {
      const cronExpression = `${currentMinute} ${hour} * * 1-5`; // Luni-Vineri (1-5)

      cron.schedule(cronExpression, async () => {
        logToFile(`Rulează la ${hour}:${currentMinute}`);

        if (firstTime) {
          sendSMS("begin jobs");
          logToFile(
            `[${new Date().toISOString()}] program started, scheduling jobs...`
          );
          firstTime = false;
        }

        const data = await fetchNews(interval.step);
        saveFiles(data?.summaries);

        const analysis = await analysisNews(data?.summaries);
        saveFiles(analysis || undefined, "analysis");

        const tradingOpportunities: TradingOpportunity[] = JSON.parse(
          analysis || ""
        );

        const stocks = tradingOpportunities.map((s) => s.shortName);

        if (stocks.length === 0) {
          logToFile("No stocks found.");
          return;
        }

        stocks.forEach(async (stock) => {
          // technical indicators
          const {
            shortMovingAverage,
            mediumMovingAverage,
            longMovingAverage,
            macd,
            rsi,
          } = await getTechnicalIndicators(stock);

          // Find the corresponding trading opportunity and add the indicators
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
            };
          }
        });

        saveFiles(JSON.stringify(tradingOpportunities), "opportunities");
      });

      // Avansarea minutei curente
      currentMinute += interval.step;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        hour += 1;
      }
    }
  });
}

scheduleJobs();
