"""Platform data fetching functions"""

import requests
import urllib3
import time
import re
import json
from bs4 import BeautifulSoup

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def has_model(text, *patterns):
    """Return True when a model-like token is present as a complete phrase."""
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in patterns)


def make_result(latest_model, context_window, source_url):
    """Attach source and review status metadata to scraped model data."""
    needs_review = latest_model in {"Unknown", "Not publicly listed", "Depends on selected model", "Varies by model", "N/A"}
    return {
        "latest_model": latest_model,
        "context_window": context_window,
        "source_url": source_url or "",
        "status": "Needs review" if needs_review else "Verified"
    }


def make_fallback_result(latest_model, context_window, source_url):
    """Use a curated official-doc fallback when live extraction is blocked."""
    return {
        "latest_model": latest_model,
        "context_window": context_window,
        "source_url": source_url or "",
        "status": "Needs review"
    }

def fetch_url(url, max_retries=3, retry_delay=2):
    """Fetch URL content with retry mechanism"""
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=30, verify=False)
            if response.status_code == 200:
                return response.text
            else:
                print(f"  [Attempt {attempt + 1}/{max_retries}] HTTP {response.status_code} for {url}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
        except requests.exceptions.Timeout:
            print(f"  [Attempt {attempt + 1}/{max_retries}] Timeout for {url}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        except requests.exceptions.ConnectionError:
            print(f"  [Attempt {attempt + 1}/{max_retries}] Connection error for {url}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        except Exception as e:
            print(f"  [Attempt {attempt + 1}/{max_retries}] Error fetching {url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
    
    print(f"  Failed to fetch {url} after {max_retries} attempts")
    return None


def check_openai():
    """Check OpenAI models from docs"""
    try:
        # Try multiple URLs with alternatives (no authentication required)
        urls = [
            "https://platform.openai.com/docs/models",
            "https://openai.com/pricing",
            "https://openai.com/blog",
            "https://openai.com/api",
            "https://openai.com/products",
            "https://status.openai.com",
            "https://github.com/openai/openai-quickstart",
            "https://github.com/openai/openai-cookbook",
            "https://help.openai.com/en/articles",
            "https://github.com/openai/openai-python"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [OpenAI] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        # Look for various patterns of model versions
        if has_model(text_content, r"\bgpt[-\s]?5\.5\b"):
            models.append("GPT-5.5")
        if has_model(text_content, r"\bgpt[-\s]?5\b"):
            models.append("GPT-5")
        if has_model(text_content, r"\bgpt[-\s]?4\.1\b"):
            models.append("GPT-4.1")
        if has_model(text_content, r"\bgpt[-\s]?4\b"):
            models.append("GPT-4")
        if has_model(text_content, r"\bo1\b", r"\bo-1\b"):
            models.append("o1")
        latest_model = models[0] if models else "Unknown"
        if latest_model == "Unknown":
            return make_fallback_result(
                "GPT-5.5",
                "~128K to 1M tokens (varies)",
                "https://openai.com/index/introducing-gpt-5-5/"
            )
        return make_result(latest_model, "~128K to 1M tokens (varies)", source_url)
    except Exception as e:
        print(f"  [OpenAI] Error during check: {e}")
        return None


def check_anthropic():
    """Check Anthropic models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://platform.claude.com/docs/en/about-claude/models/overview",
            "https://www.anthropic.com",
            "https://claude.ai"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Anthropic] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if has_model(text_content, r"\bopus\s+4\.7\b", r"\bclaude\s+opus\s+4\.7\b"):
            models.append("Opus 4.7")
        if has_model(text_content, r"\bsonnet\s+4\.6\b", r"\bclaude\s+sonnet\s+4\.6\b"):
            models.append("Sonnet 4.6")
        if has_model(text_content, r"\bopus\s+4\.6\b", r"\bclaude\s+opus\s+4\.6\b"):
            models.append("Opus 4.6")
        if has_model(text_content, r"\bclaude\s+4\b"):
            models.append("Claude 4")
        
        context_window = "Up to ~1M tokens" if "1m" in text_content or "1 million" in text_content else ("Up to ~200K tokens" if "200k" in text_content or "200,000" in text_content else "Unknown")
        
        if not models:
            return make_fallback_result(
                "Claude Opus 4.7 / Sonnet 4.6",
                "Up to ~1M tokens",
                "https://www.anthropic.com/claude/opus"
            )
        return make_result(models[0], context_window, source_url)
    except Exception as e:
        print(f"  [Anthropic] Error during check: {e}")
        return None


def check_google():
    """Check Google/Gemini models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models",
            "https://ai.google.dev",
            "https://blog.google"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Google] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if has_model(text_content, r"\bgemini\s+3\.1\s+pro\b"):
            models.append("Gemini 3.1 Pro")
        if has_model(text_content, r"\bgemini\s+2\.5\s+pro\b"):
            models.append("Gemini 2.5 Pro")
        if has_model(text_content, r"\bgemini\s+3\b"):
            models.append("Gemini 3")
        if has_model(text_content, r"\bgemini\s+2\.0\b"):
            models.append("Gemini 2.0")
        if has_model(text_content, r"\bgemini\s+1\.5\b"):
            models.append("Gemini 1.5")
        
        context_window = "Up to ~1M-2M tokens" if "1 million" in text_content else "Unknown"
        
        return make_result(models[0] if models else "Unknown", context_window, source_url)
    except Exception as e:
        print(f"  [Google] Error during check: {e}")
        return None


def check_deepseek():
    """Check DeepSeek models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://api-docs.deepseek.com/quick_start/pricing",
            "https://www.deepseek.com",
            "https://github.com/deepseek-ai"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content and "Traffic Denied" not in content:
                print(f"  [DeepSeek] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content or "Traffic Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if has_model(text_content, r"\bdeepseek[-\s]?v4[-\s]?pro\b", r"\bv4[-\s]?pro\b"):
            models.append("V4 Pro")
        if has_model(text_content, r"\bdeepseek[-\s]?v4[-\s]?flash\b", r"\bv4[-\s]?flash\b"):
            models.append("V4 Flash")
        if has_model(text_content, r"\bdeepseek[-\s]?v3\b", r"\bv3\b"):
            models.append("V3")
        if has_model(text_content, r"\bdeepseek[-\s]?r1\b", r"\br1\b"):
            models.append("R1")
        
        context_window = "Up to ~128K tokens" if "128k" in text_content or "128,000" in text_content else ("Up to ~1M tokens" if "1m" in text_content or "1 million" in text_content else "Up to ~64K tokens")
        
        return make_result(models[0] if models else "Unknown", context_window, source_url)
    except Exception as e:
        print(f"  [DeepSeek] Error during check: {e}")
        return None


def check_xai():
    """Check xAI/Grok models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.x.ai/developers/models",
            "https://x.ai",
            "https://grok.x.ai"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [xAI] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if has_model(text_content, r"\bgrok\s+4\.3\b", r"\bgrok-4\.3\b"):
            models.append("Grok 4.3")
        if has_model(text_content, r"\bgrok\s+4\b", r"\bgrok-4\b"):
            models.append("Grok 4")
        if has_model(text_content, r"\bgrok\s+3\b", r"\bgrok-3\b"):
            models.append("Grok 3")
        if has_model(text_content, r"\bgrok\s+2\b", r"\bgrok-2\b"):
            models.append("Grok 2")
        
        return make_result(models[0] if models else "Unknown", "~128K to 2M tokens", source_url)
    except Exception as e:
        print(f"  [xAI] Error during check: {e}")
        return None


def check_meta():
    """Check Meta/Llama models from docs"""
    try:
        source_url = "https://www.llama.com/models/llama-4/"
        content = fetch_url(source_url)
        if not content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if "llama 4 maverick" in text_content:
            models.append("Llama 4 Maverick")
        if "llama 4" in text_content:
            models.append("Llama 4")
        
        context_window = "Up to 10M tokens (model dependent)" if "10m" in text_content or "10 million" in text_content else "Unknown"
        
        return make_result(models[0] if models else "Unknown", context_window, source_url)
    except Exception as e:
        print(f"  [Meta] Error during check: {e}")
        return None


def check_perplexity():
    """Check Perplexity models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://www.perplexity.ai/help-center/en/articles/10354919",
            "https://www.perplexity.ai",
            "https://blog.perplexity.ai"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Perplexity] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        return make_result("Sonar / Sonar Pro", "~128K tokens", source_url)
    except Exception as e:
        print(f"  [Perplexity] Error during check: {e}")
        return None


def check_windsurf():
    """Check Windsurf/Cascade models from docs"""
    try:
        # Try multiple URLs (no authentication required)
        urls = [
            "https://docs.windsurf.com/windsurf/cascade/cascade",
            "https://docs.windsurf.com",
            "https://windsurf.com",
            "https://github.com/WindsurfHQ/windsurf",
            "https://github.com/WindsurfHQ/windsurf/blob/main/README.md",
            "https://windsurf.com/changelog"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Windsurf] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        # Look for various patterns of model versions
        if "swe-1.6" in text_content or "swe 1.6" in text_content or "swe1.6" in text_content:
            models.append("SWE-1.6")
        if "swe-1.5" in text_content or "swe 1.5" in text_content or "swe1.5" in text_content:
            models.append("SWE-1.5")
        if "cascade" in text_content:
            models.append("Cascade")
        if "windsurf" in text_content and not models:
            models.append("Windsurf")
        
        return make_result(models[0] if models else "Unknown", "Not publicly listed", source_url)
    except Exception as e:
        print(f"  [Windsurf] Error during check: {e}")
        return None


def check_cursor():
    """Check Cursor models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://cursor.com/changelog",
            "https://cursor.com",
            "https://docs.cursor.sh"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Cursor] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if "gpt-5" in text_content:
            models.append("GPT-5")
        if "gpt-4" in text_content:
            models.append("GPT-4")
        if "claude" in text_content:
            models.append("Claude")
        
        return make_result("Uses GPT / Claude" if models else "Uses GPT / Claude", "Depends on selected model", source_url)
    except Exception as e:
        print(f"  [Cursor] Error during check: {e}")
        return None


def check_github_copilot():
    """Check GitHub Copilot models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.github.com/en/copilot",
            "https://github.com/features/copilot",
            "https://github.blog"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [GitHub Copilot] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if "gpt-5" in text_content:
            models.append("GPT-5")
        if "gpt-4" in text_content:
            models.append("GPT-4")
        if "claude" in text_content:
            models.append("Claude")
        
        return make_result("GPT / Claude / others" if models else "GPT / Claude / others", "Depends on selected model", source_url)
    except Exception as e:
        print(f"  [GitHub Copilot] Error during check: {e}")
        return None


def check_replit():
    """Check Replit Agent models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.replit.com/category/ai",
            "https://replit.com",
            "https://blog.replit.com"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Replit] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        return make_result("Replit AI models + others", "Depends on selected model", source_url)
    except Exception as e:
        print(f"  [Replit] Error during check: {e}")
        return None


def check_claude_code():
    """Check Claude Code models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://platform.claude.com/docs/en/about-claude/models/overview",
            "https://claude.ai",
            "https://anthropic.com"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Claude Code] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if has_model(text_content, r"\bopus\s+4\.7\b", r"\bclaude\s+opus\s+4\.7\b"):
            models.append("Opus 4.7")
        if has_model(text_content, r"\bsonnet\s+4\.6\b", r"\bclaude\s+sonnet\s+4\.6\b"):
            models.append("Sonnet 4.6")
        if has_model(text_content, r"\bopus\s+4\.6\b", r"\bclaude\s+opus\s+4\.6\b"):
            models.append("Opus 4.6")
        
        context_window = "Up to ~1M tokens" if "1m" in text_content or "1 million" in text_content else ("Up to ~200K tokens" if "200k" in text_content or "200,000" in text_content else "Unknown")
        
        return make_result(models[0] if models else "Claude Opus / Sonnet", context_window, source_url)
    except Exception as e:
        print(f"  [Claude Code] Error during check: {e}")
        return None


def check_crewai():
    """Check CrewAI from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.crewai.com",
            "https://github.com/crewAIInc/crewAI"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [CrewAI] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        return make_result("Model-agnostic", "Depends on selected model", source_url)
    except Exception as e:
        print(f"  [CrewAI] Error during check: {e}")
        return None


def check_cohere():
    """Check Cohere models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.cohere.com/docs/models",
            "https://cohere.com",
            "https://docs.cohere.com"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Cohere] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if "command r+" in text_content or "command r plus" in text_content:
            models.append("Command R+")
        if "command r" in text_content:
            models.append("Command R")
        if "command" in text_content:
            models.append("Command")
        
        context_window = "Up to ~128K tokens" if "128k" in text_content or "128,000" in text_content else "Up to ~4K tokens"
        
        return make_result(models[0] if models else "Command", context_window, source_url)
    except Exception as e:
        print(f"  [Cohere] Error during check: {e}")
        return None


def check_mistral():
    """Check Mistral AI models from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.mistral.ai/platform/models/",
            "https://mistral.ai",
            "https://docs.mistral.ai"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Mistral] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        models = []
        if "mistral large" in text_content:
            models.append("Mistral Large")
        if "mixtral" in text_content:
            models.append("Mixtral")
        if "mistral 7b" in text_content:
            models.append("Mistral 7B")
        
        context_window = "Up to ~128K tokens" if "128k" in text_content or "128,000" in text_content else "Up to ~32K tokens"
        
        return make_result(models[0] if models else "Mistral", context_window, source_url)
    except Exception as e:
        print(f"  [Mistral] Error during check: {e}")
        return None


def check_huggingface():
    """Check Hugging Face from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://huggingface.co/docs",
            "https://huggingface.co/models",
            "https://huggingface.co"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Hugging Face] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        return make_result("Model hub (hosts 100K+ models)", "Varies by model", source_url)
    except Exception as e:
        print(f"  [Hugging Face] Error during check: {e}")
        return None


def check_amazon_bedrock():
    """Check Amazon Bedrock model platform from AWS docs"""
    try:
        urls = [
            "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html",
            "https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html"
        ]

        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Amazon Bedrock] Successfully fetched from: {url}")
                source_url = url
                break

        if not content or "Dell" in content or "Access Denied" in content:
            return None

        return make_result("Claude / Llama / Amazon Nova / Mistral", "Varies by model", source_url)
    except Exception as e:
        print(f"  [Amazon Bedrock] Error during check: {e}")
        return None


def check_azure_ai_foundry():
    """Check Azure AI Foundry model catalog from Microsoft docs"""
    try:
        urls = [
            "https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models",
            "https://azure.microsoft.com/en-us/products/ai-model-catalog"
        ]

        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Azure AI Foundry] Successfully fetched from: {url}")
                source_url = url
                break

        if not content or "Dell" in content or "Access Denied" in content:
            return None

        return make_result("OpenAI / Phi / Llama / Mistral / DeepSeek", "Varies by model", source_url)
    except Exception as e:
        print(f"  [Azure AI Foundry] Error during check: {e}")
        return None


def check_openrouter():
    """Check OpenRouter models from public docs"""
    try:
        urls = [
            "https://openrouter.ai/api/v1/models",
            "https://openrouter.ai/docs/guides/overview/models"
        ]

        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [OpenRouter] Successfully fetched from: {url}")
                source_url = url
                break

        if not content or "Dell" in content or "Access Denied" in content:
            return None

        latest_model = "Multi-provider model API"
        if source_url and source_url.endswith("/api/v1/models"):
            try:
                model_data = json.loads(content)
                models = model_data.get("data", [])
                dated_models = [m for m in models if m.get("created")]
                if dated_models:
                    newest = max(dated_models, key=lambda m: m.get("created", 0))
                    latest_model = newest.get("name") or newest.get("id") or latest_model
            except (json.JSONDecodeError, AttributeError, TypeError):
                pass

        return make_result(latest_model, "Varies by model", source_url)
    except Exception as e:
        print(f"  [OpenRouter] Error during check: {e}")
        return None


def check_qwen():
    """Check Alibaba Qwen model platform from official sources"""
    try:
        urls = [
            "https://modelstudio.alibabacloud.com/",
            "https://qwen.ai",
            "https://github.com/QwenLM/Qwen",
            "https://www.alibabacloud.com/help/en/model-studio"
        ]

        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Qwen] Successfully fetched from: {url}")
                source_url = url
                break

        if not content or "Dell" in content or "Access Denied" in content:
            return None

        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()

        models = []
        if has_model(text_content, r"\bqwen3\.6\b", r"\bqwen\s+3\.6\b"):
            models.append("Qwen3.6")
        if has_model(text_content, r"\bqwen3\.5\b", r"\bqwen\s+3\.5\b"):
            models.append("Qwen3.5")
        if has_model(text_content, r"\bqwen3\b", r"\bqwen\s+3\b"):
            models.append("Qwen3")
        if has_model(text_content, r"\bqwen2\.5\b", r"\bqwen\s+2\.5\b"):
            models.append("Qwen2.5")

        return make_result(models[0] if models else "Qwen model family", "Varies by model", source_url)
    except Exception as e:
        print(f"  [Qwen] Error during check: {e}")
        return None


def check_tabnine():
    """Check Tabnine from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.tabnine.com",
            "https://tabnine.com"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Tabnine] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        return make_result("Tabnine AI models", "Depends on selected model", source_url)
    except Exception as e:
        print(f"  [Tabnine] Error during check: {e}")
        return None


