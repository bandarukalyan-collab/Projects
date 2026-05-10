# YouTube Top Videos

A React + Node web app to search a YouTube channel, list its top 5 recent videos, open a selected video, and generate a quick AI summary for busy viewers.

## What It Does

- Searches YouTube channels by channel name.
- Lets you choose the correct channel from matching results.
- Filters uploads by 7 days, 15 days, 30 days, 2 months, or 3 months.
- Sorts videos by views, newest, likes, or views per day.
- Shows the top 5 videos as a list first.
- Opens the video player only after a video is selected.
- Generates an AI summary from YouTube title, description, and public metrics.

## Summary Output

- Short summary
- Key points
- Takeaways
- Worth watching for

## Setup

1. Create a YouTube Data API key in Google Cloud.
2. Create an OpenAI API key in the OpenAI platform.
2. Copy `.env.example` to `.env`.
3. Add your keys:

```text
YOUTUBE_API_KEY=your_youtube_key_here
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-5.2
PORT=4177
```

4. Install dependencies:

```powershell
npm install
```

5. Start the local app:

```powershell
npm run dev
```

6. Open:

```text
http://127.0.0.1:5177
```

## Deploying

For Render or Railway:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add environment variables in the hosting dashboard:
  - `YOUTUBE_API_KEY`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `PORT` if the host asks for one

Do not commit `.env`. It is ignored by git.

## API Key Notes

Use a standard API key for public YouTube data. Restrict the key to the YouTube Data API v3 in Google Cloud. For a hosted production version, add proper HTTP referrer or server restrictions depending on the deployment architecture. OpenAI summaries use your API credits, so set a budget limit before sharing the app widely.

## API Flow

1. `search.list` finds matching channels.
2. `channels.list` adds channel statistics.
3. `search.list` finds recent videos using `channelId` and `publishedAfter`.
4. `videos.list` gets exact view counts.
5. The frontend embeds selected videos with YouTube iframe URLs.
6. `POST /api/summarize-video` sends selected video metadata to OpenAI for the summary panel.
