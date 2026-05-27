import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const tokenPath = path.join(rootDir, '.gmail-token.json');

await loadEnv(path.join(rootDir, '.env'));

const port = Number(process.env.PORT || 4181);
const host = process.env.HOST || '0.0.0.0';
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri =
  process.env.GOOGLE_REDIRECT_URI || `http://127.0.0.1:${port}/api/auth/google/callback`;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const gmailScope = 'https://www.googleapis.com/auth/gmail.readonly';

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        connected: existsSync(tokenPath),
        hasGoogleClient: Boolean(googleClientId && googleClientSecret),
        hasOpenAiKey: hasRealOpenAiKey()
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/google') {
      requireGoogleConfig();
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', googleClientId);
      authUrl.searchParams.set('redirect_uri', googleRedirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', gmailScope);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('include_granted_scopes', 'true');
      redirect(res, authUrl.toString());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/google/callback') {
      requireGoogleConfig();
      const code = url.searchParams.get('code');
      if (!code) {
        sendHtml(res, 400, 'Google did not return an authorization code.');
        return;
      }

      const tokens = await exchangeCodeForTokens(code);
      await saveTokenData(tokens);
      redirect(res, '/?gmail=connected');
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/messages') {
      const maxResults = normalizeMaxResults(url.searchParams.get('maxResults'));
      const query = url.searchParams.get('q')?.trim() || 'in:inbox newer_than:30d';
      const messages = await listMessages(query, maxResults);
      sendJson(res, 200, { messages, query });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assistant') {
      const body = await readJsonBody(req);
      const prompt = String(body?.prompt || '').trim();
      if (!prompt) {
        sendJson(res, 400, { error: 'Ask something about your Gmail first.' });
        return;
      }

      const result = await answerGmailQuestion(prompt);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/messages/')) {
      const id = decodeURIComponent(url.pathname.replace('/api/messages/', ''));
      if (!id) {
        sendJson(res, 400, { error: 'Choose an email first.' });
        return;
      }

      const message = await getMessage(id);
      sendJson(res, 200, { message });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/summarize-email') {
      requireOpenAiKey();
      const body = await readJsonBody(req);
      if (!body?.message?.id || !body.message.subject) {
        sendJson(res, 400, { error: 'Choose an email before summarizing.' });
        return;
      }

      const summary = await summarizeEmail(body.message);
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
  console.log(`Gmail AI Summary server running at http://${host}:${port}`);
});

async function listMessages(query, maxResults) {
  const data = await gmailGet('/users/me/messages', {
    q: query,
    maxResults: String(maxResults)
  });

  const ids = (data.messages || []).map((message) => message.id);
  const messages = await Promise.all(ids.map((id) => getMessage(id, 'metadata')));
  return messages;
}

async function answerGmailQuestion(prompt) {
  const plan = planMailboxQuery(prompt);
  const messages = await listFullMessages(plan.query, plan.maxResults);
  if (messages.length === 0) {
    return {
      answer: `I could not find emails for: ${plan.query}`,
      highlights: [],
      messages: [],
      query: plan.query
    };
  }

  if (!hasRealOpenAiKey()) {
    return {
      ...buildFallbackAssistantResult(prompt, plan, messages),
      query: plan.query,
      messages: messages.map(compactMessage)
    };
  }

  const assistantResult = await analyzeMessagesWithOpenAi(prompt, plan, messages);
  return {
    ...assistantResult,
    query: plan.query,
    messages: messages.map(compactMessage)
  };
}

async function listFullMessages(query, maxResults) {
  const data = await gmailGet('/users/me/messages', {
    q: query,
    maxResults: String(maxResults)
  });
  const ids = (data.messages || []).map((message) => message.id);
  return Promise.all(ids.map((id) => getMessage(id, 'full')));
}

