import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarClock,
  Download,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  Presentation,
  Play,
  Sparkles,
  Search,
  TrendingUp,
  UsersRound,
  Video
} from 'lucide-react';
import './styles.css';

const apiBase = '/api';
const rangeOptions = [
  { label: '7 days', value: 7 },
  { label: '15 days', value: 15 },
  { label: '30 days', value: 30 },
  { label: '2 months', value: 60 },
  { label: '3 months', value: 90 }
];
const sortOptions = [
  { label: 'Views', value: 'views' },
  { label: 'Newest', value: 'newest' },
  { label: 'Likes', value: 'likes' },
  { label: 'Views/day', value: 'viewsPerDay' }
];

function App() {
  const [query, setQuery] = useState('');
  const [rangeDays, setRangeDays] = useState(7);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [sortMode, setSortMode] = useState('views');
  const [loading, setLoading] = useState('');
  const [exportLoading, setExportLoading] = useState('');
  const [error, setError] = useState('');
  const [summaryByVideoId, setSummaryByVideoId] = useState({});
  const [summaryError, setSummaryError] = useState('');

  const sortedVideos = useMemo(() => sortVideos(videos, sortMode), [sortMode, videos]);
  const activeVideo = useMemo(
    () => sortedVideos.find((video) => video.id === activeVideoId) || null,
    [activeVideoId, sortedVideos]
  );

  async function searchChannels(event) {
    event.preventDefault();
    setError('');
    setSelectedChannel(null);
    setVideos([]);
    setActiveVideoId(null);

    if (!query.trim()) {
      setError('Enter a YouTube channel name.');
      return;
    }

    setLoading('channels');
    try {
      const data = await fetchJson(`${apiBase}/channels?q=${encodeURIComponent(query.trim())}`);
      setChannels(data.channels);
      if (data.channels.length === 0) {
        setError('No channels found. Try a more exact channel name.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function chooseChannel(channel) {
    setSelectedChannel(channel);
    setError('');
    setSummaryError('');
    setVideos([]);
    setActiveVideoId(null);
    setLoading('videos');

    try {
      const data = await fetchJson(
        `${apiBase}/top-videos?channelId=${channel.id}&rangeDays=${rangeDays}`
      );
      setVideos(data.videos);
      if (data.videos.length === 0) {
        setError(`This channel has no public uploads from the last ${formatRange(rangeDays)}.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function updateRange(nextRangeDays) {
    setRangeDays(nextRangeDays);
    if (!selectedChannel) return;

    setError('');
    setSummaryError('');
    setVideos([]);
    setActiveVideoId(null);
    setLoading('videos');

    try {
      const data = await fetchJson(
        `${apiBase}/top-videos?channelId=${selectedChannel.id}&rangeDays=${nextRangeDays}`
      );
      setVideos(data.videos);
      if (data.videos.length === 0) {
        setError(`This channel has no public uploads from the last ${formatRange(nextRangeDays)}.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function summarizeActiveVideo() {
    if (!activeVideo) return;

    setSummaryError('');
    setLoading('summary');
    try {
      const data = await fetchJson(`${apiBase}/summarize-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: activeVideo })
      });
      setSummaryByVideoId((current) => ({
        ...current,
        [activeVideo.id]: data.summary
      }));
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setLoading('');
    }
  }

  async function exportActiveSummary(format) {
    if (!activeVideo || !summaryByVideoId[activeVideo.id]) return;

    setSummaryError('');
    setExportLoading(format);
    try {
      await downloadSummaryFile(format, activeVideo, summaryByVideoId[activeVideo.id]);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setExportLoading('');
    }
  }

  return (
    <main className="app-shell">
      <section className="search-band">
        <div className="search-copy">
          <h1>Top YouTube Videos</h1>
          <p>
            Search a channel, choose the right result, and watch the five most-viewed
            recent uploads in one clean view.
          </p>
        </div>

        <form className="search-form" onSubmit={searchChannels}>
          <Search size={20} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter channel name"
            aria-label="YouTube channel name"
          />
          <button type="submit" disabled={loading === 'channels'}>
            {loading === 'channels' ? 'Searching' : 'Search'}
          </button>
        </form>

        <div className="preference-row" aria-label="Upload date range">
          {rangeOptions.map((option) => (
            <button
              className={option.value === rangeDays ? 'is-selected' : ''}
              key={option.value}
              type="button"
              onClick={() => updateRange(option.value)}
            >
              {option.label}
          </button>
        ))}
      </div>

        {selectedChannel && videos.length > 0 && (
          <div className="sort-row" aria-label="Sort videos">
            <span>Sort by</span>
            {sortOptions.map((option) => (
              <button
                className={option.value === sortMode ? 'is-selected' : ''}
                key={option.value}
                type="button"
                onClick={() => setSortMode(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {(channels.length > 0 || selectedChannel) && (
          <p className="result-context">
            Showing videos uploaded in the last {formatRange(rangeDays)}.
          </p>
        )}
      </section>

      {error && <div className="notice">{error}</div>}

      {channels.length > 0 && !selectedChannel && (
        <section className="channel-grid" aria-label="Channel search results">
          {channels.map((channel) => (
            <button className="channel-card" key={channel.id} onClick={() => chooseChannel(channel)}>
              <img src={channel.thumbnail} alt="" />
              <span>
                <strong>{channel.title}</strong>
                <small>{formatCount(channel.subscriberCount, 'subscribers')}</small>
              </span>
            </button>
          ))}
        </section>
      )}

      {selectedChannel && (
        <section className="results-head">
          <img src={selectedChannel.thumbnail} alt="" />
          <div>
            <p className="eyebrow">Selected channel</p>
            <h2>{selectedChannel.title}</h2>
            <span>
              <UsersRound size={16} aria-hidden="true" />
              {formatCount(selectedChannel.subscriberCount, 'subscribers')}
            </span>
          </div>
        </section>
      )}

      {loading === 'videos' && <LoadingRows />}

      {sortedVideos.length > 0 && (
        <section className={`watch-layout ${activeVideo ? '' : 'is-list-only'}`}>
          {activeVideo && (
            <article className="player-panel">
              <div className="player-frame">
                <iframe
                  title={activeVideo.title}
                  src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="active-copy">
                <h2>{activeVideo.title}</h2>
                <div className="meta-row">
                  <span>
                    <Eye size={16} aria-hidden="true" />
                    {formatCount(activeVideo.viewCount, 'views')}
                  </span>
                  <span>
                    <CalendarClock size={16} aria-hidden="true" />
                    {formatDate(activeVideo.publishedAt)}
                  </span>
                  <span>
                    <TrendingUp size={16} aria-hidden="true" />
                    {formatCount(getViewsPerDay(activeVideo), 'views/day')}
                  </span>
                  <span>
                    <Heart size={16} aria-hidden="true" />
                    {formatOptionalCount(activeVideo.likeCount, 'likes')}
                  </span>
                  <span>
                    <MessageCircle size={16} aria-hidden="true" />
                    {formatOptionalCount(activeVideo.commentCount, 'comments')}
                  </span>
                </div>
                <div className="summary-actions">
                  <button
                    type="button"
                    onClick={summarizeActiveVideo}
                    disabled={loading === 'summary'}
                  >
                    <Sparkles size={17} aria-hidden="true" />
                    {loading === 'summary'
                      ? 'Summarizing'
                      : summaryByVideoId[activeVideo.id]
                        ? 'Refresh Summary'
                        : 'Summarize Video'}
                  </button>
                </div>
                {summaryError && <p className="summary-error">{summaryError}</p>}
                {summaryByVideoId[activeVideo.id] && (
                  <SummaryPanel
                    exportLoading={exportLoading}
                    onExport={exportActiveSummary}
                    summary={summaryByVideoId[activeVideo.id]}
                  />
                )}
              </div>
            </article>
          )}

          <aside className="video-list" aria-label="Top 5 recent videos">
            {sortedVideos.map((video, index) => (
              <button
                className={`video-row ${video.id === activeVideo?.id ? 'is-active' : ''}`}
                key={video.id}
                onClick={() => setActiveVideoId(video.id)}
              >
                <span className="rank">{index + 1}</span>
                <img src={video.thumbnail} alt="" />
                <span className="video-row-copy">
                  <strong>{video.title}</strong>
                  <small>
                    {formatCount(video.viewCount, 'views')} ·{' '}
                    {formatCount(getViewsPerDay(video), 'views/day')}
                  </small>
                </span>
                <Play size={18} aria-hidden="true" />
              </button>
            ))}
          </aside>
        </section>
      )}

      {!selectedChannel && channels.length === 0 && !error && (
        <section className="empty-state">
          <Video size={42} aria-hidden="true" />
          <h2>Start with a channel name</h2>
          <p>Pick a time range, search a channel, then choose the correct result.</p>
        </section>
      )}
    </main>
  );
}

function SummaryPanel({ exportLoading, onExport, summary }) {
  return (
    <section className="summary-panel" aria-label="AI video summary">
      <div className="summary-panel-head">
        <div>
          <p className="eyebrow">AI summary</p>
          <p className="summary-text">{summary.shortSummary}</p>
        </div>
        <div className="export-actions" aria-label="Export summary">
          <button type="button" onClick={() => onExport('pdf')} disabled={Boolean(exportLoading)}>
            <Download size={16} aria-hidden="true" />
            {exportLoading === 'pdf' ? 'PDF' : 'PDF'}
          </button>
          <button type="button" onClick={() => onExport('pptx')} disabled={Boolean(exportLoading)}>
            <Presentation size={16} aria-hidden="true" />
            {exportLoading === 'pptx' ? 'PPT' : 'PPT'}
          </button>
          <button type="button" onClick={() => onExport('docx')} disabled={Boolean(exportLoading)}>
            <FileText size={16} aria-hidden="true" />
            {exportLoading === 'docx' ? 'DOCX' : 'DOCX'}
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryList title="Key points" items={summary.keyPoints} />
        <SummaryList title="Takeaways" items={summary.takeaways} />
      </div>

      {summary.worthWatchingFor && (
        <p className="worth-line">
          <strong>Worth watching for:</strong> {summary.worthWatchingFor}
        </p>
      )}
      {summary.sourceNote && <small className="source-note">{summary.sourceNote}</small>}
    </section>
  );
}

function SummaryList({ title, items }) {
  if (!items?.length) return null;

  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function LoadingRows() {
  return (
    <section className="loading-block" aria-label="Loading videos">
      <div className="loading-copy">
        <TrendingUp size={20} aria-hidden="true" />
        <strong>Finding top videos</strong>
        <small>Checking views, likes, comments, and publish dates.</small>
      </div>
      <span />
      <span />
    </section>
  );
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function downloadSummaryFile(format, video, summary) {
  const response = await fetch(`${apiBase}/export-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format, video, summary })
  });

  if (!response.ok) {
    let message = 'Export failed.';
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // Keep default message when the response is not JSON.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `video-summary.${format}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatCount(value, label) {
  if (value === null || value === undefined) return `Hidden ${label}`;
  return `${Intl.NumberFormat('en', { maximumFractionDigits: 1, notation: 'compact' }).format(value)} ${label}`;
}

function formatOptionalCount(value, label) {
  if (value === null || value === undefined) return `Hidden ${label}`;
  return formatCount(value, label);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

function formatRange(days) {
  const option = rangeOptions.find((item) => item.value === days);
  return option?.label || '7 days';
}

function getViewsPerDay(video) {
  const publishedTime = new Date(video.publishedAt).getTime();
  const ageDays = Math.max((Date.now() - publishedTime) / (24 * 60 * 60 * 1000), 1);
  return Math.round(video.viewCount / ageDays);
}

function sortVideos(videoList, sortMode) {
  return [...videoList].sort((a, b) => {
    if (sortMode === 'newest') {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }

    if (sortMode === 'likes') {
      return (b.likeCount || 0) - (a.likeCount || 0);
    }

    if (sortMode === 'viewsPerDay') {
      return getViewsPerDay(b) - getViewsPerDay(a);
    }

    return b.viewCount - a.viewCount;
  });
}

createRoot(document.getElementById('root')).render(<App />);
