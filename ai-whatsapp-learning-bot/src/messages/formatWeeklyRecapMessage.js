const { buildWeeklyRecap } = require("../generator/buildWeeklyRecap");

function formatWeeklyRecapMessage(rows) {
  const recap = buildWeeklyRecap(rows);

  const lines = ["Weekly AI Recap", "", "Themes covered:"];
  if (recap.themes.length) {
    recap.themes.forEach((theme) => lines.push(`- ${theme}`));
  } else {
    lines.push("- No themes recorded yet");
  }

  lines.push("", "Top 5 Interview Points:");
  recap.takeaways.slice(0, 5).forEach((point, index) => {
    lines.push(`${index + 1}. ${point}`);
  });

  if (recap.best.basic || recap.best.intermediate || recap.best.expert) {
    lines.push("", "Best Questions This Week:");
    if (recap.best.basic) lines.push(`Basic: ${recap.best.basic}`);
    if (recap.best.intermediate) lines.push(`Intermediate: ${recap.best.intermediate}`);
    if (recap.best.expert) lines.push(`Expert: ${recap.best.expert}`);
  }

  return lines.join("\n");
}

module.exports = {
  formatWeeklyRecapMessage,
};

