"""AI news fetching and categorization"""

import html
import re
import xml.etree.ElementTree as ET
from fetcher import fetch_url


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


def fetch_ai_news():
    """Fetch latest AI news from multiple sources and categorize"""
    news_by_source = []
    seen_headlines = set()
    
    # Multiple RSS feeds from various AI news sources
    rss_feeds = [
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
                cleaned_title = title.strip()
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
                    if len(source_items) >= 5:
                        break

            if source_items:
                news_by_source.append(source_items)

    # Round-robin sources so one feed cannot dominate the daily top 10.
    mixed_items = []
    index = 0
    while len(mixed_items) < 10:
        added_this_round = False
        for source_items in news_by_source:
            if index < len(source_items):
                mixed_items.append(source_items[index])
                added_this_round = True
                if len(mixed_items) >= 10:
                    break
        if not added_this_round:
            break
        index += 1

    return mixed_items


def is_ai_related(headline):
    """Keep general-news feeds focused on AI-related headlines."""
    headline_lower = headline.lower()
    keywords = [
        "ai", "artificial intelligence", "openai", "chatgpt", "claude",
        "anthropic", "gemini", "deepseek", "grok", "llama", "qwen",
        "model", "agent", "agents", "nvidia", "machine learning",
        "neural", "robot", "automation", "codex"
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
