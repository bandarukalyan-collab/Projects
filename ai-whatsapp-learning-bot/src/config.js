const path = require("path");
require("dotenv").config();

const rootDir = path.resolve(__dirname, "..");

function resolveFromRoot(value, fallback) {
  const target = value || fallback;
  if (path.isAbsolute(target)) return target;
  return path.join(rootDir, target);
}

function parseChatNames(value) {
  return (value || "")
    .split("|")
    .map((name) => name.trim())
    .filter(Boolean);
}

module.exports = {
  rootDir,
  timezone: process.env.TIMEZONE || "Asia/Kolkata",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  databasePath: resolveFromRoot(process.env.DATABASE_PATH, "./data/ai-learning-bot.sqlite"),
  whatsappChatNames: parseChatNames(process.env.WHATSAPP_CHAT_NAMES || "Keep Learning.."),
  whatsappChromeProfile: resolveFromRoot(process.env.WHATSAPP_CHROME_PROFILE, "./whatsapp-chrome-profile"),
  chromePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
};

