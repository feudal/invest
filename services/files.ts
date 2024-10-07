import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logToFile } from "./logs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const saveFiles = (
  text?: string,
  filePath = "news",
  extension = "txt",
  fileName = new Date().toISOString()
) => {
  if (!text) {
    logToFile("function saveFiles don't receive any string");
    return;
  }

  const fullPath = path.join(
    __dirname,
    `../data/${filePath}/${fileName}.${extension}`
  );

  // Ensure the directory exists
  const dirPath = path.dirname(fullPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // Create the directory if it doesn't exist
    logToFile(`Directory created: ${dirPath}`);
  }

  fs.writeFileSync(fullPath, text);
  logToFile(`File saved: ${fullPath}`);
};
