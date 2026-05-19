function formatAnswerMessage(content) {
  return [
    `Answers: ${content.theme}`,
    "",
    "Basic:",
    `Q: ${content.basic_question}`,
    `A: ${content.basic_answer}`,
    "",
    "Intermediate:",
    `Q: ${content.intermediate_question}`,
    `A: ${content.intermediate_answer}`,
    "",
    "Expert:",
    `Q: ${content.expert_question}`,
    `A: ${content.expert_answer}`,
  ].join("\n");
}

module.exports = {
  formatAnswerMessage,
};

