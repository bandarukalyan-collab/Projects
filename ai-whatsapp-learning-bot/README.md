# AI WhatsApp Learning Bot

Sends daily AI learning questions to a WhatsApp group, sends crisp answers the next morning, and sends a separate weekly recap on Saturday.

## Schedule

- Monday-Friday, 8:00 PM IST: questions + tiny AI update
- Tuesday-Saturday, 9:00 AM IST: previous day answers
- Saturday, 10:00 AM IST: weekly recap

## Setup

```powershell
npm install
Copy-Item .env.example .env
npm run init-db
```

Update `.env` with:

- `OPENAI_API_KEY`
- `WHATSAPP_CHAT_NAMES`
- `CHROME_PATH` if Chrome is installed elsewhere

## Test Without Sending

```powershell
npm run generate
```

## Send Manually

```powershell
npm run send:questions
npm run send:answers
npm run send:recap
```

## Run Scheduler

```powershell
npm start
```

The first WhatsApp send may ask for QR login in the automation browser. The login is saved in `whatsapp-chrome-profile/`.

## Design

The bot dynamically generates daily content, saves it to SQLite before sending, and uses the saved row for next-day answers. This avoids mismatches and helps prevent repeated questions.

