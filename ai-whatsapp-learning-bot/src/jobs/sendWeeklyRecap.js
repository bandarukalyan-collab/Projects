const config = require("../config");
const db = require("../db");
const { currentWeekRange, formatDateKey } = require("../dateUtils");
const { formatWeeklyRecapMessage } = require("../messages/formatWeeklyRecapMessage");
const { sendWhatsAppMessage } = require("../whatsapp/sender");

async function sendWeeklyRecap({ dateKey = formatDateKey(), noSend = process.argv.includes("--no-send") } = {}) {
  await db.initDb();

  const { startDate, endDate } = currentWeekRange(dateKey);
  const rows = await db.getDailyContentBetween(startDate, endDate);
  const message = formatWeeklyRecapMessage(rows);

  await sendWhatsAppMessage({ chatNames: config.whatsappChatNames, message, noSend });

  if (!noSend) {
    await db.markWeeklyRecapIncluded(rows.map((row) => row.id));
    for (const recipient of config.whatsappChatNames) {
      await db.logSend({ contentId: null, messageType: "weekly_recap", recipient, status: "sent" });
    }
  }

  return { rows, message, startDate, endDate };
}

if (require.main === module) {
  sendWeeklyRecap()
    .then(({ startDate, endDate }) => {
      console.log(`Weekly recap handled for ${startDate} to ${endDate}`);
      return db.closeDb();
    })
    .catch(async (error) => {
      console.error(error);
      await db.closeDb();
      process.exit(1);
    });
}

module.exports = {
  sendWeeklyRecap,
};

