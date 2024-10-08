import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logToFile } from "../services/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tickersPath = path.resolve(__dirname, "../tickers.txt");
const tickers = await fs.promises.readFile(tickersPath, "utf8");

export const checkTicker = (ticker: string) => {
  const isValid = tickers.includes(ticker);
  if (!isValid) logToFile(`Invalid ticker: ${ticker}`);
  return isValid;
};
