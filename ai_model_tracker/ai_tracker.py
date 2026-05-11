#!/usr/bin/env python3
"""AI Model Tracker - Daily checker for AI model updates"""

import json
import os
import requests
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

STATE_FILE = "ai_models_state.json"
CONFIG_FILE = "config.json"
EMAIL_TEMPLATE = "email_template.html"


def fetch_url(url):
    """Fetch URL content"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=30)
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None


def check_openai():
    """Check OpenAI models from docs"""
    content = fetch_url("https://platform.openai.com/docs/models")
    if not content:
        return None
    
    models = []
    if "GPT-5.5" in content or "5.5" in content:
        models.append("GPT-5.5")
    if "GPT-5" in content:
        models.append("GPT-5")
    if "GPT-4" in content:
        models.append("GPT-4")
    
    return {
        "latest_model": models[0] if models else "Unknown",
        "context_window": "~128K to 1M tokens (varies)"
    }


def check_anthropic():
    """Check Anthropic models from docs"""
    content = fetch_url("https://platform.claude.com/docs/en/about-claude/models/overview")
    if not content:
        return None
    
    models = []
    if "Opus 4.7" in content:
        models.append("Opus 4.7")
    if "Sonnet 4.6" in content:
        models.append("Sonnet 4.6")
    if "Opus 4.6" in content:
        models.append("Opus 4.6")
    
    context_window = "Up to ~1M tokens" if "1M" in content or "1 million" in content else "Unknown"
    
    return {
        "latest_model": models[0] if models else "Unknown",
        "context_window": context_window
    }


def check_google():
    """Check Google/Gemini models from docs"""
    content = fetch_url("https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models")
    if not content:
        return None
    
    models = []
    if "Gemini 3.1 Pro" in content:
        models.append("Gemini 3.1 Pro")
    if "Gemini 2.5 Pro" in content:
        models.append("Gemini 2.5 Pro")
    if "Gemini 3" in content:
        models.append("Gemini 3")
    
    context_window = "Up to ~1M-2M tokens" if "1 million" in content else "Unknown"
    
    return {
        "latest_model": models[0] if models else "Unknown",
        "context_window": context_window
    }


def check_deepseek():
    """Check DeepSeek models from docs"""
    content = fetch_url("https://api-docs.deepseek.com/quick_start/pricing")
    if not content:
        return None
    
    models = []
    if "V4 Pro" in content or "V4-Pro" in content:
        models.append("V4 Pro")
    if "V4 Flash" in content or "V4-Flash" in content:
        models.append("V4 Flash")
    
    context_window = "Up to ~1M tokens" if "1M" in content or "1 million" in content else "Unknown"
    
    return {
        "latest_model": models[0] if models else "Unknown",
        "context_window": context_window
    }


def check_xai():
    """Check xAI/Grok models from docs"""
    content = fetch_url("https://docs.x.ai/developers/models")
    if not content:
        return None
    
    models = []
    if "Grok 4.3" in content:
        models.append("Grok 4.3")
    if "Grok 4" in content:
        models.append("Grok 4")
    
    return {
        "latest_model": models[0] if models else "Unknown",
        "context_window": "~128K to 2M tokens"
    }


def check_meta():
    """Check Meta/Llama models from docs"""
    content = fetch_url("https://www.llama.com/models/llama-4/")
    if not content:
        return None
    
    models = []
    if "Llama 4 Maverick" in content:
        models.append("Llama 4 Maverick")
    if "Llama 4" in content:
        models.append("Llama 4")
    
    context_window = "Up to 10M tokens (model dependent)" if "10M" in content or "10 million" in content else "Unknown"
    
    return {
        "latest_model": models[0] if models else "Unknown",
        "context_window": context_window
    }


def check_perplexity():
    """Check Perplexity models from docs"""
    content = fetch_url("https://www.perplexity.ai/help-center/en/articles/10354919")
    if not content:
        return None
    
    return {
        "latest_model": "Sonar / Sonar Pro",
        "context_window": "~128K tokens"
    }


def check_windsurf():
    """Check Windsurf/Cascade models from docs"""
    content = fetch_url("https://docs.windsurf.com/windsurf/cascade/cascade")
    if not content:
        return None
    
    models = []
    if "SWE-1.6" in content:
        models.append("SWE-1.6")
    if "SWE-1.5" in content:
        models.append("SWE-1.5")
    
    return {
        "latest_model": models[0] if models else "Unknown",
        "context_window": "Not publicly listed"
    }


def check_cursor():
    """Check Cursor models from docs"""
    content = fetch_url("https://cursor.com/changelog")
    if not content:
        return None
    
    models = []
    if "GPT-5" in content:
        models.append("GPT-5")
    if "GPT-4" in content:
        models.append("GPT-4")
    if "Claude" in content:
        models.append("Claude")
    
    return {
        "latest_model": "Uses GPT / Claude" if models else "Uses GPT / Claude",
        "context_window": "Depends on selected model"
    }


def check_github_copilot():
    """Check GitHub Copilot models from docs"""
    content = fetch_url("https://docs.github.com/en/copilot")
    if not content:
        return None
    
    models = []
    if "GPT-5" in content:
        models.append("GPT-5")
    if "GPT-4" in content:
        models.append("GPT-4")
    if "Claude" in content:
        models.append("Claude")
    
    return {
        "latest_model": "GPT / Claude / others" if models else "GPT / Claude / others",
        "context_window": "Depends on selected model"
    }


def check_replit():
    """Check Replit Agent models from docs"""
    content = fetch_url("https://docs.replit.com/category/ai")
    if not content:
        return None
    
    return {
        "latest_model": "Replit AI models + others",
        "context_window": "Depends on selected model"
    }


def check_claude_code():
    """Check Claude Code models from docs"""
    content = fetch_url("https://platform.claude.com/docs/en/about-claude/models/overview")
    if not content:
        return None
    
    models = []
    if "Opus 4.7" in content:
        models.append("Opus 4.7")
    if "Sonnet 4.6" in content:
        models.append("Sonnet 4.6")
    if "Opus 4.6" in content:
        models.append("Opus 4.6")
    
    context_window = "Up to ~1M tokens" if "1M" in content or "1 million" in content else "Unknown"
    
    return {
        "latest_model": models[0] if models else "Claude Opus / Sonnet",
        "context_window": context_window
    }


def check_crewai():
    """Check CrewAI models from docs"""
    content = fetch_url("https://docs.crewai.com")
    if not content:
        return None
    
    return {
        "latest_model": "Model-agnostic",
        "context_window": "Depends on selected model"
    }


def update_platform_data():
    """Update platform data with scraped information"""
    print("Checking platform documentation for updates...")
    
    # Check OpenAI
    openai_data = check_openai()
    if openai_data:
        for platform in AI_PLATFORMS:
            if "OpenAI" in platform["name"]:
                platform["latest_model"] = openai_data["latest_model"]
                platform["context_window"] = openai_data["context_window"]
                print(f"  Updated OpenAI: {openai_data['latest_model']}")
    
    # Check Anthropic
    anthropic_data = check_anthropic()
    if anthropic_data:
        for platform in AI_PLATFORMS:
            if "Anthropic" in platform["name"]:
                platform["latest_model"] = anthropic_data["latest_model"]
                platform["context_window"] = anthropic_data["context_window"]
                print(f"  Updated Anthropic: {anthropic_data['latest_model']}")
    
    # Check Google
    google_data = check_google()
    if google_data:
        for platform in AI_PLATFORMS:
            if "Google" in platform["name"]:
                platform["latest_model"] = google_data["latest_model"]
                platform["context_window"] = google_data["context_window"]
                print(f"  Updated Google: {google_data['latest_model']}")
    
    # Check DeepSeek
    deepseek_data = check_deepseek()
    if deepseek_data:
        for platform in AI_PLATFORMS:
            if "DeepSeek" in platform["name"]:
                platform["latest_model"] = deepseek_data["latest_model"]
                platform["context_window"] = deepseek_data["context_window"]
                print(f"  Updated DeepSeek: {deepseek_data['latest_model']}")
    
    # Check xAI
    xai_data = check_xai()
    if xai_data:
        for platform in AI_PLATFORMS:
            if "xAI" in platform["name"]:
                platform["latest_model"] = xai_data["latest_model"]
                platform["context_window"] = xai_data["context_window"]
                print(f"  Updated xAI: {xai_data['latest_model']}")
    
    # Check Meta
    meta_data = check_meta()
    if meta_data:
        for platform in AI_PLATFORMS:
            if "Meta" in platform["name"]:
                platform["latest_model"] = meta_data["latest_model"]
                platform["context_window"] = meta_data["context_window"]
                print(f"  Updated Meta: {meta_data['latest_model']}")
    
    # Check Perplexity
    perplexity_data = check_perplexity()
    if perplexity_data:
        for platform in AI_PLATFORMS:
            if "Perplexity" in platform["name"]:
                platform["latest_model"] = perplexity_data["latest_model"]
                platform["context_window"] = perplexity_data["context_window"]
                print(f"  Updated Perplexity: {perplexity_data['latest_model']}")
    
    # Check Windsurf
    windsurf_data = check_windsurf()
    if windsurf_data:
        for tool in AI_CODING_TOOLS:
            if "Windsurf" in tool["name"]:
                tool["latest_model"] = windsurf_data["latest_model"]
                tool["context_window"] = windsurf_data["context_window"]
                print(f"  Updated Windsurf: {windsurf_data['latest_model']}")
    
    # Check Cursor
    cursor_data = check_cursor()
    if cursor_data:
        for tool in AI_CODING_TOOLS:
            if "Cursor" in tool["name"]:
                tool["latest_model"] = cursor_data["latest_model"]
                tool["context_window"] = cursor_data["context_window"]
                print(f"  Updated Cursor: {cursor_data['latest_model']}")
    
    # Check GitHub Copilot
    copilot_data = check_github_copilot()
    if copilot_data:
        for tool in AI_CODING_TOOLS:
            if "GitHub Copilot" in tool["name"]:
                tool["latest_model"] = copilot_data["latest_model"]
                tool["context_window"] = copilot_data["context_window"]
                print(f"  Updated GitHub Copilot: {copilot_data['latest_model']}")
    
    # Check Replit
    replit_data = check_replit()
    if replit_data:
        for tool in AI_CODING_TOOLS:
            if "Replit" in tool["name"]:
                tool["latest_model"] = replit_data["latest_model"]
                tool["context_window"] = replit_data["context_window"]
                print(f"  Updated Replit: {replit_data['latest_model']}")
    
    # Check Claude Code
    claude_code_data = check_claude_code()
    if claude_code_data:
        for tool in AI_CODING_TOOLS:
            if "Claude Code" in tool["name"]:
                tool["latest_model"] = claude_code_data["latest_model"]
                tool["context_window"] = claude_code_data["context_window"]
                print(f"  Updated Claude Code: {claude_code_data['latest_model']}")
    
    # Check CrewAI
    crewai_data = check_crewai()
    if crewai_data:
        for tool in AI_CODING_TOOLS:
            if "CrewAI" in tool["name"]:
                tool["latest_model"] = crewai_data["latest_model"]
                tool["context_window"] = crewai_data["context_window"]
                print(f"  Updated CrewAI: {crewai_data['latest_model']}")


# Static data for AI Platforms (from user's provided data)
AI_PLATFORMS = [
    {
        "name": "OpenAI (ChatGPT)",
        "type": "AI assistant",
        "latest_model": "GPT-5.5",
        "best_for": "All-purpose use, coding, research",
        "context_window": "~128K to 1M tokens (varies)",
        "max_output": "Depends on selected model",
        "notes": "Strong ecosystem, tools, memory, multimodal"
    },
    {
        "name": "Anthropic (Claude)",
        "type": "AI assistant",
        "latest_model": "Claude Opus 4.6 / Sonnet 4.x",
        "best_for": "Writing, long documents, coding",
        "context_window": "Up to ~1M tokens",
        "max_output": "Depends on selected model",
        "notes": "Known for safety and handling long context"
    },
    {
        "name": "Google (Gemini)",
        "type": "AI assistant",
        "latest_model": "Gemini 3.x Pro",
        "best_for": "Docs, Google apps, multimodal",
        "context_window": "Up to ~1M-2M tokens",
        "max_output": "Depends on selected model",
        "notes": "Best inside Google ecosystem"
    },
    {
        "name": "DeepSeek",
        "type": "AI model/platform",
        "latest_model": "DeepSeek V3 / V4",
        "best_for": "Low-cost coding, reasoning",
        "context_window": "Up to ~1M tokens",
        "max_output": "Depends on selected model",
        "notes": "Open-source option, data privacy caution"
    },
    {
        "name": "xAI (Grok)",
        "type": "AI assistant",
        "latest_model": "Grok-4.x",
        "best_for": "Real-time info, reasoning",
        "context_window": "~128K to 2M tokens",
        "max_output": "Depends on selected model",
        "notes": "Integrated with X (Twitter), less filtered"
    },
    {
        "name": "Meta (Meta AI)",
        "type": "AI assistant",
        "latest_model": "Llama 4 family",
        "best_for": "Social apps, open models",
        "context_window": "Up to 10M tokens (model dependent)",
        "max_output": "Not publicly listed",
        "notes": "Open-weight models, used via apps like WhatsApp"
    },
    {
        "name": "Perplexity AI",
        "type": "AI search assistant",
        "latest_model": "Sonar / Sonar Pro",
        "best_for": "Search + answers with sources",
        "context_window": "~128K tokens",
        "max_output": "Depends on selected model",
        "notes": "Best for factual queries with citations"
    }
]

# Static data for AI Coding Tools (from user's provided data)
AI_CODING_TOOLS = [
    {
        "name": "Cursor",
        "type": "AI IDE",
        "latest_model": "Uses GPT / Claude",
        "best_for": "Full project coding, editing",
        "context_window": "Depends on selected model",
        "max_output": "Depends on selected model",
        "notes": "Deep repo understanding, very popular"
    },
    {
        "name": "GitHub Copilot",
        "type": "AI coding assistant",
        "latest_model": "GPT / Claude / others",
        "best_for": "Auto-complete, inline coding",
        "context_window": "Depends on selected model",
        "max_output": "Depends on selected model",
        "notes": "Best for suggestions inside IDE"
    },
    {
        "name": "Replit (Agent)",
        "type": "AI coding agent",
        "latest_model": "Replit AI models + others",
        "best_for": "Build apps end-to-end",
        "context_window": "Depends on selected model",
        "max_output": "Depends on selected model",
        "notes": "Beginner-friendly, runs code in browser"
    },
    {
        "name": "Windsurf (Cascade)",
        "type": "AI IDE + agent",
        "latest_model": "SWE-1.6 (UI)",
        "best_for": "Autonomous coding workflows",
        "context_window": "Not publicly listed",
        "max_output": "Not publicly listed",
        "notes": "UI may show SWE-1.6 while docs still mention SWE-1.5"
    },
    {
        "name": "Claude Code",
        "type": "AI coding agent",
        "latest_model": "Claude Opus / Sonnet",
        "best_for": "Large codebases, refactoring",
        "context_window": "Up to ~1M tokens",
        "max_output": "Depends on selected model",
        "notes": "Strong at multi-file reasoning"
    },
    {
        "name": "CrewAI",
        "type": "Multi-agent framework",
        "latest_model": "Model-agnostic",
        "best_for": "Build AI agents/workflows",
        "context_window": "Depends on selected model",
        "max_output": "Depends on selected model",
        "notes": "Used for automation, orchestration"
    }
]


def load_config():
    """Load email configuration"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"email_enabled": False, "smtp_server": "smtp.gmail.com",
            "smtp_port": 587, "sender_email": "", "sender_password": "",
            "recipient_email": ""}


