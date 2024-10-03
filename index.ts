import cron from "node-cron";

import { fetchNews } from "./services/newsAPI.ts";
import { sendSMS } from "./services/smsSending.ts";

// Array de intervale de timp
const intervals = [
  { start: { hour: 14, minute: 30 }, step: 6, count: 10 }, // 10 requesturi la fiecare 6 minute (14:30 - 15:30)
  { start: { hour: 15, minute: 30 }, step: 15, count: 10 }, // 10 requesturi la fiecare 15 minute (15:30 - 18:00)
  { start: { hour: 18, minute: 0 }, step: 36, count: 5 }, // 5 requesturi la fiecare 36 minute (18:00 - 21:00)
];

// Funcție pentru a programa cron jobs pe baza intervalelor
function scheduleJobs() {
  sendSMS("Begin jobs");
  intervals.forEach((interval) => {
    let { hour, minute } = interval.start;
    let currentMinute = minute;

    // Planificarea fiecărei execuții
    for (let i = 0; i < interval.count; i++) {
      // Crearea expresiei cron
      const cronExpression = `${currentMinute} ${hour} * * 1-5`; // Luni-Vineri (1-5)

      // Planificarea job-ului
      cron.schedule(cronExpression, () => {
        console.log(`Rulează la ${hour}:${currentMinute}`);

        fetchNews(interval.step);
      });

      // Avansarea minutei curente
      currentMinute += interval.step;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        hour += 1;
      }
    }
  });

  sendSMS("Finish jobs");
}

scheduleJobs();
