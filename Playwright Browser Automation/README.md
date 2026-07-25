# Playwright Browser Automation

Recovered Dell Document Search browser automation.

## Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create `.env.local` from `.env.example` and set:

   ```text
   DELL_USERNAME=...
   DELL_PASSWORD=...
   ```

3. Run the automation:

   ```powershell
   npm start
   ```

## Notes

- The recovered script came from a dangling git blob, so this appears to be a previously uncommitted local file.
- The script tries to connect to an existing Chrome debug session at `http://localhost:9222`; if none is available, it launches a persistent Chrome profile in `chrome-user-data/`.
- Runtime screenshots are ignored by git.
