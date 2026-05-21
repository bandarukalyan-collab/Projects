const config = require("../config");
const db = require("../db");
const { formatDateKey } = require("../dateUtils");
const { generateDailyContent } = require("../generator/generateDailyContent");
const { formatQuestionMessage } = require("../messages/formatQuestionMessage");
const { sendWhatsAppMessage } = require("../whatsapp/sender");

async function sendDailyQuestions({ contentDate = formatDateKey(), noSend = process.argv.includes("--no-send") } = {}) {
  await db.initDb();

  let content = await db.getDailyContentByDate(contentDate);
  if (!content) {
    const recentContent = await db.getRecentDailyContent(30);
    content = await db.saveDailyContent(await generateDailyContent({ contentDate, recentContent }));
  }

  const message = formatQuestionMessage(content);
  await sendWhatsAppMessage({ chatNames: config.whatsappChatNames, message, noSend });

  if (!noSend) {
    await db.markQuestionSent(content.id);
    for (const recipient of config.whatsappChatNames) {
      await db.logSend({ contentId: content.id, messageType: "questions", recipient, status: "sent" });
    }
  }

  return { content, message };
}

if (require.main === module) {
  sendDailyQuestions()
    .then(({ content }) => {
      console.log(`Daily questions handled for ${content.content_date}: ${content.theme}`);
      return db.closeDb();
    })
    .catch(async (error) => {
      console.error(error);
      await db.closeDb();
      process.exit(1);
    });
}

module.exports = {
  sendDailyQuestions,
};

