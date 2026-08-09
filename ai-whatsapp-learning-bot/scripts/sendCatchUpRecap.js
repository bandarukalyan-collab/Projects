const db = require("../src/db");
const { sendWhatsAppMessage } = require("../src/whatsapp/sender");
const config = require("../src/config");

const startDate = "2026-07-02";
const endDate = "2026-08-09";

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

function formatDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

function buildCatchUpMessage(rows) {
  const knownThemes = rows.map((row) => row.theme);
  const themeText = knownThemes.length ? knownThemes.join(", ") : "production AI, RAG, agents, evaluation, governance, and cloud AI";

  return [
    `AI Learning Catch-up: ${formatDate(startDate)} - ${formatDate(endDate)}`,
    "",
    "We missed a few scheduled posts while the laptop was offline, so here is one compact 20-question catch-up pack instead of many separate daily messages.",
    "",
    "Week 1: RAG, Embeddings, and Knowledge Systems",
    "1. Q: What does RAG mean?",
    "A: Retrieval-Augmented Generation. The app retrieves relevant context first, then the model generates an answer from that context.",
    "2. Q: Why is RAG useful for company documents?",
    "A: It keeps answers fresh without retraining the model whenever documents change.",
    "3. Q: What are embeddings used for?",
    "A: They convert text into numeric vectors so systems can find meaning-based matches, not just exact keywords.",
    "4. Q: Your internal chatbot gives outdated policy answers. What would you inspect first?",
    "A: Source document freshness, indexing schedule, chunking, metadata filters, retrieval ranking, and whether prompts force answers from retrieved context.",
    "Tiny update: RAG is becoming the default pattern for enterprise assistants that need private, changing knowledge.",
    "",
    "Week 2: AI Agents and Workflow Automation",
    "5. Q: What is an AI agent?",
    "A: A system that can reason, use tools, follow steps, and act toward a goal instead of only replying with text.",
    "6. Q: How is an agent different from a chatbot?",
    "A: A chatbot responds; an agent can plan, call APIs, update records, and continue a workflow with guardrails.",
    "7. Q: What controls should exist before an agent takes real actions?",
    "A: Role-based access, approval gates, action limits, audit logs, rollback, and monitoring.",
    "8. Q: An agent sends wrong customer emails. What would you fix?",
    "A: Add draft review, recipient validation, stronger tool permissions, test cases, prompt constraints, and action logging.",
    "Tiny update: Enterprise agents are moving from demos to controlled workflow automation.",
    "",
    "Week 3: Evaluation, Prompting, and Reliability",
    "9. Q: What is model evaluation?",
    "A: Measuring whether AI outputs are accurate, useful, safe, consistent, and fit for the task.",
    "10. Q: Why is manual testing not enough for LLM apps?",
    "A: It misses edge cases. Automated evals catch regressions across many examples after prompt, model, or retrieval changes.",
    "11. Q: How can prompts produce more reliable structured output?",
    "A: Specify schema, examples, allowed values, refusal rules, and validate the output before downstream use.",
    "12. Q: A model sometimes invents policy details. How would you reduce hallucination?",
    "A: Use retrieved source context, require source-grounded answers, say when evidence is missing, and add automated validation.",
    "Tiny update: Strong AI systems combine prompts, retrieval, evals, and guardrails instead of relying on prompting alone.",
    "",
    "Week 4: Governance, Security, and Responsible AI",
    "13. Q: What is AI governance?",
    "A: The rules, ownership, reviews, controls, and monitoring that keep AI systems safe and accountable.",
    "14. Q: What is prompt injection?",
    "A: A malicious or accidental instruction in user/data content that tries to override system rules or misuse tools.",
    "15. Q: What should be logged in production AI systems?",
    "A: Inputs, retrieved context IDs, model/version, tool calls, outputs, errors, user actions, and human approvals where needed.",
    "16. Q: An AI assistant can access private files. What security checks matter?",
    "A: Permission filtering before retrieval, least-privilege tool access, redaction, audit logs, and tests for data leakage.",
    "Tiny update: AI governance is becoming part of architecture design, not a final checklist.",
    "",
    "Week 5: Cloud, DevOps, and Production AI",
    "17. Q: What makes an AI app production-ready?",
    "A: Reliability, observability, retries, rate-limit handling, cost controls, fallback paths, and clear ownership.",
    "18. Q: Why do AI systems need monitoring?",
    "A: Model quality, latency, cost, API failures, retrieval quality, and user behavior can all drift over time.",
    "19. Q: How can DevOps improve AI deployment?",
    "A: Use CI/CD, eval gates, versioned prompts, rollback, environment configs, and automated health checks.",
    "20. Q: Your AI feature suddenly becomes expensive. What would you check?",
    "A: Token usage, model choice, retries, long context, duplicate calls, caching, batch strategy, and fallback routing.",
    "Tiny update: Production AI is increasingly about operations: evals, monitoring, cost, reliability, and governance.",
    "",
    `Topics recovered from the bot database: ${themeText}.`,
    "",
    "Normal daily questions and next-day answers will continue from the next schedule."
  ].join("\n");
}

async function main() {
  await db.initDb();
  try {
    const rows = await db.getDailyContentBetween(startDate, endDate);
    const message = buildCatchUpMessage(rows);

    if (hasArg("preview")) {
      console.log(message);
      return;
    }

    const shouldSend = hasArg("send");
    await sendWhatsAppMessage({
      chatNames: config.whatsappChatNames,
      message,
      noSend: !shouldSend,
    });

    console.log(shouldSend ? "Catch-up recap sent." : "Catch-up recap prepared. Use --send to post it.");
  } finally {
    await db.closeDb();
  }
}

main().catch(async (error) => {
  console.error(error);
  await db.closeDb().catch(() => {});
  process.exit(1);
});