def check_codeium():
    """Check Codeium from docs"""
    try:
        # Try multiple URLs
        urls = [
            "https://docs.codeium.com",
            "https://codeium.com"
        ]
        
        content = None
        source_url = None
        for url in urls:
            content = fetch_url(url)
            if content and "Dell" not in content and "Access Denied" not in content:
                print(f"  [Codeium] Successfully fetched from: {url}")
                source_url = url
                break
        
        if not content or "Dell" in content or "Access Denied" in content:
            return None
        
        # Use BeautifulSoup for more robust parsing
        soup = BeautifulSoup(content, 'html.parser')
        text_content = soup.get_text().lower()
        
        return make_result("Codeium AI models", "Depends on selected model", source_url)
    except Exception as e:
        print(f"  [Codeium] Error during check: {e}")
        return None


def build_platform_data():
    """Build platform data dynamically from scraping"""
    print("Building platform data from live scraping...")
    
    AI_PLATFORMS = []
    AI_CODING_TOOLS = []
    
    # Check OpenAI
    openai_data = check_openai()
    if openai_data:
        AI_PLATFORMS.append({
            "name": "OpenAI (ChatGPT)",
            "type": "AI assistant",
            "latest_model": openai_data["latest_model"],
            "best_for": "All-purpose use, coding, research",
            "context_window": openai_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Strong ecosystem, tools, memory, multimodal",
            "source_url": openai_data.get("source_url", ""),
            "status": openai_data.get("status", "Needs review")
        })
        print(f"  Added OpenAI: {openai_data['latest_model']}")
    
    # Check Anthropic
    anthropic_data = check_anthropic()
    if anthropic_data:
        AI_PLATFORMS.append({
            "name": "Anthropic (Claude)",
            "type": "AI assistant",
            "latest_model": anthropic_data["latest_model"],
            "best_for": "Writing, long documents, coding",
            "context_window": anthropic_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Known for safety and handling long context",
            "source_url": anthropic_data.get("source_url", ""),
            "status": anthropic_data.get("status", "Needs review")
        })
        print(f"  Added Anthropic: {anthropic_data['latest_model']}")
    
    # Check Google
    google_data = check_google()
    if google_data:
        AI_PLATFORMS.append({
            "name": "Google (Gemini)",
            "type": "AI assistant",
            "latest_model": google_data["latest_model"],
            "best_for": "Docs, Google apps, multimodal",
            "context_window": google_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Best inside Google ecosystem",
            "source_url": google_data.get("source_url", ""),
            "status": google_data.get("status", "Needs review")
        })
        print(f"  Added Google: {google_data['latest_model']}")
    
    # Check DeepSeek
    deepseek_data = check_deepseek()
    if deepseek_data:
        AI_PLATFORMS.append({
            "name": "DeepSeek",
            "type": "AI model/platform",
            "latest_model": deepseek_data["latest_model"],
            "best_for": "Low-cost coding, reasoning",
            "context_window": deepseek_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Open-source option, data privacy caution",
            "source_url": deepseek_data.get("source_url", ""),
            "status": deepseek_data.get("status", "Needs review")
        })
        print(f"  Added DeepSeek: {deepseek_data['latest_model']}")
    
    # Check xAI
    xai_data = check_xai()
    if xai_data:
        AI_PLATFORMS.append({
            "name": "xAI (Grok)",
            "type": "AI assistant",
            "latest_model": xai_data["latest_model"],
            "best_for": "Real-time info, reasoning",
            "context_window": xai_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Integrated with X (Twitter), less filtered",
            "source_url": xai_data.get("source_url", ""),
            "status": xai_data.get("status", "Needs review")
        })
        print(f"  Added xAI: {xai_data['latest_model']}")
    
    # Check Meta
    meta_data = check_meta()
    if meta_data:
        AI_PLATFORMS.append({
            "name": "Meta (Meta AI)",
            "type": "AI assistant",
            "latest_model": meta_data["latest_model"],
            "best_for": "Social apps, open models",
            "context_window": meta_data["context_window"],
            "max_output": "Not publicly listed",
            "notes": "Open-weight models, used via apps like WhatsApp",
            "source_url": meta_data.get("source_url", ""),
            "status": meta_data.get("status", "Needs review")
        })
        print(f"  Added Meta: {meta_data['latest_model']}")
    
    # Check Perplexity
    perplexity_data = check_perplexity()
    if perplexity_data:
        AI_PLATFORMS.append({
            "name": "Perplexity",
            "type": "AI assistant",
            "latest_model": perplexity_data["latest_model"],
            "best_for": "Search with AI citations",
            "context_window": perplexity_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "AI-powered search engine",
            "source_url": perplexity_data.get("source_url", ""),
            "status": perplexity_data.get("status", "Needs review")
        })
        print(f"  Added Perplexity: {perplexity_data['latest_model']}")
    
    # Check Cohere
    cohere_data = check_cohere()
    if cohere_data:
        AI_PLATFORMS.append({
            "name": "Cohere",
            "type": "AI assistant",
            "latest_model": cohere_data["latest_model"],
            "best_for": "Enterprise use, text generation, search",
            "context_window": cohere_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Focus on enterprise applications and APIs",
            "source_url": cohere_data.get("source_url", ""),
            "status": cohere_data.get("status", "Needs review")
        })
        print(f"  Added Cohere: {cohere_data['latest_model']}")
    
    # Check Mistral
    mistral_data = check_mistral()
    if mistral_data:
        AI_PLATFORMS.append({
            "name": "Mistral AI",
            "type": "AI model/platform",
            "latest_model": mistral_data["latest_model"],
            "best_for": "Open-source models, enterprise",
            "context_window": mistral_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Popular open-source models, strong performance",
            "source_url": mistral_data.get("source_url", ""),
            "status": mistral_data.get("status", "Needs review")
        })
        print(f"  Added Mistral: {mistral_data['latest_model']}")
    
    # Check Hugging Face
    huggingface_data = check_huggingface()
    if huggingface_data:
        AI_PLATFORMS.append({
            "name": "Hugging Face",
            "type": "AI model hub",
            "latest_model": huggingface_data["latest_model"],
            "best_for": "Model discovery, hosting, deployment",
            "context_window": huggingface_data["context_window"],
            "max_output": "Varies by model",
            "notes": "Central hub for AI models and datasets",
            "source_url": huggingface_data.get("source_url", ""),
            "status": huggingface_data.get("status", "Needs review")
        })
        print(f"  Added Hugging Face: {huggingface_data['latest_model']}")

    # Check Amazon Bedrock
    bedrock_data = check_amazon_bedrock()
    if bedrock_data:
        AI_PLATFORMS.append({
            "name": "Amazon Bedrock",
            "type": "AI model platform",
            "latest_model": bedrock_data["latest_model"],
            "best_for": "Enterprise AWS deployments",
            "context_window": bedrock_data["context_window"],
            "max_output": "Varies by model",
            "notes": "Managed access to foundation models on AWS",
            "source_url": bedrock_data.get("source_url", ""),
            "status": bedrock_data.get("status", "Needs review")
        })
        print(f"  Added Amazon Bedrock: {bedrock_data['latest_model']}")

    # Check Azure AI Foundry
    azure_data = check_azure_ai_foundry()
    if azure_data:
        AI_PLATFORMS.append({
            "name": "Azure AI Foundry",
            "type": "AI model platform",
            "latest_model": azure_data["latest_model"],
            "best_for": "Enterprise Azure deployments",
            "context_window": azure_data["context_window"],
            "max_output": "Varies by model",
            "notes": "Microsoft model catalog and deployment platform",
            "source_url": azure_data.get("source_url", ""),
            "status": azure_data.get("status", "Needs review")
        })
        print(f"  Added Azure AI Foundry: {azure_data['latest_model']}")

    # Check OpenRouter
    openrouter_data = check_openrouter()
    if openrouter_data:
        AI_PLATFORMS.append({
            "name": "OpenRouter",
            "type": "AI model router",
            "latest_model": openrouter_data["latest_model"],
            "best_for": "One API for many providers",
            "context_window": openrouter_data["context_window"],
            "max_output": "Varies by model",
            "notes": "Model routing and provider comparison",
            "source_url": openrouter_data.get("source_url", ""),
            "status": openrouter_data.get("status", "Needs review")
        })
        print(f"  Added OpenRouter: {openrouter_data['latest_model']}")

    # Check Qwen
    qwen_data = check_qwen()
    if qwen_data:
        AI_PLATFORMS.append({
            "name": "Alibaba Qwen",
            "type": "AI model/platform",
            "latest_model": qwen_data["latest_model"],
            "best_for": "Open models, multilingual use",
            "context_window": qwen_data["context_window"],
            "max_output": "Varies by model",
            "notes": "Alibaba's Qwen model family",
            "source_url": qwen_data.get("source_url", ""),
            "status": qwen_data.get("status", "Needs review")
        })
        print(f"  Added Qwen: {qwen_data['latest_model']}")
    
    # Check Windsurf
    windsurf_data = check_windsurf()
    if windsurf_data:
        AI_CODING_TOOLS.append({
            "name": "Windsurf (Cascade)",
            "type": "AI IDE + agent",
            "latest_model": windsurf_data["latest_model"],
            "best_for": "Autonomous coding workflows",
            "context_window": windsurf_data["context_window"],
            "max_output": "Not publicly listed",
            "notes": "AI-powered IDE with agent capabilities",
            "source_url": windsurf_data.get("source_url", ""),
            "status": windsurf_data.get("status", "Needs review")
        })
        print(f"  Added Windsurf: {windsurf_data['latest_model']}")
    
    # Check Cursor
    cursor_data = check_cursor()
    if cursor_data:
        AI_CODING_TOOLS.append({
            "name": "Cursor",
            "type": "AI IDE",
            "latest_model": cursor_data["latest_model"],
            "best_for": "Full project coding, editing",
            "context_window": cursor_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Deep repo understanding, very popular",
            "source_url": cursor_data.get("source_url", ""),
            "status": cursor_data.get("status", "Needs review")
        })
        print(f"  Added Cursor: {cursor_data['latest_model']}")
    
    # Check GitHub Copilot
    copilot_data = check_github_copilot()
    if copilot_data:
        AI_CODING_TOOLS.append({
            "name": "GitHub Copilot",
            "type": "AI coding assistant",
            "latest_model": copilot_data["latest_model"],
            "best_for": "Auto-complete, inline coding",
            "context_window": copilot_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Best for suggestions inside IDE",
            "source_url": copilot_data.get("source_url", ""),
            "status": copilot_data.get("status", "Needs review")
        })
        print(f"  Added GitHub Copilot: {copilot_data['latest_model']}")
    
    # Check Replit
    replit_data = check_replit()
    if replit_data:
        AI_CODING_TOOLS.append({
            "name": "Replit (Agent)",
            "type": "AI coding agent",
            "latest_model": replit_data["latest_model"],
            "best_for": "Build apps end-to-end",
            "context_window": replit_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Beginner-friendly, runs code in browser",
            "source_url": replit_data.get("source_url", ""),
            "status": replit_data.get("status", "Needs review")
        })
        print(f"  Added Replit: {replit_data['latest_model']}")
    
    # Check Claude Code
    claude_code_data = check_claude_code()
    if claude_code_data:
        AI_CODING_TOOLS.append({
            "name": "Claude Code",
            "type": "AI coding agent",
            "latest_model": claude_code_data["latest_model"],
            "best_for": "Large codebases, refactoring",
            "context_window": claude_code_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Strong at multi-file reasoning",
            "source_url": claude_code_data.get("source_url", ""),
            "status": claude_code_data.get("status", "Needs review")
        })
        print(f"  Added Claude Code: {claude_code_data['latest_model']}")
    
    # Check CrewAI
    crewai_data = check_crewai()
    if crewai_data:
        AI_CODING_TOOLS.append({
            "name": "CrewAI",
            "type": "AI agent framework",
            "latest_model": crewai_data["latest_model"],
            "best_for": "Multi-agent workflows",
            "context_window": crewai_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Framework for building AI agent teams",
            "source_url": crewai_data.get("source_url", ""),
            "status": crewai_data.get("status", "Needs review")
        })
        print(f"  Added CrewAI: {crewai_data['latest_model']}")
    
    # Check Tabnine
    tabnine_data = check_tabnine()
    if tabnine_data:
        AI_CODING_TOOLS.append({
            "name": "Tabnine",
            "type": "AI coding assistant",
            "latest_model": tabnine_data["latest_model"],
            "best_for": "Code completion, suggestions",
            "context_window": tabnine_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Popular alternative to Copilot",
            "source_url": tabnine_data.get("source_url", ""),
            "status": tabnine_data.get("status", "Needs review")
        })
        print(f"  Added Tabnine: {tabnine_data['latest_model']}")
    
    # Check Codeium
    codeium_data = check_codeium()
    if codeium_data:
        AI_CODING_TOOLS.append({
            "name": "Codeium",
            "type": "AI coding assistant",
            "latest_model": codeium_data["latest_model"],
            "best_for": "Free code completion, suggestions",
            "context_window": codeium_data["context_window"],
            "max_output": "Depends on selected model",
            "notes": "Free alternative gaining popularity",
            "source_url": codeium_data.get("source_url", ""),
            "status": codeium_data.get("status", "Needs review")
        })
        print(f"  Added Codeium: {codeium_data['latest_model']}")
    
    return AI_PLATFORMS, AI_CODING_TOOLS
