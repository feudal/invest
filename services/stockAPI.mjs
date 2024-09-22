import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function fetchCompanies() {
  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/stock/list?apikey=${process.env.API_KEY}`
    );

    if (response.data) {
      const targetPath = path.join(__dirname, "../data/companies.json");
      fs.writeFileSync(targetPath, JSON.stringify(response.data, null, 2));
      console.log(`Successfully fetched ${response.data.length} companies.`);
      console.log(`Data stored in ${targetPath}`);
    }
  } catch (error) {
    console.error("Error fetching companies:", error.message);
  }
}
