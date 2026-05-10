import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

await loadEnv(path.join(rootDir, '.env'));

const port = Number(process.env.PORT || 4177);
const host = process.env.HOST || '0.0.0.0';
const apiKey = process.env.YOUTUBE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || 'gpt-5.2';
const youtubeBaseUrl = 'https://www.googleapis.com/youtube/v3';

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        hasApiKey: Boolean(apiKey),
        hasOpenAiKey: Boolean(openaiApiKey)
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/channels') {
      requireApiKey();
      const query = url.searchParams.get('q')?.trim();
      if (!query) {
        sendJson(res, 400, { error: 'Enter a channel name to search.' });
        return;
      }

      const data = await youtubeGet('/search', {
        part: 'snippet',
        type: 'channel',
        q: query,
        maxResults: '6'
      });

      const channelIds = data.items.map((item) => item.id.channelId).filter(Boolean);
      const statsById = await getChannelStats(channelIds);

      const channels = data.items.map((item) => {
        const id = item.id.channelId;
        return {
          id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: pickThumbnail(item.snippet.thumbnails),
          subscriberCount: statsById.get(id)?.subscriberCount ?? null,
          videoCount: statsById.get(id)?.videoCount ?? null
        };
      });

      sendJson(res, 200, { channels });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/top-videos') {
      requireApiKey();
      const channelId = url.searchParams.get('channelId')?.trim();
      const rangeDays = normalizeRangeDays(url.searchParams.get('rangeDays'));
      if (!channelId) {
        sendJson(res, 400, { error: 'Choose a channel first.' });
        return;
      }

      const videos = await getTopRecentVideos(channelId, rangeDays);
      sendJson(res, 200, { videos });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/summarize-video') {
      requireOpenAiKey();
      const body = await readJsonBody(req);
      if (!body?.video?.id || !body.video.title) {
        sendJson(res, 400, { error: 'Choose a video before summarizing.' });
        return;
      }

      const summary = await summarizeVideo(body.video);
      sendJson(res, 200, { summary });
      return;
    }

    if (req.method === 'GET') {
      await serveStatic(url.pathname, res);
      return;
    }

    sendJson(res, 404, { error: 'Route not found.' });
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, { error: error.message || 'Something went wrong.' });
  }
});

server.listen(port, host, () => {
  console.log(`YouTube API server running at http://${host}:${port}`);
});

async function getTopRecentVideos(channelId, rangeDays) {
  const publishedAfter = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
  const searchData = await youtubeGet('/search', {
    part: 'snippet',
    type: 'video',
    channelId,
    publishedAfter,
    order: 'date',
    maxResults: '50'
  });

  const ids = searchData.items.map((item) => item.id.videoId).filter(Boolean);
  if (ids.length === 0) return [];

  const videosData = await youtubeGet('/videos', {
    part: 'snippet,statistics,contentDetails',
    id: ids.join(','),
    maxResults: '50'
  });

  return videosData.items
    .map((item) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description,
      thumbnail: pickThumbnail(item.snippet.thumbnails),
      viewCount: Number(item.statistics.viewCount || 0),
      likeCount: item.statistics.likeCount ? Number(item.statistics.likeCount) : null,
      commentCount: item.statistics.commentCount ? Number(item.statistics.commentCount) : null,
      duration: item.contentDetails.duration
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);
}

async function summarizeVideo(video) {
  const input = [
    `Video title: ${video.title}`,
    `Channel: ${video.channelTitle || 'Unknown'}`,
    `Published: ${video.publishedAt || 'Unknown'}`,
    `Views: ${video.viewCount ?? 'Unknown'}`,
    `Likes: ${video.likeCount ?? 'Hidden'}`,
    `Comments: ${video.commentCount ?? 'Hidden'}`,
    `Description: ${trimForPrompt(video.description || 'No description available.', 7000)}`
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: openaiModel,
      max_output_tokens: 900,
      instructions: [
        'You summarize YouTube videos for busy viewers.',
        'Use only the provided title, description, and public metrics.',
        'Do not pretend you watched the video or read a transcript.',
        'Return only valid JSON with these keys: shortSummary, keyPoints, takeaways, worthWatchingFor.',
        'shortSummary must be one plain string containing 3 to 5 short sentences separated by spaces, not an array.',
        'keyPoints and takeaways must each contain 3 to 5 concise strings.',
        'worthWatchingFor must be one concise sentence.'
      ].join(' '),
      input
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const reason = data.error?.message || 'OpenAI summary request failed.';
    const error = new Error(reason);
    error.statusCode = response.status;
    throw error;
  }

  return normalizeSummary(parseOpenAiJson(data));
}