def load_state():
    """Load previous state"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"last_check": None, "platforms": [], "coding_tools": []}


def save_state(state):
    """Save current state"""
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def detect_changes(old_state, new_data):
    """Detect changes between old and new state"""
    changes = []
    
    # Check platform changes
    old_platforms = {p["name"]: p for p in old_state.get("platforms", [])}
    for new_platform in new_data["platforms"]:
        name = new_platform["name"]
        if name in old_platforms:
            old_platform = old_platforms[name]
            for key in ["latest_model", "context_window", "best_for", "max_output", "notes"]:
                if old_platform.get(key) != new_platform.get(key):
                    changes.append({
                        "type": "platform",
                        "name": name,
                        "field": key,
                        "old": old_platform.get(key),
                        "new": new_platform.get(key)
                    })
        else:
            changes.append({
                "type": "platform",
                "name": name,
                "field": "new",
                "old": "N/A",
                "new": "Added"
            })
    
    # Check coding tools changes
    old_tools = {t["name"]: t for t in old_state.get("coding_tools", [])}
    for new_tool in new_data["coding_tools"]:
        name = new_tool["name"]
        if name in old_tools:
            old_tool = old_tools[name]
            for key in ["latest_model", "context_window", "best_for", "max_output", "notes"]:
                if old_tool.get(key) != new_tool.get(key):
                    changes.append({
                        "type": "coding_tool",
                        "name": name,
                        "field": key,
                        "old": old_tool.get(key),
                        "new": new_tool.get(key)
                    })
        else:
            changes.append({
                "type": "coding_tool",
                "name": name,
                "field": "new",
                "old": "N/A",
                "new": "Added"
            })
    
    return changes


def generate_html_email(changes, current_data):
    """Generate HTML email content"""
    # Load template
    with open(EMAIL_TEMPLATE, 'r', encoding='utf-8') as f:
        template = f.read()
    
    date_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Generate platforms table rows
    platforms_rows = ""
    for platform in current_data["platforms"]:
        platforms_rows += f"""
        <tr>
            <td>{platform['name']}</td>
            <td>{platform['type']}</td>
            <td>{platform['latest_model']}</td>
            <td>{platform['best_for']}</td>
            <td>{platform['context_window']}</td>
            <td>{platform['notes']}</td>
        </tr>
        """
    
    # Generate coding tools table rows
    coding_tools_rows = ""
    for tool in current_data["coding_tools"]:
        coding_tools_rows += f"""
        <tr>
            <td>{tool['name']}</td>
            <td>{tool['type']}</td>
            <td>{tool['latest_model']}</td>
            <td>{tool['best_for']}</td>
            <td>{tool['context_window']}</td>
            <td>{tool['notes']}</td>
        </tr>
        """
    
    # Replace placeholders
    html_content = template.replace("{date}", date_str)
    html_content = html_content.replace("{platforms_table}", platforms_rows)
    html_content = html_content.replace("{coding_tools_table}", coding_tools_rows)
    
    return html_content


def send_email_outlook(html_content, config, changes):
    """Send HTML email using Outlook COM Object (for Dell mail)"""
    try:
        import win32com.client
        
        outlook = win32com.client.Dispatch("Outlook.Application")
        mail = outlook.CreateItem(0)  # 0 = MailItem
        
        mail.To = config.get("recipient_email", "")
        if config.get("cc_email"):
            mail.CC = config["cc_email"]
        
        # Dynamic subject based on changes
        subject_prefix = config.get("subject_prefix", "AI Model Tracker Update")
        date_str = datetime.now().strftime('%Y-%m-%d')
        
        if config.get("subject_include_changes", False) and changes:
            change_count = len(changes)
            subject = f"{subject_prefix} - {change_count} Change(s) Detected - {date_str}"
        else:
            subject = f"{subject_prefix} - {date_str}"
        
        mail.Subject = subject
        mail.HTMLBody = html_content
        
        mail.Send()
        print("Email sent successfully via Outlook")
        return True
    except ImportError:
        print("Error: pywin32 not installed. Run: pip install pywin32")
        return False
    except Exception as e:
        print(f"Error sending email via Outlook: {e}")
        return False


def send_email_smtp(html_content, config, changes):
    """Send HTML email using SMTP"""
    if not config["sender_email"] or not config["sender_password"]:
        print("Sender email or password not configured")
        return False
    
    try:
        msg = MIMEText(html_content, 'html')
        msg['From'] = config["sender_email"]
        msg['To'] = config["recipient_email"]
        
        # Dynamic subject based on changes
        subject_prefix = config.get("subject_prefix", "AI Model Tracker Update")
        date_str = datetime.now().strftime('%Y-%m-%d')
        
        if config.get("subject_include_changes", False) and changes:
            change_count = len(changes)
            msg['Subject'] = f"{subject_prefix} - {change_count} Change(s) Detected - {date_str}"
        else:
            msg['Subject'] = f"{subject_prefix} - {date_str}"
        
        server = smtplib.SMTP(config["smtp_server"], config["smtp_port"])
        server.starttls()
        server.login(config["sender_email"], config["sender_password"])
        server.send_message(msg)
        server.quit()
        
        print("Email sent successfully via SMTP")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_email(html_content, config, changes):
    """Send HTML email using configured method"""
    if not config["email_enabled"]:
        print("Email not enabled in config")
        return False
    
    # Use Outlook if configured, otherwise use SMTP
    if config.get("use_outlook", False):
        return send_email_outlook(html_content, config, changes)
    else:
        return send_email_smtp(html_content, config, changes)


def main():
    print(f"AI Model Tracker - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    # Load config and state
    config = load_config()
    old_state = load_state()
    
    # Update platform data with scraped information
    update_platform_data()
    
    # Current data
    current_data = {
        "last_check": datetime.now().isoformat(),
        "platforms": AI_PLATFORMS,
        "coding_tools": AI_CODING_TOOLS
    }
    
    # Detect changes
    changes = detect_changes(old_state, current_data)
    
    if changes:
        print(f"Found {len(changes)} changes:")
        for change in changes:
            print(f"  - {change['name']}: {change['field']} changed")
    else:
        print("No changes detected")
    
    # Generate email
    html_content = generate_html_email(changes, current_data)
    
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
