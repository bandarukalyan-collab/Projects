#!/usr/bin/env python3
"""AI Model Tracker - Daily checker for AI model updates"""

from datetime import datetime
from fetcher import build_platform_data
from news import fetch_ai_news
from state import load_config, load_state, save_state, log_changes, detect_changes
from email_sender import generate_html_email, send_email


def main():
    print(f"AI Model Tracker - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    # Load config and state
    config = load_config()
    old_state = load_state()
    
    # Build platform data dynamically from scraping
    AI_PLATFORMS, AI_CODING_TOOLS = build_platform_data()
    
    # Current data
    current_data = {
        "last_check": datetime.now().isoformat(),
        "platforms": AI_PLATFORMS,
        "coding_tools": AI_CODING_TOOLS
    }
    
    # Check if any data was scraped
    if not AI_PLATFORMS and not AI_CODING_TOOLS:
        print("WARNING: No data could be scraped from any platform. All websites may be blocking access.")
        print("Email will not be sent due to lack of data.")
        return
    
    print(f"\nSuccessfully scraped {len(AI_PLATFORMS)} platforms and {len(AI_CODING_TOOLS)} coding tools")
    
    # Detect changes
    changes = detect_changes(old_state, current_data)
    
    if changes:
        print(f"Found {len(changes)} changes:")
        for change in changes:
            print(f"  - {change['name']}: {change['field']} changed")
        # Log changes to history
        log_changes(changes)
    else:
        print("No changes detected")
    
    # Fetch AI news
    print("\nFetching AI news...")
    news_items = fetch_ai_news()
    if news_items:
        print(f"Found {len(news_items)} AI news items")
    else:
        print("No AI news found")
    
    # Generate email
    html_content = generate_html_email(changes, current_data, news_items)
    
    # Save preview for testing
    with open("email_preview.html", 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Email preview saved to email_preview.html")
    
    # Send email if enabled
    if config["email_enabled"]:
        print("\nSending email...")
        send_email(html_content, config, changes)
    else:
        print("\nEmail not enabled. Enable in config.json to send.")
    
    # Save state
    save_state(current_data)
    print("\nState saved. Run complete.")


if __name__ == "__main__":
    main()
