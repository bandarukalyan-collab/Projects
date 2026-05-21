const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'quizbot.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database initialized successfully');
    }
});

// Initialize database schema
function initDatabase() {
    db.serialize(() => {
        // Create questions table
        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL CHECK(correct_answer IN ('A', 'B', 'C', 'D'))
        )`);

        // Create answers table
        db.run(`CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            phone_number TEXT NOT NULL,
            user_name TEXT,
            answer TEXT NOT NULL CHECK(answer IN ('A', 'B', 'C', 'D')),
            is_correct INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )`);

        // Create active_quizzes table
        db.run(`CREATE TABLE IF NOT EXISTS active_quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id TEXT NOT NULL UNIQUE,
            question_id INTEGER NOT NULL,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )`);
    });
}

// Add a question to the database
function addQuestion(question, options, correctAnswer, callback) {
    db.run(
        `INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?)`,
        [question, options.A, options.B, options.C, options.D, correctAnswer],
        function(err) {
            callback(err, this.lastID);
        }
    );
}

// Get all questions
function getAllQuestions(callback) {
    db.all(`SELECT * FROM questions`, [], (err, rows) => {
        callback(err, rows);
    });
}

// Get a random question
function getRandomQuestion(callback) {
    db.all(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`, [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows[0]);
        }
    });
}

// Get question by ID
function getQuestionById(id, callback) {
    db.get(`SELECT * FROM questions WHERE id = ?`, [id], (err, row) => {
        callback(err, row);
    });
}

// Record an answer
function recordAnswer(questionId, phoneNumber, userName, answer, isCorrect, callback) {
    db.run(
        `INSERT INTO answers (question_id, phone_number, user_name, answer, is_correct) VALUES (?, ?, ?, ?, ?)`,
        [questionId, phoneNumber, userName, answer, isCorrect ? 1 : 0],
        (err) => {
            callback(err);
        }
    );
}

// Check if user already answered a question
function hasUserAnswered(questionId, phoneNumber, callback) {
    db.get(
        `SELECT * FROM answers WHERE question_id = ? AND phone_number = ?`,
        [questionId, phoneNumber],
        (err, row) => {
            callback(err, !!row);
        }
    );
}

// Get answers for a question
function getAnswersForQuestion(questionId, callback) {
    db.all(
        `SELECT * FROM answers WHERE question_id = ?`,
        [questionId],
        (err, rows) => {
            callback(err, rows);
        }
    );
}

// Set active quiz for a group
function setActiveQuiz(groupId, questionId, callback) {
    db.run(
        `INSERT OR REPLACE INTO active_quizzes (group_id, question_id) VALUES (?, ?)`,
        [groupId, questionId],
        (err) => {
            callback(err);
        }
    );
}

// Get active quiz for a group
function getActiveQuiz(groupId, callback) {
    db.get(
        `SELECT * FROM active_quizzes WHERE group_id = ?`,
        [groupId],
        (err, row) => {
            callback(err, row);
        }
    );
}

// End active quiz for a group
function endActiveQuiz(groupId, callback) {
    db.run(
        `DELETE FROM active_quizzes WHERE group_id = ?`,
        [groupId],
        (err) => {
            callback(err);
        }
    );
}

// Get leaderboard
function getLeaderboard(limit, callback) {
    db.all(
        `SELECT 
            phone_number,
            user_name,
            COUNT(*) as total_questions,
            SUM(is_correct) as correct_answers,
            ROUND((SUM(is_correct) * 100.0 / COUNT(*)), 1) as score
        FROM answers
        GROUP BY phone_number, user_name
        ORDER BY score DESC
        LIMIT ?`,
        [limit],
        (err, rows) => {
            callback(err, rows);
        }
    );
}

module.exports = {
    initDatabase,
    addQuestion,
    getAllQuestions,
    getRandomQuestion,
    getQuestionById,
    recordAnswer,
    hasUserAnswered,
    getAnswersForQuestion,
    setActiveQuiz,
    getActiveQuiz,
    endActiveQuiz,
    getLeaderboard
};
