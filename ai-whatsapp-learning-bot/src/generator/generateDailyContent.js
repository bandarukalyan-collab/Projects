const config = require("../config");
const { formatDateKey, weekdayName } = require("../dateUtils");

const fallbackThemes = [
  {
    theme: "RAG for Internal Knowledge",
    basic_question: "What does RAG stand for in generative AI?",
    basic_answer: "RAG means Retrieval-Augmented Generation. It retrieves relevant external context before the model generates an answer.",
    intermediate_question: "Why is RAG often better than fine-tuning for company documents?",
    intermediate_answer: "RAG keeps knowledge fresh without retraining. Fine-tuning is better for style, format, or repeated task behavior.",
    expert_question: "Your internal chatbot gives answers from outdated policy documents. What would you check first?",
    expert_answer: "Check document freshness, indexing schedule, retrieval quality, metadata filters, and whether prompts force answers from retrieved context.",
    tiny_update: "Many enterprise AI systems use RAG to connect LLMs with private company knowledge without retraining the model.",
  },
  {
    theme: "AI Agents in Enterprise",
    basic_question: "What is an AI agent?",
    basic_answer: "An AI agent is a system that can reason, use tools, and take steps toward a goal instead of only replying with text.",
    intermediate_question: "How is an AI agent different from a normal chatbot?",
    intermediate_answer: "A chatbot mainly responds. An agent can plan, call tools, use memory/context, and perform actions through connected systems.",
    expert_question: "A company wants an agent to approve refunds automatically. What controls should be added?",
    expert_answer: "Use policy limits, human approval for edge cases, audit logs, role-based access, test cases, rollback, and fraud checks.",
    tiny_update: "Enterprise agents are moving from chat-only assistants toward workflow automation with stricter governance controls.",
  },
  {
    theme: "Prompt Engineering for Reliable Output",
    basic_question: "Why should prompts include clear instructions?",
    basic_answer: "Clear instructions reduce ambiguity and help the model produce the expected format, scope, and level of detail.",
    intermediate_question: "How can you make an LLM return more consistent structured output?",
    intermediate_answer: "Specify the schema, give examples, constrain allowed values, and validate the output before using it downstream.",
    expert_question: "An LLM sometimes invents policy details. How would you improve the prompt and workflow?",
    expert_answer: "Provide retrieved policy context, ask it to answer only from sources, require uncertainty when missing, and add validation or review.",
    tiny_update: "Reliable AI workflows usually combine prompt design with retrieval, validation, and guardrails.",
  },
  {
    theme: "Model Evaluation",
    basic_question: "What does AI model evaluation mean?",
    basic_answer: "Model evaluation measures whether AI outputs are accurate, useful, safe, and consistent for the intended task.",
    intermediate_question: "Why is manual testing alone not enough for LLM applications?",
    intermediate_answer: "Manual testing misses edge cases. Automated evals track quality over many examples and catch regressions after changes.",
    expert_question: "What would you evaluate before deploying a customer-support AI assistant?",
    expert_answer: "Evaluate correctness, hallucination rate, refusal behavior, tone, escalation, privacy leakage, latency, and cost.",
    tiny_update: "Teams increasingly use eval suites before changing prompts, models, retrieval logic, or agent tools.",
  },
  {
    theme: "Embeddings and Semantic Search",
    basic_question: "What is an embedding?",
    basic_answer: "An embedding is a numeric representation of text, image, or data that captures meaning for comparison and search.",
    intermediate_question: "Why are embeddings useful in AI search?",
    intermediate_answer: "They help find semantically similar content even when exact keywords do not match.",
    expert_question: "Search results are relevant but from the wrong department. What would you adjust?",
    expert_answer: "Add metadata filters, improve chunking, tune retrieval ranking, check access permissions, and evaluate query rewriting.",
    tiny_update: "Embeddings power semantic search, recommendations, clustering, and many RAG systems.",
  },
];

function cleanJsonText(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function validateGeneratedContent(content) {
  const required = [
    "theme",
    "basic_question",
    "basic_answer",
    "intermediate_question",
    "intermediate_answer",
    "expert_question",
    "expert_answer",
    "tiny_update",
  ];

  for (const key of required) {
    if (!content[key] || typeof content[key] !== "string") {
      throw new Error(`Generated content is missing ${key}`);
    }
  }
}

function buildPrompt({ contentDate, weekday, recentContent }) {
  const recentSummary = recentContent
    .map((item) => `- ${item.content_date}: ${item.theme}; ${item.basic_question}; ${item.intermediate_question}; ${item.expert_question}`)
    .join("\n");

  return [
    "Create one day of WhatsApp AI learning content for an engineering/IT team.",
    "",
    `Date: ${contentDate}`,
    `Weekday: ${weekday}`,
    "",
    "Requirements:",
    "- Mostly open-ended questions.",
    "- One basic, one intermediate, and one expert question.",
    "- Expert question should be practical: scenario, architecture, debugging, evaluation, security, governance, or tradeoff.",
    "- Include a tiny AI update. It can be a current-style AI trend, tool/product update, or practical concept.",
    "- Answers must be crisp interview-style points, not long paragraphs.",
    "- Do not include source links.",
    "- Avoid repeating or closely copying recent themes/questions.",
    "",
    "Recent content to avoid:",
    recentSummary || "- None",
    "",
    "Return only valid JSON with these exact keys:",
    "theme, basic_question, basic_answer, intermediate_question, intermediate_answer, expert_question, expert_answer, tiny_update",
  ].join("\n");
}

async function generateWithOpenAI({ contentDate, weekday, recentContent }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.openaiModel,
      input: buildPrompt({ contentDate, weekday, recentContent }),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI generation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).find((item) => item.text)?.text;
  if (!text) throw new Error("OpenAI response did not contain output text.");

  const content = JSON.parse(cleanJsonText(text));
  validateGeneratedContent(content);
  return content;
}

function generateFallback({ contentDate, recentContent }) {
  const usedThemes = new Set(recentContent.map((item) => item.theme));
  const fallback = fallbackThemes.find((item) => !usedThemes.has(item.theme)) || fallbackThemes[0];
  return {
    ...fallback,
    tiny_update: `${fallback.tiny_update} Generated for ${contentDate}.`,
  };
}

async function generateDailyContent({ contentDate = formatDateKey(), recentContent = [] } = {}) {
  const weekday = weekdayName(new Date(`${contentDate}T00:00:00Z`));
  let generated;

  if (config.openaiApiKey) {
    generated = await generateWithOpenAI({ contentDate, weekday, recentContent });
  } else {
    generated = generateFallback({ contentDate, recentContent });
  }

  validateGeneratedContent(generated);

  return {
    content_date: contentDate,
    weekday,
    ...generated,
  };
}

module.exports = {
  generateDailyContent,
};
