# WhatsApp Quiz Bot

A WhatsApp bot that sends Python quiz questions to groups, tracks answers, and maintains a leaderboard.

## Features

- Interactive Python quizzes with 4 multiple-choice options (A, B, C, D)
- Immediate feedback with ✅/❌ reactions
- Instant correct answer reveal after someone responds
- Automatic next question after 3 seconds
- Score tracking and leaderboard
- Commands: `!quiz`, `!leaderboard`, `!score`
- Scheduled quiz support

## Installation

1. Install Node.js
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Load questions into database:
   ```bash
   node loadQuestions.js
   ```

2. Start the bot:
   ```bash
   npm start
   ```

3. Scan the QR code with WhatsApp

4. Add the bot to a WhatsApp group and use commands

## Commands

- `!quiz` - Start a quiz
- `!leaderboard` - Show top scores
- `!score` - Show your personal score

## Configuration

Edit `config.json` to customize:
- Quiz timeout
- Schedule settings
- Messages
- Allowed groups
