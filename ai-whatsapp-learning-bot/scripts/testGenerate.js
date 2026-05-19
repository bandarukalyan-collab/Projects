const db = require("../src/db");
const { formatDateKey } = require("../src/dateUtils");
const { generateDailyContent } = require("../src/generator/generateDailyContent");
const { formatAnswerMessage } = require("../src/messages/formatAnswerMessage");
const { formatQuestionMessage } = require("../src/messages/formatQuestionMessage");

async function main() {
  await db.initDb();
  const recentContent = await db.getRecentDailyContent(30);
  const content = await generateDailyContent({ contentDate: formatDateKey(), recentContent });

  console.log("QUESTION MESSAGE");
  console.log("---------------");
  console.log(formatQuestionMessage(content));
  console.log("");
  console.log("ANSWER MESSAGE");
  console.log("--------------");
  console.log(formatAnswerMessage(content));

  await db.closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await db.closeDb();
  process.exit(1);
});