function planMailboxQuery(prompt) {
  const text = prompt.toLowerCase();
  const countMatch = text.match(/\b(\d{1,2})\b/);
  const maxResults = Math.min(Math.max(Number(countMatch?.[1] || 10), 5), 20);

  if (text.includes('unread')) {
    return { query: 'is:unread newer_than:30d', maxResults, focus: 'unread email summary' };
  }

  if (text.includes('reply') || text.includes('respond') || text.includes('action')) {
    return { query: 'in:inbox newer_than:30d -from:me', maxResults, focus: 'emails that may need a reply or action' };
  }

  if (text.includes('important') || text.includes('priority') || text.includes('urgent')) {
    return { query: 'newer_than:30d (urgent OR important OR action OR deadline OR required)', maxResults, focus: 'important and urgent emails' };
  }

  if (text.includes('security') || text.includes('verification') || text.includes('alert')) {
    return { query: 'newer_than:90d (security OR verification OR alert OR password OR sign-in)', maxResults, focus: 'security related emails' };
  }

  if (text.includes('today')) {
    return { query: 'newer_than:1d', maxResults, focus: 'emails from today' };
  }

  return { query: 'newer_than:30d', maxResults, focus: 'recent email overview' };
}

async function analyzeMessagesWithOpenAi(prompt, plan, messages) {
  const input = JSON.stringify({
    userRequest: prompt,
    gmailQueryUsed: plan.query,
    focus: plan.focus,
    emails: messages.map((message, index) => ({
      number: index + 1,
      id: message.id,
      subject: message.subject,
      from: message.from,
      date: message.date,
      labels: message.labelIds,
      snippet: message.snippet,
      body: trimForPrompt(message.body || message.snippet || '', 2200)
    }))
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: openaiModel,
      max_tokens: 1800,
      messages: [
        {
          role: 'system',
          content: 'You are a Gmail inbox assistant. Use only the provided Gmail messages. Return the latest emails as individual cards, like a clean inbox digest. Create one card for each provided email, up to 10 cards. The summary for each card must be one short plain-English sentence. Use category labels such as Finance, Work, Learning, Personal, Travel, Utility, Security, Promotion, or Other. Use priority values Low, Normal, High, or Urgent. Use action as Reply, Read, Pay, Verify, Track, Archive, or None. Do not group messages. Do not create a decision dashboard. Do not write a big verdict. Return ONLY valid JSON with this schema: {"answer": "string", "emailCards": [{"id": "string", "subject": "string", "sender": "string", "time": "string", "summary": "string", "category": "string", "priority": "string", "action": "string"}]}.'
        },
        {
          role: 'user',
          content: input
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const reason = data.error?.message || 'OpenAI mailbox analysis failed.';
    const error = new Error(reason);
    error.statusCode = response.status;
    throw error;
  }

  return normalizeEmailCardsResult(parseOpenAiJson(data), messages);
}

function emailCardsSchema() {
  return {
    type: 'json_schema',
    name: 'gmail_email_cards',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['answer', 'emailCards'],
      properties: {
        answer: { type: 'string' },
        emailCards: {
          type: 'array',
          maxItems: 10,
          items: {
            type: 'object',
           additionalProperties: false,
            required: ['id', 'subject', 'sender', 'time', 'summary', 'category', 'priority', 'action'],
            properties: {
              id: { type: 'string' },
              subject: { type: 'string' },
              sender: { type: 'string' },
              time: { type: 'string' },
              summary: { type: 'string' },
              category: { type: 'string' },
              priority: { type: 'string' },
              action: { type: 'string' }
            }
          }
        }
      }
    }
  };
}

function normalizeEmailCardsResult(result, sourceMessages) {
  const sourceById = new Map(sourceMessages.map((message) => [message.id, message]));
  const cards = normalizeObjectList(result.emailCards, [
    'id',
    'subject',
    'sender',
    'time',
    'summary',
    'category',
    'priority',
    'action'
  ]).slice(0, 10);

  return {
    answer: cleanText(result.answer || `Showing ${cards.length} recent emails.`),
    emailCards: cards.map((card, index) => {
      const source = sourceById.get(card.id) || sourceMessages[index] || {};
      return {
        id: card.id || source.id || `${index}`,
        subject: cleanText(card.subject || source.subject || '(No subject)'),
        sender: cleanSender(card.sender || source.from),
        time: cleanText(card.time || source.date || ''),
        summary: cleanText(card.summary || source.snippet || 'No summary available.'),
        category: cleanText(card.category || 'Other'),
        priority: normalizePriority(card.priority),
        action: cleanText(card.action || 'None')
      };
    })
  };
}

function buildFallbackAssistantResult(prompt, plan, messages) {
  return {
    answer: `Showing ${messages.length} recent emails. Add OPENAI_API_KEY for AI-written one-line summaries.`,
    emailCards: buildPreviewEmailCards(messages)
  };
}

function normalizeBrief(brief = {}) {
  return {
    title: cleanText(brief.title || 'Mailbox Briefing'),
    subtitle: cleanText(brief.subtitle || 'A focused AI view of the selected Gmail messages.'),
    stats: normalizeObjectList(brief.stats, ['label', 'value']).slice(0, 4),
    sections: normalizeSections(brief.sections).slice(0, 4),
    emailCards: normalizeObjectList(brief.emailCards, [
      'subject',
      'sender',
      'time',
      'summary',
      'tone',
      'nextStep'
    ]).slice(0, 3)
  };
}

function buildPreviewEmailCards(messages) {
  return messages.slice(0, 10).map((message) => ({
    id: message.id,
    subject: cleanText(message.subject),
    sender: cleanSender(message.from),
    time: message.date,
    summary: cleanText(message.snippet || 'No preview available.'),
    category: 'Other',
    priority: 'Normal',
    action: 'None'
  }));
}

function normalizeSections(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((section) => ({
      title: cleanText(section?.title || ''),
      items: normalizeStringList(section?.items)
    }))
    .filter((section) => section.title || section.items.length);
}

function normalizeObjectList(value, keys) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const normalized = {};
    keys.forEach((key) => {
      normalized[key] = cleanText(item?.[key] || '');
    });
    return normalized;
  });
}

