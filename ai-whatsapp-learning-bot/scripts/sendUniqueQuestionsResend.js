const { sendWhatsAppMessage } = require("../src/whatsapp/sender");

const now = new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour12: true,
});

const message = [
  `Resent AI Learning Questions - ${now}`,
  "",
  "Today's Theme: RAG for Internal Knowledge",
  "",
  "Basic Question:",
  "What does RAG stand for in generative AI?",
  "",
  "Intermediate Question:",
  "Why is RAG often better than fine-tuning for company documents?",
  "",
  "Expert Question:",
  "Your internal chatbot gives answers from outdated policy documents. What would you check first?",
  "",
  "Tiny AI Update:",
  "Many enterprise AI systems use RAG to connect LLMs with private company knowledge without retraining the model. Generated for 2026-05-28.",
  "",
  "Answers tomorrow at 9:00 AM IST.",
].join("\n");

sendWhatsAppMessage({ message })
  .then(() => {
    console.log("Unique resend completed.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
