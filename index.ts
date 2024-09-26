// import { calculateMACD } from "./modules/technical_indicators/macd.mjs";

// const getMACDData = async () => {
//   const result = await calculateMACD("AAPL");

//   if (result) {
//     const { macd, signal, histogram } = result;
//     console.log({
//       macd,
//       signal,
//       histogram,
//     });
//   } else {
//     console.error("MACD data is null");
//   }
// };

// getMACDData("AAPL");

import { fetchCompanies } from "./services/stockAPI.ts";

async function init() {
  console.log("Fetching list of companies...");
  await fetchCompanies();
}

init();