function compactMessage(message) {
  return {
    id: message.id,
    subject: cleanText(message.subject),
    from: cleanText(message.from),
    date: message.date,
    snippet: cleanText(message.snippet)
  };
}

function cleanSender(value) {
  return String(value || 'Unknown sender').replace(/\s*<[^>]+>/, '').replaceAll('"', '').trim();
}

function cleanText(value) {
  return String(value || '')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/[】【]+/g, ' ')
    .replace(/[Í\u0080-\u009f]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getMessage(id, format = 'full') {
  const data = await gmailGet(`/users/me/messages/${encodeURIComponent(id)}`, {
    format,
    metadataHeaders: ['From', 'To', 'Subject', 'Date']
  });

  return normalizeMessage(data);
}

function normalizeMessage(message) {
  const headers = Object.fromEntries(
    (message.payload?.headers || []).map((header) => [header.name.toLowerCase(), header.value])
  );
  const textBody = extractTextBody(message.payload);

  return {
    id: message.id,
    threadId: message.threadId,
    subject: headers.subject || '(No subject)',
    from: headers.from || 'Unknown sender',
    to: headers.to || '',
    date: headers.date || '',
    snippet: message.snippet || '',
    labelIds: message.labelIds || [],
    body: textBody || message.snippet || ''
  };
}

function extractTextBody(payload) {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  const parts = payload.parts || [];
  const plain = parts.find((part) => part.mimeType === 'text/plain' && part.body?.data);
  if (plain) return decodeBase64Url(plain.body.data);

  const html = parts.find((part) => part.mimeType === 'text/html' && part.body?.data);
  if (html) return stripHtml(decodeBase64Url(html.body.data));

  return parts.map(extractTextBody).filter(Boolean).join('\n\n');
}

async function summarizeEmail(message) {
  const input = [
    `Subject: ${message.subject}`,
    `From: ${message.from}`,
    `To: ${message.to || 'Unknown'}`,
    `Date: ${message.date || 'Unknown'}`,
    `Snippet: ${message.snippet || ''}`,
    `Body: ${trimForPrompt(message.body || message.snippet || '', 9000)}`
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: openaiModel,
      max_tokens: 900,
      messages: [
        {
          role: 'system',
          content: 'You summarize Gmail messages for a busy professional. Use only the supplied email content. Return only valid JSON with these keys: summary, priority, category, actionItems, suggestedReply, keyDetails. summary must be 3 to 5 short sentences. priority must be one of Low, Normal, High, Urgent. category must be a concise label such as Work, Finance, Travel, Personal, Promotion, Security, or Follow-up. actionItems and keyDetails must each contain 0 to 5 concise strings. suggestedReply should be empty when no reply is needed. Return ONLY valid JSON.'
        },
        {
          role: 'user',
          content: input
        }
      ],
      response_format: { type: 'json_object' }
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

async function gmailGet(endpoint, params = {}) {
  const accessToken = await getAccessToken();
  const url = new URL(`https://gmail.googleapis.com/gmail/v1${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
    else if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json();

  if (!response.ok) {
    const reason = data.error?.message || 'Gmail API request failed.';
    const error = new Error(reason);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function getAccessToken() {
  const tokenData = await readTokenData();
  if (tokenData.access_token && Date.now() < Number(tokenData.expires_at || 0) - 60_000) {
    return tokenData.access_token;
  }

  if (!tokenData.refresh_token) {
    const error = new Error('Gmail is not connected. Use Connect Gmail first.');
    error.statusCode = 401;
    throw error;
  }

  const refreshed = await refreshAccessToken(tokenData.refresh_token);
  const nextTokenData = {
    ...tokenData,
    ...refreshed,
    refresh_token: refreshed.refresh_token || tokenData.refresh_token
  };
  await saveTokenData(nextTokenData);
  return nextTokenData.access_token;
}

async function exchangeCodeForTokens(code) {
  return googleTokenRequest({
    code,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    redirect_uri: googleRedirectUri,
    grant_type: 'authorization_code'
  });
}

async function refreshAccessToken(refreshToken) {
  return googleTokenRequest({
    refresh_token: refreshToken,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    grant_type: 'refresh_token'
  });
}

async function googleTokenRequest(body) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body)
  });
  const data = await response.json();

  if (!response.ok) {
    const reason = data.error_description || data.error || 'Google OAuth request failed.';
    const error = new Error(reason);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function readTokenData() {
  if (!existsSync(tokenPath)) {
    const error = new Error('Gmail is not connected. Use Connect Gmail first.');
    error.statusCode = 401;
    throw error;
  }

  return JSON.parse(await readFile(tokenPath, 'utf8'));
}

async function saveTokenData(tokenData) {
  const expiresAt = tokenData.expires_at || Date.now() + Number(tokenData.expires_in || 3600) * 1000;
  await writeFile(tokenPath, JSON.stringify({ ...tokenData, expires_at: expiresAt }, null, 2));
}

function requireGoogleConfig() {
  if (!googleClientId || !googleClientSecret) {
    const error = new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.');
    error.statusCode = 500;
    throw error;
  }
}

function requireOpenAiKey() {
  if (!hasRealOpenAiKey()) {
    const error = new Error('Missing OPENAI_API_KEY. Add it to the .env file first.');
    error.statusCode = 500;
    throw error;
  }
}

function hasRealOpenAiKey() {
  return Boolean(openaiApiKey && !openaiApiKey.startsWith('replace_with_'));
}

function normalizeMaxResults(value) {
  const parsed = Number(value || 15);
  if (!Number.isFinite(parsed)) return 15;
  return Math.min(Math.max(Math.round(parsed), 5), 30);
}

function decodeBase64Url(value) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function stripHtml(value) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractOpenAiText(response) {
  // Handle standard Chat Completions API response
  if (response.choices && response.choices[0] && response.choices[0].message) {
    return response.choices[0].message.content || '';
  }
  // Handle legacy response format
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
    summary: String(summary.summary || '').trim(),
    priority: normalizePriority(summary.priority),
    category: String(summary.category || 'General').trim(),
    actionItems: normalizeStringList(summary.actionItems),
    suggestedReply: String(summary.suggestedReply || '').trim(),
    keyDetails: normalizeStringList(summary.keyDetails),
    sourceNote: 'Generated from the selected Gmail message content.'
  };
}

function normalizePriority(value) {
  const priority = String(value || 'Normal').trim();
  return ['Low', 'Normal', 'High', 'Urgent'].includes(priority) ? priority : 'Normal';
}

function normalizeStringList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
    : [];
}

function trimForPrompt(value, limit) {
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
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

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function sendHtml(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html><body style="font-family:system-ui;margin:40px;"><h1>${message}</h1></body></html>`);
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
