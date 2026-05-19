const config = require("../config");
const db = require("../db");
const { formatDateKey, previousBusinessDateKey } = require("../dateUtils");
const { formatAnswerMessage } = require("../messages/formatAnswerMessage");
const { sendWhatsAppMessage } = require("../whatsapp/sender");

async function sendDailyAnswers({
  answerDate = previousBusinessDateKey(formatDateKey()),
  noSend = process.argv.includes("--no-send"),
} = {}) {
  await db.initDb();

  const content = await db.getDailyContentByDate(answerDate);
  if (!content) {
    throw new Error(`No saved daily content found for ${answerDate}. Cannot send matching answers.`);
  }

  const message = formatAnswerMessage(content);
  await sendWhatsAppMessage({ chatNames: config.whatsappChatNames, message, noSend });

  if (!noSend) {
    await db.markAnswerSent(content.id);
    for (const recipient of config.whatsappChatNames) {
      await db.logSend({ contentId: content.id, messageType: "answers", recipient, status: "sent" });
    }
  }

  return { content, message };
}

if (require.main === module) {
  sendDailyAnswers()
    .then(({ content }) => {
      console.log(`Daily answers handled for ${content.content_date}: ${content.theme}`);
      return db.closeDb();
    })
    .catch(async (error) => {
      console.error(error);
      await db.closeDb();
      process.exit(1);
    });
}

module.exports = {
  sendDailyAnswers,
};

