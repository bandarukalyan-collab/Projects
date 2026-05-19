const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const config = require("./config");

let db;

function openDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  db = new sqlite3.Database(config.databasePath);
  return db;
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    openDb().run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    openDb().get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    openDb().all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS daily_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_date TEXT NOT NULL UNIQUE,
    weekday TEXT NOT NULL,
    theme TEXT NOT NULL,
    basic_question TEXT NOT NULL,
    basic_answer TEXT NOT NULL,
    intermediate_question TEXT NOT NULL,
    intermediate_answer TEXT NOT NULL,
    expert_question TEXT NOT NULL,
    expert_answer TEXT NOT NULL,
    tiny_update TEXT NOT NULL,
    question_sent_at TEXT,
    answer_sent_at TEXT,
    weekly_recap_included INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS send_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER,
    message_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES daily_content(id)
  )`);
}

async function saveDailyContent(content) {
  const result = await run(
    `INSERT INTO daily_content (
      content_date, weekday, theme,
      basic_question, basic_answer,
      intermediate_question, intermediate_answer,
      expert_question, expert_answer,
      tiny_update
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      content.content_date,
      content.weekday,
      content.theme,
      content.basic_question,
      content.basic_answer,
      content.intermediate_question,
      content.intermediate_answer,
      content.expert_question,
      content.expert_answer,
      content.tiny_update,
    ]
  );

  return getDailyContentById(result.lastID);
}

function getDailyContentById(id) {
  return get("SELECT * FROM daily_content WHERE id = ?", [id]);
}

function getDailyContentByDate(contentDate) {
  return get("SELECT * FROM daily_content WHERE content_date = ?", [contentDate]);
}

function getRecentDailyContent(limit = 30) {
  return all("SELECT * FROM daily_content ORDER BY content_date DESC LIMIT ?", [limit]);
}

function getDailyContentBetween(startDate, endDate) {
  return all(
    "SELECT * FROM daily_content WHERE content_date BETWEEN ? AND ? ORDER BY content_date ASC",
    [startDate, endDate]
  );
}

function markQuestionSent(id) {
  return run("UPDATE daily_content SET question_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
}

function markAnswerSent(id) {
  return run("UPDATE daily_content SET answer_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
}

function markWeeklyRecapIncluded(ids) {
  if (!ids.length) return Promise.resolve();
  const placeholders = ids.map(() => "?").join(",");
  return run(
    `UPDATE daily_content SET weekly_recap_included = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
    ids
  );
}

function logSend({ contentId = null, messageType, recipient, status, errorMessage = null }) {
  return run(
    "INSERT INTO send_log (content_id, message_type, recipient, status, error_message) VALUES (?, ?, ?, ?, ?)",
    [contentId, messageType, recipient, status, errorMessage]
  );
}

function closeDb() {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) reject(error);
      else {
        db = null;
        resolve();
      }
    });
  });
}

module.exports = {
  all,
  closeDb,
  getDailyContentBetween,
  getDailyContentByDate,
  getRecentDailyContent,
  initDb,
  logSend,
  markAnswerSent,
  markQuestionSent,
  markWeeklyRecapIncluded,
  saveDailyContent,
};

