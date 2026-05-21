# Gmail AI Summary

Local React assistant that connects to Gmail and lets you ask AI questions such as:

- Show my last 10 mails with short summaries
- Summarize my unread emails
- Which emails need my reply?
- Find important emails from the last 30 days
- Any security or verification emails I should notice?

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:
   ```bash
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://127.0.0.1:4181/api/auth/google/callback
   OPENAI_API_KEY=...
   OPENAI_MODEL=gpt-5.2
   PORT=4181
   ```

3. In Google Cloud Console, create an OAuth client for a web app and add this redirect URI:
   ```text
   http://127.0.0.1:4181/api/auth/google/callback
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

5. Open the Vite URL, click **Connect Gmail**, approve Gmail readonly access, then ask the assistant about your mailbox.

## Notes

- Gmail access is readonly.
- The app stores the Gmail OAuth token locally in `.gmail-token.json`.
- OpenAI and Google secrets stay server-side in `.env`.
