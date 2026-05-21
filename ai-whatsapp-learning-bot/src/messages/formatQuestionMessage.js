function formatQuestionMessage(content) {
  return [
    `Today's Theme: ${content.theme}`,
    "",
    "Basic Question:",
    content.basic_question,
    "",
    "Intermediate Question:",
    content.intermediate_question,
    "",
    "Expert Question:",
    content.expert_question,
    "",
    "Tiny AI Update:",
    content.tiny_update,
    "",
    "Answers tomorrow at 9:00 AM IST.",
  ].join("\n");
}

module.exports = {
  formatQuestionMessage,
};

