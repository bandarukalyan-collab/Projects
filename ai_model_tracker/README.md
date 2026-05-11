# AI Model Tracker

A Python script that tracks AI model updates across popular AI platforms and coding tools. It scrapes official documentation daily to detect new model releases, context window changes, and other updates, then sends email notifications.

## Features

- **Tracks 7 AI Platforms**: OpenAI (ChatGPT), Anthropic (Claude), Google (Gemini), DeepSeek, xAI (Grok), Meta (Meta AI), Perplexity AI
- **Tracks 6 AI Coding Tools**: Cursor, GitHub Copilot, Replit Agent, Windsurf (Cascade), Claude Code, CrewAI
- **Dynamic Data Scraping**: Fetches real-time information from official documentation
- **Change Detection**: Compares current data with previous state to detect updates
- **HTML Email Notifications**: Sends professional email with comparison tables
- **State Persistence**: Saves state to track changes over time

## Installation

1. Clone this repository
2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Copy the example config file and edit it:
```bash
cp config.example.json config.json
```

Edit `config.json` to set up email settings:

```json
{
  "email_enabled": false,
  "smtp_server": "smtp.gmail.com",
  "smtp_port": 587,
  "sender_email": "your_email@gmail.com",
  "sender_password": "your_app_password",
  "recipient_email": "recipient@gmail.com"
}
```

**For Gmail**: Use an App Password, not your regular password:
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password
4. Use that App Password in config.json

## Usage

### Manual Run

Run the tracker manually:
```bash
python ai_tracker.py
```

This will:
1. Scrape platform documentation for updates
2. Detect changes since last run
3. Generate an HTML email preview (`email_preview.html`)
4. Send email if `email_enabled` is true
5. Save state to `ai_models_state.json`

### Email Format

The email contains two sections:

1. **AI Platforms (General Use)** - Table with:
   - Platform / Tool
   - Type
   - Latest Model
   - Best For
   - Context Window
   - Max Output
   - Notes

2. **AI Coding & Agent Tools** - Table with same columns

## How It Works

1. **Scraping**: Each platform/tool has a dedicated function that fetches its official documentation
2. **Pattern Matching**: Uses string matching to detect model names and context window information
3. **Change Detection**: Compares current scraped data with previously saved state
4. **Email Generation**: Creates HTML email with comparison tables
5. **State Persistence**: Saves current state for future comparisons

## Tracked Platforms & Tools

### AI Platforms
- **OpenAI (ChatGPT)**: https://platform.openai.com/docs/models
- **Anthropic (Claude)**: https://platform.claude.com/docs/en/about-claude/models/overview
- **Google (Gemini)**: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models
- **DeepSeek**: https://api-docs.deepseek.com/quick_start/pricing
- **xAI (Grok)**: https://docs.x.ai/developers/models
- **Meta (Meta AI)**: https://www.llama.com/models/llama-4/
- **Perplexity AI**: https://www.perplexity.ai/help-center/en/articles/10354919

### AI Coding Tools
- **Cursor**: https://cursor.com/changelog
- **GitHub Copilot**: https://docs.github.com/en/copilot
- **Replit (Agent)**: https://docs.replit.com/category/ai
- **Windsurf (Cascade)**: https://docs.windsurf.com/windsurf/cascade/cascade
- **Claude Code**: https://platform.claude.com/docs/en/about-claude/models/overview
- **CrewAI**: https://docs.crewai.com

## Files

- `ai_tracker.py` - Main Python script
- `config.example.json` - Example email configuration (copy to config.json)
- `config.json` - Email configuration (not in repo, create from example)
- `email_template.html` - HTML email template
- `ai_models_state.json` - Saved state (auto-generated, not in repo)
- `email_preview.html` - Email preview (auto-generated, not in repo)

## Notes

- The script uses pattern matching to detect model names. If a platform changes their documentation format, the pattern may need updating.
- First run will show all items as "new" since there's no previous state.
- Email is only sent if `email_enabled` is set to `true` in config.json.
- The script generates a preview HTML file even if email is disabled.

## Troubleshooting

- **ModuleNotFoundError**: Run `pip install requests`
- **Email not sending**: Check sender email/password in config.json
- **Scraping errors**: Check if documentation URLs are accessible
- **No changes detected**: Normal if nothing has changed since last run

## License

MIT License
