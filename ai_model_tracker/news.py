"""AI news fetching and categorization"""

import html
import re
import xml.etree.ElementTree as ET
from urllib.parse import urlencode
from fetcher import fetch_url


AI_NEWS_IMPORTANCE = {
    "daybreak": 60,
    "mythos": 60,
    "mdash": 60,
    "glasswing": 50,
    "openclaw": 50,
    "hermes agent": 50,
    "cybersecurity": 35,
    "vulnerability": 30,
    "security": 20,
    "agent": 25,
    "agents": 25,
    "autonomous": 20,
    "coding agent": 30,
    "openai": 20,
    "anthropic": 20,
    "claude": 18,
    "microsoft": 18,
    "deepmind": 18,
    "gemini": 18,
    "llama": 18,
    "deepseek": 18,
    "mistral": 18,
    "hugging face": 16,
    "model": 12,
    "models": 12,
    "launch": 12,
    "launches": 12,
    "release": 12,
    "releases": 12,
    "announces": 12,
    "open source": 12,
    "benchmark": 10,
    "research": 8
}


def parse_feed_items(content):
    """Parse RSS/Atom items while keeping each headline paired with its own link."""
    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        return []

    items = []
    for item in root.findall(".//item"):
        title_node = item.find("title")
        link_node = item.find("link")
        title = title_node.text if title_node is not None else ""
        link = link_node.text if link_node is not None else ""
        if title:
            items.append((html.unescape(title.strip()), (link or "").strip()))

    if items:
        return items

    atom_ns = {"atom": "http://www.w3.org/2005/Atom"}
    for entry in root.findall(".//atom:entry", atom_ns):
        title_node = entry.find("atom:title", atom_ns)
        link_node = entry.find("atom:link", atom_ns)
        title = title_node.text if title_node is not None else ""
        link = link_node.attrib.get("href", "") if link_node is not None else ""
        if title:
            items.append((html.unescape(title.strip()), link.strip()))

    return items


def clean_news_headline(value):
    """Remove publisher suffixes from RSS headlines."""
    title = re.sub(r"\s+", " ", html.unescape(value or "")).strip()
    if "â" in title or "€™" in title:
        try:
            title = title.encode("latin1").decode("utf-8")
        except UnicodeError:
            pass
    if " - " in title:
        title = title.rsplit(" - ", 1)[0].strip()

    pipe_parts = [part.strip() for part in title.split("|")]
    if len(pipe_parts) > 1:
        source_words = {"news", "ai", "security", "technology", "tech", "media", "sc media"}
        kept_parts = []
        for part in pipe_parts:
            normalized = part.lower()
            if normalized in source_words or normalized.endswith(" media"):
                continue
            kept_parts.append(part)
        if kept_parts:
            title = " | ".join(kept_parts).strip()

    return title


def score_news_item(item):
    text = f"{item.get('headline', '')} {item.get('category') or ''}".lower()
    score = 0
    for keyword, weight in AI_NEWS_IMPORTANCE.items():
        if keyword in text:
            score += weight
    if item.get("source", "").startswith("Google News"):
        score += 2
    return score


def fetch_ai_news():
    """Fetch latest AI news from multiple sources and categorize"""
    news_by_source = []
    seen_headlines = set()
    
    # Multiple RSS feeds from various AI news sources
    rss_feeds = [
        ("Google News AI", "https://news.google.com/rss/search?" + urlencode({"q": "artificial intelligence OR AI agent OR AI model when:2d", "hl": "en-US", "gl": "US", "ceid": "US:en"})),
        ("Google News AI Cybersecurity", "https://news.google.com/rss/search?" + urlencode({"q": "AI cybersecurity OR agentic security OR vulnerability discovery AI when:7d", "hl": "en-US", "gl": "US", "ceid": "US:en"})),
        ("Google News AI Agents", "https://news.google.com/rss/search?" + urlencode({"q": "AI agents OR autonomous AI agent OR coding agent when:7d", "hl": "en-US", "gl": "US", "ceid": "US:en"})),
        ("TechCrunch", "https://techcrunch.com/category/artificial-intelligence/feed/"),
        ("The Verge", "https://www.theverge.com/rss/index.xml"),
        ("O'Reilly Radar", "https://feeds.feedburner.com/oreilly/radar"),
        ("AI News", "https://www.artificialintelligence-news.com/feed/"),
        ("VentureBeat", "https://venturebeat.com/category/ai/feed/"),
        ("Wired", "https://www.wired.com/feed/category/ai/latest/rss"),
        ("MIT Technology Review", "https://www.technologyreview.com/topnews.rss"),
        ("arXiv AI", "https://arxiv.org/rss/cs.AI"),
        ("Hacker News", "https://hnrss.org/frontpage")
    ]
    
    for source, url in rss_feeds:
        content = fetch_url(url)
        if content and "Dell" not in content and "Access Denied" not in content and "<?xml" in content:
            print(f"  [News] Successfully fetched RSS from: {url}")
            source_items = []
            for title, link in parse_feed_items(content):
                # Skip if it's a feed title (contains common feed words)
                cleaned_title = clean_news_headline(title)
                if (cleaned_title and len(cleaned_title) > 10 and
                    "feed" not in cleaned_title.lower() and
                    "rss" not in cleaned_title.lower() and
                    "AI News" not in cleaned_title and
                    "Artificial Intelligence" not in cleaned_title and
                    is_ai_related(cleaned_title) and
                    cleaned_title not in seen_headlines):
                    # Categorize news
                    category = categorize_news(cleaned_title)
                    source_items.append({
                        "headline": cleaned_title,
                        "url": link.strip() if link else "",
                        "category": category,
                        "source": source
                    })
                    seen_headlines.add(cleaned_title)
                    if len(source_items) >= 20:
                        break

            if source_items:
                news_by_source.append(source_items)

    all_items = [item for source_items in news_by_source for item in source_items]
    all_items.sort(key=score_news_item, reverse=True)
    return all_items[:10]


def is_ai_related(headline):
    """Keep general-news feeds focused on AI-related headlines."""
    headline_lower = headline.lower()
    keywords = [
        "ai", "artificial intelligence", "openai", "chatgpt", "claude",
        "anthropic", "gemini", "deepseek", "grok", "llama", "qwen",
        "model", "agent", "agents", "nvidia", "machine learning",
        "neural", "robot", "automation", "codex", "cybersecurity",
        "vulnerability", "security", "mdash", "mythos", "daybreak"
    ]
    return any(keyword in headline_lower for keyword in keywords)


def categorize_news(headline):
    """Categorize news headline based on keywords"""
    headline_lower = headline.lower()
    
    # Product Launch keywords
    launch_keywords = ['launch', 'release', 'announces', 'introduces', 'unveils', 'launches', 'released', 'new model', 'new version']
    
    # Research keywords
    research_keywords = ['paper', 'research', 'study', 'arxiv', 'breakthrough', 'discovery', 'scientists', 'university']
    
    # Update keywords
    update_keywords = ['update', 'upgrade', 'improves', 'enhances', 'feature', 'capability']
    
    for keyword in launch_keywords:
        if keyword in headline_lower:
            return "Product Launch"
    
    for keyword in research_keywords:
        if keyword in headline_lower:
            return "Research"
    
    for keyword in update_keywords:
        if keyword in headline_lower:
            return "Update"
    
    return None  # Don't categorize if no match
