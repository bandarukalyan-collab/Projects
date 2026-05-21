const schedule = require("node-schedule");
const config = require("./config");
const { sendDailyAnswers } = require("./jobs/sendDailyAnswers");
const { sendDailyQuestions } = require("./jobs/sendDailyQuestions");
const { sendWeeklyRecap } = require("./jobs/sendWeeklyRecap");

function createRule({ dayOfWeek, hour, minute }) {
  const rule = new schedule.RecurrenceRule();
  rule.tz = config.timezone;
  rule.dayOfWeek = dayOfWeek;
  rule.hour = hour;
  rule.minute = minute;
  return rule;
}

function setupScheduler() {
  schedule.scheduleJob(
    "daily-ai-questions",
    createRule({ dayOfWeek: [1, 2, 3, 4, 5], hour: 20, minute: 0 }),
    async () => {
      console.log("Scheduled job started: daily-ai-questions");
      await sendDailyQuestions();
    }
  );

  schedule.scheduleJob(
    "daily-ai-answers",
    createRule({ dayOfWeek: [2, 3, 4, 5, 6], hour: 9, minute: 0 }),
    async () => {
      console.log("Scheduled job started: daily-ai-answers");
      await sendDailyAnswers();
    }
  );

  schedule.scheduleJob(
    "weekly-ai-recap",
    createRule({ dayOfWeek: [6], hour: 10, minute: 0 }),
    async () => {
      console.log("Scheduled job started: weekly-ai-recap");
      await sendWeeklyRecap();
    }
  );

  console.log("Scheduler registered:");
  console.log("- Mon-Fri 8:00 PM IST: questions");
  console.log("- Tue-Sat 9:00 AM IST: answers");
  console.log("- Sat 10:00 AM IST: weekly recap");
}

module.exports = {
  setupScheduler,
};

