"""AI news fetching and categorization"""

import re
from fetcher import fetch_url


def fetch_ai_news():
    """Fetch latest AI news from multiple sources and categorize"""
    news_items = []
    
    # Multiple RSS feeds from various AI news sources
    rss_urls = [
        "https://techcrunch.com/category/artificial-intelligence/feed/",
        "https://www.theverge.com/rss/index.xml",
        "https://feeds.feedburner.com/oreilly/radar",
        "https://www.artificialintelligence-news.com/feed/",
        "https://venturebeat.com/category/ai/feed/",
        "https://www.wired.com/feed/category/ai/latest/rss",
        "https://www.technologyreview.com/topnews.rss",
        "https://arxiv.org/rss/cs.AI",  # AI research papers
        "https://hnrss.org/frontpage"  # Hacker News (tech news)
    ]
    
    for url in rss_urls:
        content = fetch_url(url)
        if content and "Dell" not in content and "Access Denied" not in content and "<?xml" in content:
            print(f"  [News] Successfully fetched RSS from: {url}")
            # Parse RSS - extract all titles and links separately
            titles = re.findall(r'<title>([^<]+)</title>', content)
            links = re.findall(r'<link[^>]*>([^<]+)</link>', content)
            
            # Pair titles with links (skip first title which is feed title)
            for i in range(1, min(len(titles), len(links))):  # Skip index 0 (feed title)
                title = titles[i]
                link = links[i-1] if i-1 < len(links) else ""
                
                # Skip if it's a feed title (contains common feed words)
                if (title and len(title.strip()) > 10 and 
                    "feed" not in title.lower() and 
                    "rss" not in title.lower() and
                    "AI News" not in title and
                    "Artificial Intelligence" not in title and
                    title.strip() not in [item['headline'] for item in news_items]):
                    # Categorize news
                    category = categorize_news(title.strip())
                    news_items.append({
                        "headline": title.strip(),
                        "url": link.strip() if link else "",
                        "category": category
                    })
                    if len(news_items) >= 20:  # Get more items from all sources, then trim to 10
                        break
    
    # Return top 10 from all sources combined (diverse mix)
    return news_items[:10]


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
