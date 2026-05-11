# Daily AI Model WhatsApp Update

This project sends a daily AI model update to WhatsApp groups using WhatsApp Web automation.

## Location

```text
C:\Users\Kalyan Bandaru\Documents\Codex\2026-05-05\daily-ai-model-whatsapp-update
```

## Schedule

```text
Task name: Daily AI Model WhatsApp Update
Time: 10:00 AM daily
Groups:
- Keep Learning..
```

Your personal WhatsApp number is not used by the scheduled task.

## Project Structure

```text
daily-ai-model-whatsapp-update/
├─ README.md
├─ send-ai-whatsapp-update.ps1
├─ send-ai-whatsapp-update.js
├─ package.json
├─ package-lock.json
├─ node_modules/
├─ whatsapp-chrome-profile/
├─ debug-whatsapp.js
├─ debug-whatsapp-search.js
├─ whatsapp-debug.png
└─ whatsapp-search-debug.png
```

## Important Files

- `send-ai-whatsapp-update.ps1`
  - Builds the daily AI model update message.
  - Passes target group names to the WhatsApp sender.

- `send-ai-whatsapp-update.js`
  - Opens WhatsApp Web using Playwright.
  - Searches each group.
  - Fills the message.
  - Clicks send.

- `whatsapp-chrome-profile/`
  - Stores the dedicated Chrome WhatsApp Web login session.
  - Keep this folder if you want to avoid scanning the QR code again.

## Scheduled Command

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Kalyan Bandaru\Documents\Codex\2026-05-05\daily-ai-model-whatsapp-update\send-ai-whatsapp-update.ps1" -ChatNames "Keep Learning.."
```

## Manual Test Command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Kalyan Bandaru\Documents\Codex\2026-05-05\daily-ai-model-whatsapp-update\send-ai-whatsapp-update.ps1" -ChatNames "Keep Learning.."
```

## Notes

- Your computer should be on at 10:00 AM.
- WhatsApp Web should stay logged in inside the automation Chrome profile.
- If WhatsApp asks for QR login again, scan it once in the automation browser window.
- WhatsApp Web automation is unofficial and can break if WhatsApp changes its UI.