function normalizeRangeDays(value) {
  const allowedRanges = new Set([7, 15, 30, 60, 90]);
  const parsed = Number(value || 7);
  return allowedRanges.has(parsed) ? parsed : 7;
}

async function getChannelStats(channelIds) {
  if (channelIds.length === 0) return new Map();

  const data = await youtubeGet('/channels', {
    part: 'statistics',
    id: channelIds.join(',')
  });

  return new Map(
    data.items.map((item) => [
      item.id,
      {
        subscriberCount: item.statistics.hiddenSubscriberCount
          ? null
          : Number(item.statistics.subscriberCount || 0),
        videoCount: Number(item.statistics.videoCount || 0)
      }
    ])
  );
}

async function youtubeGet(endpoint, params) {
  const url = new URL(`${youtubeBaseUrl}${endpoint}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const reason = data.error?.message || 'YouTube API request failed.';
    const error = new Error(reason);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

function pickThumbnail(thumbnails = {}) {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ''
  );
}

function requireApiKey() {
  if (!apiKey) {
    const error = new Error('Missing YOUTUBE_API_KEY. Add it to the .env file first.');
    error.statusCode = 500;
    throw error;
  }
}

function requireOpenAiKey() {
  if (!openaiApiKey) {
    const error = new Error('Missing OPENAI_API_KEY. Add it to the .env file first.');
    error.statusCode = 500;
    throw error;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON request body.'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function extractOpenAiText(response) {
  if (response.output_text) return response.output_text;
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === 'output_text' && content.text)
    .map((content) => content.text)
    .join('\n');
}

function parseOpenAiJson(response) {
  const text = extractOpenAiText(response).trim();
  if (!text) throw new Error('OpenAI returned an empty summary.');

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('OpenAI returned a summary format the app could not read.');
    return JSON.parse(match[0]);
  }
}

function normalizeSummary(summary) {
  return {
    shortSummary: normalizeSummaryText(summary.shortSummary),
    keyPoints: normalizeStringList(summary.keyPoints),
    takeaways: normalizeStringList(summary.takeaways),
    worthWatchingFor: String(summary.worthWatchingFor || '').trim(),
    sourceNote: 'Generated from YouTube title, description, and public metrics.'
  };
}

function normalizeSummaryText(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).join(' ');
  return String(value || '').replace(/\s*,\s*(?=[A-Z])/g, ' ').trim();
}

function normalizeStringList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
    : [];
}

function trimForPrompt(value, limit) {
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

async function serveStatic(pathname, res) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const normalizedPath = path.normalize(decodeURIComponent(safePath)).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(distDir, normalizedPath);
  const targetPath = filePath.startsWith(distDir) && existsSync(filePath)
    ? filePath
    : path.join(distDir, 'index.html');

  if (!existsSync(targetPath)) {
    sendJson(res, 404, { error: 'Build output not found. Run npm run build first.' });
    return;
  }

  const content = await readFile(targetPath);
  res.writeHead(200, { 'Content-Type': getContentType(targetPath) });
  res.end(content);
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon'
  };

  return types[extension] || 'application/octet-stream';
}

async function loadEnv(envPath) {
  if (!existsSync(envPath)) return;

  const text = await readFile(envPath, 'utf8');
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^"|"$/g, '');
    if (key && !process.env[key]) process.env[key] = value;
  });
}
