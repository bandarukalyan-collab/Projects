function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildWeeklyRecap(rows) {
  if (!rows.length) {
    return {
      themes: [],
      takeaways: ["No AI question records were found for this week yet."],
      best: {},
    };
  }

  const themes = unique(rows.map((row) => row.theme));
  const takeaways = rows.slice(0, 5).map((row) => {
    const answer = row.intermediate_answer || row.basic_answer || row.expert_answer;
    return answer.replace(/\s+/g, " ").trim();
  });

  while (takeaways.length < 5 && rows.length) {
    takeaways.push(rows[takeaways.length % rows.length].basic_answer.replace(/\s+/g, " ").trim());
  }

  return {
    themes,
    takeaways: takeaways.slice(0, 5),
    best: {
      basic: rows[0]?.basic_question,
      intermediate: rows[Math.min(1, rows.length - 1)]?.intermediate_question,
      expert: rows[Math.min(2, rows.length - 1)]?.expert_question,
    },
  };
}

module.exports = {
  buildWeeklyRecap,
};

