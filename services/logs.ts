import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logToFile = (info: string) => {
  // Get today's date for the file name
  const date = new Date();

  const fileName = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}.log`;
  const fullPath = path.join(__dirname, `../data/logs/${fileName}`);

  // Prepare log entry with timestamp
  const logEntry = `[${date.toISOString()}] ${info}\n`;

  // Ensure the directory exists
  if (!fs.existsSync(path.dirname(fullPath))) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  }

  // Append the log entry to the file, or create the file if it doesn't exist
  fs.appendFileSync(fullPath, logEntry, "utf8");
};
