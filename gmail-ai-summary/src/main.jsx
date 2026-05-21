import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Clock3,
  Mail,
  Send,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import './styles.css';

const apiBase = '/api';
const defaultPrompt = 'Show my last 10 emails with short summaries';

function App() {
  const [health, setHealth] = useState(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const hasAssistantReply = turns.some((turn) => turn.role === 'assistant');
  const conversationRef = useRef(null);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (!conversation) return;
    conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [turns, loading]);

  useEffect(() => {
    refreshHealth();
  }, []);

  async function refreshHealth() {
    try {
      const data = await fetchJson(`${apiBase}/health`);
      setHealth(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function askAssistant(event) {
    event?.preventDefault();
    const userPrompt = prompt.trim();
    if (!userPrompt) return;

    setError('');
    setLoading('assistant');
    setTurns((current) => [...current, { role: 'user', content: userPrompt }]);

    try {
      const data = await fetchJson(`${apiBase}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt })
      });

      setTurns((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.answer,
          emailCards: data.emailCards,
          messages: data.messages,
          query: data.query
        }
      ]);
      setPrompt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
      refreshHealth();
    }
  }

  return (
    <main className="app-shell">
      <section className="top-band">
        <div className="title-copy">
          <h1>Gmail AI Assistant</h1>
          <p>AI-powered Gmail digest with summaries, priority, and next action.</p>
        </div>

        <div className="connect-row">
          <a className="connect-button" href={`${apiBase}/auth/google`}>
            <ShieldCheck size={18} aria-hidden="true" />
            Connect Gmail
          </a>
          <span className={`status-pill ${health?.connected ? 'is-connected' : 'is-disconnected'}`}>
            {health?.connected ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {health?.connected ? 'Gmail connected' : 'Not connected'}
          </span>
        </div>
      </section>

      {error && <div className="notice">{error}</div>}

      <section className="assistant-layout">
        <div className="chat-panel">
          <div className="conversation" ref={conversationRef} aria-live="polite">
            {turns.length === 0 && (
              <div className="empty-chat">
                <Mail size={34} aria-hidden="true" />
                <h2>Show the latest 10 emails</h2>
                <p>Press Ask to get a compact inbox-style card view.</p>
              </div>
            )}

            {turns.map((turn, index) => (
              <ChatTurn key={`${turn.role}-${index}`} turn={turn} />
            ))}

            {loading === 'assistant' && (
              <div className="chat-turn assistant">
                <span className="avatar">
                  <Bot size={18} aria-hidden="true" />
                </span>
                <div className="bubble is-thinking">
                  <p>Reading Gmail and preparing email cards...</p>
                </div>
              </div>
            )}
          </div>

          <form className="prompt-form" onSubmit={askAssistant}>
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={hasAssistantReply ? 'Ask a follow-up about these emails' : 'Ask: show my last 10 emails'}
              aria-label="Ask Gmail AI assistant"
            />
            <button type="submit" disabled={loading === 'assistant'}>
              <Send size={18} aria-hidden="true" />
              {hasAssistantReply ? 'Send' : 'Ask'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ChatTurn({ turn }) {
  const isUser = turn.role === 'user';
  const paragraphs = formatAssistantText(turn.content);
  const cards = !isUser ? normalizeCards(turn.emailCards, turn.messages) : [];

  return (
    <article className={`chat-turn ${isUser ? 'user' : 'assistant'}`}>
      <span className="avatar">
        {isUser ? <UserRound size={18} aria-hidden="true" /> : <Bot size={18} aria-hidden="true" />}
      </span>
      <div className="bubble">
        {(isUser || cards.length === 0) && paragraphs.length > 0 && (
          <div>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}

        {!isUser && cards.length > 0 && <EmailCardList cards={cards} />}
      </div>
    </article>
  );
}

function EmailCardList({ cards }) {
  return (
    <section className="mail-card-list" aria-label="Latest Gmail summaries">
      <div className="mail-list-head">
        <span>
          <Mail size={18} aria-hidden="true" />
          Last {cards.length} emails
        </span>
      </div>

      <div className="mail-cards">
        {cards.map((mail) => (
          <article className="mail-card" key={mail.id}>
            <div className="mail-card-top">
              <span className="sender">{cleanSender(mail.sender || mail.from)}</span>
              <small>
                <Clock3 size={13} aria-hidden="true" />
                {formatDate(mail.time || mail.date)}
              </small>
            </div>

            <h3>{cleanDisplayText(mail.subject || 'No subject')}</h3>
            <p>{cleanDisplayText(mail.summary || mail.snippet || 'No summary available.')}</p>

            <div className="mail-card-footer">
              <span className={`priority-chip ${priorityClass(mail.priority)}`}>
                {cleanDisplayText(mail.priority || 'Normal')}
              </span>
              <span>{cleanDisplayText(mail.category || 'Other')}</span>
              {mail.action && mail.action !== 'None' && <strong>{cleanDisplayText(mail.action)}</strong>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function cleanSender(value) {
  return String(value || 'Unknown').replace(/\s*<[^>]+>/, '').replaceAll('"', '').trim();
}

function cleanDisplayText(value) {
  return String(value || '')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/[ã€‘ã€]+/g, ' ')
    .replace(/[Ã\u0080-\u009f]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAssistantText(value) {
  return String(value || '')
    .split(/\n+/)
    .map(cleanDisplayText)
    .filter(Boolean);
}

function normalizeCards(emailCards = [], messages = []) {
  if (emailCards.length > 0) return emailCards.slice(0, 10);
  return messages.slice(0, 10).map((message) => ({
    id: message.id,
    subject: message.subject,
    sender: message.from,
    time: message.date,
    summary: message.snippet,
    category: 'Other',
    priority: 'Normal',
    action: 'None'
  }));
}

function priorityClass(value) {
  const priority = String(value || '').toLowerCase();
  if (priority === 'urgent' || priority === 'high') return 'high';
  if (priority === 'low') return 'low';
  return 'normal';
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

createRoot(document.getElementById('root')).render(<App />);
