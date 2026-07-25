#!/usr/bin/env python3
"""
AI-Native SDLC Harness — Interactive Setup Script

Bootstraps a developer's workspace and machine with AI-native SDLC skills

Prerequisites:
  - Python 3.10+ (required — to run this script)
  - git          (required — for cloning repositories)
  - Devin CLI    (optional — for running /create-pod-knowledge automatically)
                  Install: https://cli.devin.ai/docs

Usage:
  python setup.py                          # Full interactive setup
  python setup.py --workspace /path/to/ws  # Skip workspace prompt
"""

import argparse
import getpass
import json
import os
import platform
import shutil
import ssl
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse
import urllib.request
from pathlib import Path

# Fix Windows Unicode encoding issues
if platform.system() == "Windows":
    import io
    # Force UTF-8 output on Windows to handle Unicode characters
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except (AttributeError, OSError):
            # Fallback for older Python versions or systems where reconfigure fails
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Cross-platform Unicode-safe characters
ARROW = "→" if platform.system() != "Windows" or sys.stdout.encoding.lower() in ('utf-8', 'utf8') else "->"
LINE_CHAR = "─" if platform.system() != "Windows" or sys.stdout.encoding.lower() in ('utf-8', 'utf8') else "-"

# ── Constants ─────────────────────────────────────────────────────────────

# Setup folder is where this script lives — contains canonical skills/ and build.py
SETUP_DIR = Path(__file__).resolve().parent

# MCP configuration
BUNDLED_MCP_SERVERS_FILE = SETUP_DIR / "oauth-mcp-servers.json"
BUNDLED_CA_CERT = SETUP_DIR / "certs" / "dell-ca.crt"


def _sdd_config_dir() -> Path:
    """Return the platform-appropriate directory for SDD config and credentials."""
    if platform.system() == "Windows":
        appdata = os.environ.get("APPDATA", "")
        if appdata:
            return Path(appdata) / "sdd"
    return Path.home() / ".config" / "sdd"


USER_CREDENTIALS_FILE = _sdd_config_dir() / "credentials.json"

# Default service base URLs — users can modify during installation
_DEFAULT_JIRA_URL       = "https://jira.dell.com"
_DEFAULT_CONFLUENCE_URL = "https://confluence.dell.com"
_DEFAULT_GITLAB_URL     = "https://gitlab.dell.com"

# IDP Onboarding API — POD registry (production endpoints)
_POD_API_BASE_URL = "https://idp-onboarding-api.devops360-p3.kob.dell.com/api/SDD"
_POD_API_URL      = f"{_POD_API_BASE_URL}/pods"
_PODGROUP_API_URL = f"{_POD_API_BASE_URL}/podgroups"
_GUILD_API_URL    = f"{_POD_API_BASE_URL}/guilds" 
_DOMAIN_API_URL   = f"{_POD_API_BASE_URL}/domains"
_DUMMY_POD_SLUG = "dummy-pod"
_DUMMY_POD_INFO: dict = {
    "namespace":         "demo/dummy-pod-group/dummy-pod",
    "domain":            "demo",
    "pod_group":         "dummy-pod-group",
    "pod_name":          "dummy-pod",
    "git_parent":        "https://gitlab.dell.com/999999/dummy-pod",  # Using correct CMDB ID
    "git_parent_https":  "https://gitlab.dell.com/999999/dummy-pod",
    "ai_repo_url_ssh":   "git@gitlab.dell.com:999999/dummy-pod/ai-workspace.git",
    "ai_repo_url_https": "https://gitlab.dell.com/999999/dummy-pod/ai-workspace.git",
    "jira_project_key":  "PODT",
    "jira_project_name": "POD Training",
}

# Directive sentinel constants
_SENTINEL_START   = "<!-- sdd-directives-start -->"
_SENTINEL_END     = "<!-- sdd-directives-end -->"
SNYK_DIRECTIVES_FILE = SETUP_DIR / "snyk-directives.md"

# JIRA status transition configuration
# Maps SDLC stages to JIRA status names
JIRA_STATUS_TRANSITIONS: dict[str, str] = {
    "new": "Proposed",
    "create-spec": "Defining Details",
    "create-plan": "Ready for Dev",
    "execute": "In Development",
    "wrap-up": "Complete",
}
WINDSURF_GLOBAL_RULES = Path.home() / ".codeium" / "windsurf" / "global_rules.md"
CLAUDE_MD_FILE        = Path.home() / ".claude" / "CLAUDE.md"


class PodApiUnavailableError(Exception):
    """Raised when the POD registry API cannot be reached (network / SSL / timeout).

    Distinct from a pod-not-found result so callers can offer the dummy-pod
    fallback immediately rather than re-prompting for another slug.
    """

# MCP server config paths (platform-specific)
if platform.system() == "Windows":
    CLAUDE_SETTINGS_FILE = Path(os.environ.get("USERPROFILE", "")) / ".claude.json"
    WINDSURF_MCP_FILE = Path(os.environ.get("USERPROFILE", "")) / ".codeium" / "mcp_config.json"
    DEVIN_CONFIG_FILE = Path(os.environ.get("APPDATA", "")) / "devin" / "config.json"
    VSCODE_MCP_FILE = Path(os.environ.get("USERPROFILE", "")) / ".vscode" / "mcp.json"
else:
    CLAUDE_SETTINGS_FILE = Path.home() / ".claude.json"
    WINDSURF_MCP_FILE = Path.home() / ".codeium" / "mcp_config.json"
    DEVIN_CONFIG_FILE = Path.home() / ".config" / "devin" / "config.json"
    VSCODE_MCP_FILE = Path.home() / ".vscode" / "mcp.json"


# ── Terminal UI helpers ───────────────────────────────────────────────────

class C:
    """ANSI colour codes (disabled automatically when output is not a tty)."""
    _enabled = sys.stdout.isatty()
    BOLD   = "\033[1m"   if _enabled else ""
    DIM    = "\033[2m"   if _enabled else ""
    GREEN  = "\033[92m"  if _enabled else ""
    YELLOW = "\033[93m"  if _enabled else ""
    CYAN   = "\033[96m"  if _enabled else ""
    RED    = "\033[91m"  if _enabled else ""
    RESET  = "\033[0m"   if _enabled else ""


def banner(text: str):
    w = 72
    print(f"\n{C.CYAN}{'=' * w}")
    print(f"  {text}")
    print(f"{'=' * w}{C.RESET}\n")


def phase_header(num: int, text: str):
    w = 72
    print(f"\n{C.BOLD}{C.CYAN}{LINE_CHAR * w}")
    print(f"  PHASE {num}: {text}")
    print(f"{LINE_CHAR * w}{C.RESET}\n")


def step(num: str, text: str):
    print(f"\n{C.BOLD}{C.GREEN}  [{num}] {text}{C.RESET}")


def info(text: str = ""):
    print(f"      {text}")


def warn(text: str):
    print(f"      {C.YELLOW}! {text}{C.RESET}")


def error(text: str):
    print(f"      {C.RED}X {text}{C.RESET}")


def success(text: str):
    print(f"      {C.GREEN}+ {text}{C.RESET}")


def dim(text: str):
    print(f"      {C.DIM}{text}{C.RESET}")


def ask(prompt: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    result = input(f"      {prompt}{suffix}: ").strip()
    return result if result else default


def ask_yn(prompt: str, default: bool = True) -> bool:
    suffix = "[Y/n]" if default else "[y/N]"
    result = input(f"      {prompt} {suffix}: ").strip().lower()
    if not result:
        return default
    return result in ("y", "yes")


def ask_multi(prompt: str, options: dict[str, str], defaults: list[str] | None = None) -> list[str]:
    """Show numbered multi-select. Returns list of selected keys."""
    print(f"      {prompt}")
    keys = list(options.keys())
    default_set = set(defaults or [])
    for i, key in enumerate(keys, 1):
        marker = "*" if key in default_set else " "
        print(f"        {C.BOLD}{i:2d}{C.RESET}. [{marker}] {C.BOLD}{key}{C.RESET}")
        print(f"              {C.DIM}{options[key]}{C.RESET}")
    print()
    if defaults:
        info(f"Default selection: {', '.join(defaults)}")
    info("Enter numbers separated by commas, 'a' for all, or press Enter for defaults.")
    raw = input("      > ").strip().lower()

    if not raw:
        return defaults if defaults else []
    if raw == "a":
        return keys
    try:
        indices = [int(x.strip()) for x in raw.split(",") if x.strip()]
        return [keys[i - 1] for i in indices if 1 <= i <= len(keys)]
    except (ValueError, IndexError):
        warn("Could not parse selection — using defaults.")
        return defaults if defaults else []


def pause(msg: str = "Press Enter to continue..."):
    input(f"\n      {C.DIM}{msg}{C.RESET}")


def _show_spinner(stop_event, message="Processing"):
    """Show a spinner animation while a process is running."""
    spinner_chars = ["|", "/", "-", "\\"]
    i = 0
    while not stop_event.is_set():
        sys.stdout.write(f"\r      {C.CYAN}{spinner_chars[i % len(spinner_chars)]}{C.RESET} {message}...")
        sys.stdout.flush()
        time.sleep(0.1)
        i += 1
    # Clear the spinner line when done
    sys.stdout.write("\r" + " " * 50 + "\r")
    sys.stdout.flush()

# ── Utilities ─────────────────────────────────────────────────────────────

def run_cmd(cmd: list[str], cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command, printing it first."""
    dim(f"$ {' '.join(cmd)}")
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=check)


def copy_tree(src: Path, dst: Path, label: str):
    """Copy a directory tree, merging into destination. Overwrites existing files."""
    if not src.exists():
        warn(f"Source not found, skipping: {src}")
        return
    for item in src.rglob("*"):
        if item.is_file():
            rel = item.relative_to(src)
            target = dst / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)
    success(f"Copied {label} {ARROW} {dst}")


def copy_file(src: Path, dst: Path, label: str):
    """Copy a single file."""
    if not src.exists():
        warn(f"Source not found, skipping: {src}")
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    success(f"Copied {label} {ARROW} {dst}")


def check_snyk_available() -> bool:
    """Check if Snyk executable is available in PATH.
    
    Returns True if snyk command is available, False otherwise.
    """
    return shutil.which("snyk") is not None


def ensure_snyk_installed() -> bool:
    """Provide Snyk installation instructions if not available.
    
    Returns True to allow setup to continue.
    """
    if check_snyk_available():
        success("Snyk executable found in PATH")
        return True
    
    print()
    warn("Snyk executable not found in PATH")
    info("Snyk is required for security scanning via MCP")
    
    if platform.system() == "Windows":
        print()
        info(f"{C.BOLD}Download Snyk from Company Portal{C.RESET}")
        info("  Open: companyportal:ApplicationId=00d29775-44f1-4807-a87a-88f22296289f")
        info("  Or visit: https://snyk.io/download")
    else:
        print()
        info(f"{C.BOLD}Download and install Snyk for Linux/WSL{C.RESET}")
        print()
        info("  # Download")
        info("  curl --compressed https://downloads.snyk.io/cli/latest/snyk-linux -o snyk")
        print()
        info("  # Make the file executable")
        info("  chmod +x ./snyk")
        print()
        info("  # Move to a folder in your PATH")
        info("  sudo mv ./snyk /usr/local/bin/")
        print()
    
    info("After installing Snyk, the MCP server will be configured automatically.")
    print()
    info(f"{C.BOLD}After installing Snyk, run the following to authenticate:{C.RESET}")
    info("  snyk auth")
    print()
    
    return True

# ── Credential storage ────────────────────────────────────────────────────

def _load_user_credentials(path: Path = USER_CREDENTIALS_FILE) -> dict:
    """Load ~/.config/sdd/credentials.json. Returns empty dicts on any error."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            data.setdefault("jira", {})
            data.setdefault("confluence", {})
            data.setdefault("gitlab", {})
            return data
    except (OSError, json.JSONDecodeError):
        pass
    return {"jira": {}, "confluence": {}, "gitlab": {}}


def _save_user_credentials(creds: dict, path: Path = USER_CREDENTIALS_FILE) -> None:
    """Write credentials JSON to path with owner-only (0600) permissions.

    On Unix the file is opened with mode 0600 at creation time, eliminating the
    TOCTOU window that would exist between write_text() and a subsequent chmod().
    On Windows, path.write_text() is used and ACLs enforce access instead.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(creds, indent=2) + "\n"
    if platform.system() != "Windows":
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
    else:
        path.write_text(content, encoding="utf-8")


# ── SSL context ───────────────────────────────────────────────────────────

def _make_ssl_context() -> ssl.SSLContext:
    """Return an SSL context that honours corporate CA bundles.

    Priority: bundled dell-ca.crt -> REQUESTS_CA_BUNDLE -> SSL_CERT_FILE ->
    CURL_CA_BUNDLE -> system default.
    """
    if BUNDLED_CA_CERT.is_file():
        return ssl.create_default_context(cafile=str(BUNDLED_CA_CERT))
    for env_var in ("REQUESTS_CA_BUNDLE", "SSL_CERT_FILE", "CURL_CA_BUNDLE"):
        ca_bundle = os.environ.get(env_var)
        if ca_bundle and Path(ca_bundle).is_file():
            return ssl.create_default_context(cafile=ca_bundle)
    return ssl.create_default_context()


def _verify_atlassian_pat(service_name: str, base_url: str, token: str) -> bool:
    """Test an Atlassian PAT/token with a lightweight API call."""
    test_url = (
        f"{base_url}/rest/api/2/myself"
        if "jira" in service_name.lower()
        else f"{base_url}/rest/api/user/current"
    )
    req = urllib.request.Request(
        test_url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15, context=_make_ssl_context()) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode("utf-8"))
                display = body.get("displayName") or body.get("name") or body.get("username") or "unknown"
                success(f"{service_name} token valid — authenticated as: {display}")
                return True
            warn(f"{service_name} API returned HTTP {resp.status}.")
    except urllib.error.HTTPError as exc:
        if exc.code == 401:
            warn(f"{service_name} token rejected (401 Unauthorized).")
        elif exc.code == 403:
            warn(f"{service_name} token accepted but lacks permissions (403 Forbidden).")
        else:
            warn(f"{service_name} API error: HTTP {exc.code}.")
    except Exception as exc:
        warn(f"{service_name} token verification failed: {exc}")
    return False


def _verify_gitlab_pat(base_url: str, token: str) -> bool:
    """Test a GitLab token against GET /api/v4/user."""
    req = urllib.request.Request(
        f"{base_url}/api/v4/user",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15, context=_make_ssl_context()) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode("utf-8"))
                display = body.get("name") or body.get("username") or "unknown"
                success(f"GitLab token valid — authenticated as: {display}")
                return True
            warn(f"GitLab API returned HTTP {resp.status}.")
    except urllib.error.HTTPError as exc:
        if exc.code == 401:
            warn("GitLab token rejected (401 Unauthorized).")
        elif exc.code == 403:
            warn("GitLab token accepted but lacks permissions (403 Forbidden).")
        else:
            warn(f"GitLab API error: HTTP {exc.code}.")
    except Exception as exc:
        warn(f"GitLab token verification failed: {exc}")
    return False


def _search_pods_by_key(search_key: str) -> list:
    """Call the IDP pods API with a single search key and return the raw list.

    Raises any network / SSL / parse exception to the caller — does NOT log.
    """
    url = f"{_POD_API_URL}?key={urllib.parse.quote(search_key)}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=15, context=_make_ssl_context()) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        return body.get("data", {}).get("data", [])


def _fetch_pod_from_api(pod_key: str) -> dict | None:
    """Fetch POD metadata from the IDP Onboarding API by pod slug.

    Returns the exact-matching pod dict (by podSlug) or None.

    The ?key= endpoint is a display-name text search, not a slug lookup.
    A slug like 'isg-software-updates' may not match a display name of
    'ISG Software Updates' because the API sees hyphens as literal characters.
    We therefore try several search variants in order and always verify the
    result by exact podSlug equality so we never return the wrong pod.

    Search order:
      1. Original slug          e.g. 'isg-software-updates'
      2. Hyphens → spaces       e.g. 'isg software updates'  (matches display names)
      3. Hyphens → underscores  e.g. 'isg_software_updates'

    If the API is unreachable (SSL, network, HTTP error), the failure is
    logged ONCE and None is returned — no repeated warnings for retries.
    """
    # Build a deduplicated list of search keys to try
    variants = [pod_key]
    spaced = pod_key.replace("-", " ")
    if spaced != pod_key:
        variants.append(spaced)
    underscored = pod_key.replace("-", "_")
    if underscored != pod_key and underscored not in variants:
        variants.append(underscored)

    for key in variants:
        try:
            pods = _search_pods_by_key(key)
        except Exception as exc:
            # API is unreachable — raise a typed error so the caller can
            # immediately offer dummy-pod instead of re-prompting for slugs.
            raise PodApiUnavailableError(str(exc)) from exc
        # Always verify by exact podSlug match — the display-name search may
        # return unrelated pods that happen to contain the search terms.
        exact = next((p for p in pods if p.get("podSlug") == pod_key), None)
        if exact is not None:
            return exact
        # No exact match in this batch — try next variant

    # All variants exhausted with no exact match — pod genuinely not found
    return None


def _paginated_find_by_id(base_url: str, target_id: int, label: str) -> dict | None:
    """Paginate through an IDP list endpoint to find an item by its ``id`` field.

    The API uses ``?pageNumber=N&pageSize=N`` for pagination and returns a
    ``pagination`` object with ``total_pages`` in each response.  We walk
    pages sequentially until we either find the target or exhaust all pages.
    """
    _PAGE_SIZE = 100
    target = str(target_id)
    page = 1
    total_pages = 1  # assume at least one page; updated from first response

    while page <= total_pages:
        url = f"{base_url}?pageNumber={page}&pageSize={_PAGE_SIZE}"
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=15, context=_make_ssl_context()) as resp:
                body = json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            warn(f"{label} API lookup failed (page {page}): {exc}")
            return None

        if not body.get("isSuccess"):
            return None

        data = body.get("data", {})
        items = data.get("data", [])

        # Update total_pages from the pagination metadata
        pagination = data.get("pagination", {})
        total_pages = pagination.get("total_pages") or page

        for item in items:
            if str(item.get("id", "")) == target:
                return item

        page += 1

    return None


def _paginated_fetch_all(base_url: str, label: str) -> list[dict]:
    """Paginate through an IDP list endpoint and return every item."""
    _PAGE_SIZE = 100
    all_items: list[dict] = []
    page = 1
    total_pages = 1

    while page <= total_pages:
        url = f"{base_url}?pageNumber={page}&pageSize={_PAGE_SIZE}"
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=15, context=_make_ssl_context()) as resp:
                body = json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            warn(f"{label} API lookup failed (page {page}): {exc}")
            return all_items  # return whatever we collected so far

        if not body.get("isSuccess"):
            return all_items

        data = body.get("data", {})
        all_items.extend(data.get("data", []))

        pagination = data.get("pagination", {})
        total_pages = pagination.get("total_pages") or page
        page += 1

    return all_items


def _fetch_podgroup_by_id(podgroup_id: int) -> dict | None:
    """Fetch POD Group metadata from the IDP Onboarding API by ID."""
    return _paginated_find_by_id(_PODGROUP_API_URL, podgroup_id, "POD Group")


def _fetch_guild_by_id(guild_id: int) -> dict | None:
    """Fetch Guild metadata from the IDP Onboarding API by ID."""
    return _paginated_find_by_id(_GUILD_API_URL, guild_id, "Guild")


def _fetch_domain_by_id(domain_id: int) -> dict | None:
    """Fetch Domain metadata from the IDP Onboarding API by ID."""
    return _paginated_find_by_id(_DOMAIN_API_URL, domain_id, "Domain")


def _fetch_all_domains() -> list[dict]:
    """Fetch all domains from the IDP Onboarding API."""
    return _paginated_fetch_all(_DOMAIN_API_URL, "Domains")


def _resolve_pod_hierarchy(api_pod: dict) -> dict | None:
    """Resolve the full hierarchy (domain/guild -> pod_group -> pod) from API data.
    
    Returns a dict with resolved hierarchy info, or None if resolution fails.
    Expected structure: 
    - For guild hierarchy: guild/pod_group/pod
    - For domain hierarchy: domain/pod_group/pod
    """
    try:
        pod_group_id = api_pod.get("podGroupId")
        if not pod_group_id:
            warn("POD missing podGroupId")
            return None
            
        # Fetch POD Group details
        pod_group = _fetch_podgroup_by_id(pod_group_id)
        if not pod_group:
            raise ValueError(f"POD Group with ID {pod_group_id} not found in the registry. "
                           f"This POD references a non-existent POD Group, indicating a data integrity issue. "
                           f"Please contact the system administrator or use a different POD.")
            
        pod_group_slug = pod_group.get("podGroupSlug")
        if not pod_group_slug:
            raise ValueError(f"POD Group {pod_group_id} is missing podGroupSlug field. "
                           f"This indicates corrupted data in the registry.")
            
        # Check if POD Group has guild or domain association
        guild_id = pod_group.get("guildId")
        domain_id = pod_group.get("domainId")  # In case API supports direct domain links
        
        parent_slug = None
        parent_type = None
        git_namespace_prefix = None
        
        if guild_id:
            # Guild hierarchy: guild/pod_group/pod
            guild = _fetch_guild_by_id(guild_id)
            if guild and guild.get("guildSlug"):
                parent_slug = guild["guildSlug"]
                parent_type = "guild"
                # For guilds, we might need to derive git namespace
                git_namespace_prefix = f"{parent_slug}/"
            else:
                warn(f"Could not resolve guild with ID {guild_id}")
                
        elif domain_id:
            # Direct domain hierarchy: domain/pod_group/pod  
            domain = _fetch_domain_by_id(domain_id)
            if domain and domain.get("domainSlug"):
                parent_slug = domain["domainSlug"]
                parent_type = "domain"
                git_namespace_prefix = domain.get("gitNamespacePrefix", f"{parent_slug}/")
            else:
                warn(f"Could not resolve domain with ID {domain_id}")
        else:
            # Try to find domain through pod group naming or other heuristics
            # For now, we'll check if any domains have pod groups that match
            domains = _fetch_all_domains()
            for domain in domains:
                # Check if this domain could be the parent based on naming patterns
                if pod_group_slug.startswith(domain.get("domainSlug", "").replace("-", "_")):
                    parent_slug = domain["domainSlug"]
                    parent_type = "domain"
                    git_namespace_prefix = domain.get("gitNamespacePrefix", f"{parent_slug}/")
                    break
            
            if not parent_slug:
                warn("Could not determine parent hierarchy (guild or domain)")
                # Fallback to using pod group as top-level
                parent_slug = pod_group_slug
                parent_type = "pod_group"
                git_namespace_prefix = f"{parent_slug}/"
                
        return {
            "parent_slug": parent_slug,
            "parent_type": parent_type,
            "pod_group_slug": pod_group_slug,
            "pod_slug": api_pod.get("podSlug"),
            "git_namespace_prefix": git_namespace_prefix
        }
        
    except ValueError:
        # Re-raise ValueError for data integrity issues - these should be handled by caller
        raise
    except Exception as exc:
        warn(f"Failed to resolve POD hierarchy: {exc}")
        return None


# ── Directive installation ─────────────────────────────────────────────────

def _upsert_sentinel_block(target: Path, content: str) -> None:
    """Write content between sentinel markers in target, preserving surrounding text.

    Idempotent: re-running replaces the existing block rather than appending.
    """
    block = f"{_SENTINEL_START}\n{content.strip()}\n{_SENTINEL_END}\n"
    if target.exists():
        text = target.read_text(encoding="utf-8")
        if _SENTINEL_START in text and _SENTINEL_END in text:
            before = text[:text.index(_SENTINEL_START)]
            after  = text[text.index(_SENTINEL_END) + len(_SENTINEL_END):]
            text = before + block + after.lstrip("\n")
        else:
            text = text.rstrip("\n") + "\n\n" + block
    else:
        text = block
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    success(f"Snyk directives written {ARROW} {target}")


def _install_directives() -> None:
    """Distribute Dell's Snyk security directives to all AI tool global-rules files."""
    if not SNYK_DIRECTIVES_FILE.exists():
        warn(f"snyk-directives.md not found at {SNYK_DIRECTIVES_FILE} — skipping")
        return
    content = SNYK_DIRECTIVES_FILE.read_text(encoding="utf-8")
    _upsert_sentinel_block(WINDSURF_GLOBAL_RULES, content)
    _upsert_sentinel_block(CLAUDE_MD_FILE, content)


# ── MCP Server Configuration Helpers ───────────────────────────────────────


def _load_mcp_servers() -> dict:
    """Load MCP servers configuration from bundled file.
    
    Returns a dict mapping URLs to their configuration (url, transport, etc.).
    """
    try:
        servers: dict = json.loads(BUNDLED_MCP_SERVERS_FILE.read_text(encoding="utf-8"))
        if isinstance(servers, dict):
            return servers
    except (OSError, json.JSONDecodeError):
        pass
    
    return {}



def collect_gitlab_credentials() -> tuple[str, str] | None:
    """Collect GitLab base URL and PAT. Returns (base_url, token) or None.

    Pre-fills the Dell default URL. Checks for an existing stored token before
    prompting. Returns None if no credential is obtained (service is skipped).
    """
    print()
    info(f"{C.BOLD}--- GitLab ---{C.RESET}")
    info(f"{C.BOLD}GitLab — Base URL{C.RESET}")
    base_url = ask("GitLab base URL (leave blank to skip)", _DEFAULT_GITLAB_URL).strip().rstrip("/")

    if not base_url:
        info("Skipping GitLab.")
        return None

    # Check for an existing saved token
    existing_creds = _load_user_credentials()
    existing_token = existing_creds.get("gitlab", {}).get(base_url)
    if existing_token:
        warn(f"A token already exists for {base_url}.")
        if not ask_yn("Replace it?", default=False):
            info("Verifying existing GitLab credential…")
            if _verify_gitlab_pat(base_url, existing_token):
                return base_url, existing_token
            warn("Existing token failed validation. Please provide a new one.")

    print()
    info(f"{C.BOLD}GitLab PAT{C.RESET} — Personal Access Token")
    info(f"  Generate from: {base_url}/-/user_settings/personal_access_tokens")
    info("  Scopes needed: api")
    token = ask("GitLab PAT (leave blank to skip)", "")

    if not token:
        warn("No credential provided — skipping GitLab.")
        return None

    info("Verifying GitLab token…")
    if not _verify_gitlab_pat(base_url, token):
        warn("GitLab token could not be verified.")
        if not ask_yn("Save it anyway?", default=False):
            return None

    return base_url, token


def collect_atlassian_credentials(
    service_name: str,
    service_key: str,
) -> tuple[str, str] | None:
    """Collect base URL and PAT for one Atlassian service. Returns (base_url, token) or None.

    Pre-fills the Dell default URL. Checks for an existing stored token before
    prompting. Returns None if no credential is obtained (service is skipped).
    """
    print()
    info(f"{C.BOLD}{service_name} — Base URL{C.RESET}")
    default_url = _DEFAULT_JIRA_URL if service_key == "jira" else _DEFAULT_CONFLUENCE_URL
    base_url = ask(f"{service_name} base URL (leave blank to skip)", default_url).strip().rstrip("/")

    if not base_url:
        info(f"Skipping {service_name}.")
        return None

    # Check for an existing saved token
    existing_creds = _load_user_credentials()
    existing_token = existing_creds.get(service_key, {}).get(base_url)
    if existing_token:
        warn(f"A token already exists for {base_url}.")
        if not ask_yn("Replace it?", default=False):
            info(f"Verifying existing {service_name} credential…")
            if _verify_atlassian_pat(service_name, base_url, existing_token):
                return base_url, existing_token
            warn("Existing token failed validation. Please provide a new one.")

    print()
    info(f"{C.BOLD}{service_name} PAT{C.RESET} — Personal Access Token")
    if "jira" in service_name.lower():
        pat_url = f"{base_url}/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens"
    else:
        pat_url = f"{base_url}/plugins/personalaccesstokens/usertokens.action"
    info(f"  Generate from: {pat_url}")
    token = ask(f"{service_name} PAT (leave blank to skip)", "")

    if not token:
        warn(f"No credential provided — skipping {service_name}.")
        return None

    info(f"Verifying {service_name} token…")
    if not _verify_atlassian_pat(service_name, base_url, token):
        warn(f"{service_name} token could not be verified.")
        if not ask_yn("Save it anyway?", default=False):
            return None

    return base_url, token


# ── MCP Server Configuration ─────────────────────────────────────────────────

def _configure_claude_code_mcps(
    jira_url: str,
    jira_token: str,
    confluence_url: str,
    confluence_token: str,
    gitlab_url: str,
    gitlab_token: str,
) -> None:
    """Write MCP server entries into ~/.claude.json.

    For URLs in oauth-mcp-servers.json: uses the MCP server URL; includes PAT
    header if pat_header is defined in the entry. For other URLs: PAT in headers.
    Only modifies entries for services provided. Other MCP servers are preserved.
    """
    # Load or create settings
    existing: dict = {}
    if CLAUDE_SETTINGS_FILE.exists():
        try:
            existing = json.loads(CLAUDE_SETTINGS_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass

    # Get existing mcpServers or create empty dict
    mcp_servers: dict = existing.get("mcpServers", {})
    existing["mcpServers"] = mcp_servers

    # Load bundled MCP server configurations
    mcp_servers_config = _load_mcp_servers()

    # Collect the MCP server names that will be configured (from oauth-mcp-servers.json)
    mcp_server_names_to_configure = set()
    services_to_configure = []

    # Process Jira
    if jira_url:
        if jira_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[jira_url].get("name", "jira")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, True))
        else:
            mcp_server_name = "jira"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, False))

    # Process Confluence
    if confluence_url:
        if confluence_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[confluence_url].get("name", "confluence")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, True))
        else:
            mcp_server_name = "confluence"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, False))

    # Process GitLab
    if gitlab_url:
        if gitlab_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[gitlab_url].get("name", "gitlab")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, True))
        else:
            mcp_server_name = "gitlab"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, False))

    # Always add Snyk
    mcp_server_names_to_configure.add("snyk-security-scanner")

    # Delete existing entries for servers we're about to configure
    for server_name in mcp_server_names_to_configure:
        if server_name in mcp_servers:
            del mcp_servers[server_name]

    # Create entries for each service
    for service_type, service_url, token, mcp_server_name, is_oauth in services_to_configure:
        if is_oauth:
            mcp_config = mcp_servers_config[service_url]
            server_entry: dict = {
                "url": mcp_config.get("url", ""),
                "type": "http",
            }
            pat_header = mcp_config.get("pat_header")
            if pat_header and token:
                server_entry["headers"] = {pat_header: token}
            mcp_servers[mcp_server_name] = server_entry
        else:
            if service_type == "jira":
                headers = {"X-Atlassian-Jira-Url": service_url}
                if token:
                    headers["X-Atlassian-Jira-Personal-Token"] = token
            elif service_type == "confluence":
                headers = {"X-Atlassian-Confluence-Url": service_url}
                if token:
                    headers["X-Atlassian-Confluence-Personal-Token"] = token
            else:  # gitlab
                headers = {"X-Gitlab-Url": service_url}
                if token:
                    headers["X-Gitlab-Token"] = token

            mcp_servers[mcp_server_name] = {
                "url": service_url,
                "type": "http",
                "headers": headers,
            }

    # ── Snyk ──
    mcp_servers["snyk-security-scanner"] = {
        "command": "snyk",
        "args": ["mcp", "-t", "stdio"],
        "env": {},
    }

    CLAUDE_SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    CLAUDE_SETTINGS_FILE.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")
    success(f"Claude Code MCP config updated {ARROW} {CLAUDE_SETTINGS_FILE}")


def _configure_windsurf_mcps(
    jira_url: str,
    jira_token: str,
    confluence_url: str,
    confluence_token: str,
    gitlab_url: str,
    gitlab_token: str,
) -> None:
    """Write MCP server entries into ~/.codeium/mcp_config.json.

    For URLs in oauth-mcp-servers.json: uses the MCP server URL; includes PAT
    header if pat_header is defined in the entry. For other URLs: PAT in headers.
    Only modifies entries for services provided. Other MCP servers are preserved.
    """
    existing: dict = {}
    if WINDSURF_MCP_FILE.exists():
        try:
            existing = json.loads(WINDSURF_MCP_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass

    # Get existing mcpServers or create empty dict
    mcp_servers: dict = existing.get("mcpServers", {})
    existing["mcpServers"] = mcp_servers

    # Load bundled MCP server configurations
    mcp_servers_config = _load_mcp_servers()

    # Collect the MCP server names that will be configured
    mcp_server_names_to_configure = set()
    services_to_configure = []

    # Process Jira
    if jira_url:
        if jira_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[jira_url].get("name", "jira")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, True))
        else:
            mcp_server_name = "jira"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, False))

    # Process Confluence
    if confluence_url:
        if confluence_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[confluence_url].get("name", "confluence")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, True))
        else:
            mcp_server_name = "confluence"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, False))

    # Process GitLab
    if gitlab_url:
        if gitlab_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[gitlab_url].get("name", "gitlab")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, True))
        else:
            mcp_server_name = "gitlab"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, False))

    # Always add Snyk
    mcp_server_names_to_configure.add("snyk-security-scanner")

    # Delete existing entries for servers we're about to configure
    for server_name in mcp_server_names_to_configure:
        if server_name in mcp_servers:
            del mcp_servers[server_name]

    # Create entries for each service
    for service_type, service_url, token, mcp_server_name, is_oauth in services_to_configure:
        if is_oauth:
            mcp_config = mcp_servers_config[service_url]
            server_entry: dict = {
                "url": mcp_config.get("url", ""),
            }
            pat_header = mcp_config.get("pat_header")
            if pat_header and token:
                server_entry["headers"] = {pat_header: token}
            mcp_servers[mcp_server_name] = server_entry
        else:
            if service_type == "jira":
                headers = {"X-Atlassian-Jira-Url": service_url}
                if token:
                    headers["X-Atlassian-Jira-Personal-Token"] = token
            elif service_type == "confluence":
                headers = {"X-Atlassian-Confluence-Url": service_url}
                if token:
                    headers["X-Atlassian-Confluence-Personal-Token"] = token
            else:  # gitlab
                headers = {"X-Gitlab-Url": service_url}
                if token:
                    headers["X-Gitlab-Token"] = token

            mcp_servers[mcp_server_name] = {
                "url": service_url,
                "headers": headers,
            }

    # ── Snyk ──
    mcp_servers["snyk-security-scanner"] = {
        "command": "snyk",
        "args": ["mcp", "-t", "stdio"],
        "env": {},
    }

    WINDSURF_MCP_FILE.parent.mkdir(parents=True, exist_ok=True)
    WINDSURF_MCP_FILE.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")
    success(f"Windsurf MCP config updated {ARROW} {WINDSURF_MCP_FILE}")


def _configure_devin_mcps(
    jira_url: str,
    jira_token: str,
    confluence_url: str,
    confluence_token: str,
    gitlab_url: str,
    gitlab_token: str,
) -> None:
    """Write MCP server entries into ~/.config/devin/config.json.

    For URLs in oauth-mcp-servers.json: uses the MCP server URL; includes PAT
    header if pat_header is defined in the entry. For other URLs: PAT in headers.
    Only modifies entries for services provided. Other MCP servers are preserved.
    """
    existing: dict = {}
    if DEVIN_CONFIG_FILE.exists():
        try:
            existing = json.loads(DEVIN_CONFIG_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass

    # Get existing mcpServers or create empty dict
    mcp_servers: dict = existing.get("mcpServers", {})
    existing["mcpServers"] = mcp_servers

    # Load bundled MCP server configurations
    mcp_servers_config = _load_mcp_servers()

    # Collect the MCP server names that will be configured
    mcp_server_names_to_configure = set()
    services_to_configure = []

    # Process Jira
    if jira_url:
        if jira_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[jira_url].get("name", "jira")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, True))
        else:
            mcp_server_name = "jira"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, False))

    # Process Confluence
    if confluence_url:
        if confluence_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[confluence_url].get("name", "confluence")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, True))
        else:
            mcp_server_name = "confluence"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, False))

    # Process GitLab
    if gitlab_url:
        if gitlab_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[gitlab_url].get("name", "gitlab")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, True))
        else:
            mcp_server_name = "gitlab"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, False))

    # Always add Snyk
    mcp_server_names_to_configure.add("snyk-security-scanner")

    # Delete existing entries for servers we're about to configure
    for server_name in mcp_server_names_to_configure:
        if server_name in mcp_servers:
            del mcp_servers[server_name]

    # Create entries for each service
    for service_type, service_url, token, mcp_server_name, is_oauth in services_to_configure:
        if is_oauth:
            mcp_config = mcp_servers_config[service_url]
            server_entry: dict = {
                "url": mcp_config.get("url", ""),
                "type": "http",
            }
            pat_header = mcp_config.get("pat_header")
            if pat_header and token:
                server_entry["headers"] = {pat_header: token}
            mcp_servers[mcp_server_name] = server_entry
        else:
            if service_type == "jira":
                headers = {"X-Atlassian-Jira-Url": service_url}
                if token:
                    headers["X-Atlassian-Jira-Personal-Token"] = token
            elif service_type == "confluence":
                headers = {"X-Atlassian-Confluence-Url": service_url}
                if token:
                    headers["X-Atlassian-Confluence-Personal-Token"] = token
            else:  # gitlab
                headers = {"X-Gitlab-Url": service_url}
                if token:
                    headers["X-Gitlab-Token"] = token

            mcp_servers[mcp_server_name] = {
                "url": service_url,
                "type": "http",
                "headers": headers,
            }

    # ── Snyk ──
    mcp_servers["snyk-security-scanner"] = {
        "command": "snyk",
        "args": ["mcp", "-t", "stdio"],
        "env": {},
    }

    DEVIN_CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    DEVIN_CONFIG_FILE.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")
    success(f"Devin MCP config updated {ARROW} {DEVIN_CONFIG_FILE}")


def _configure_vscode_mcps(
    jira_url: str,
    jira_token: str,
    confluence_url: str,
    confluence_token: str,
    gitlab_url: str,
    gitlab_token: str,
) -> None:
    """Write MCP server entries into ~/.vscode/mcp.json.

    For URLs in oauth-mcp-servers.json: uses the MCP server URL; includes PAT
    header if pat_header is defined in the entry. For other URLs: PAT in headers.
    Only modifies entries for services provided. Other MCP servers are preserved.
    """
    existing: dict = {}
    if VSCODE_MCP_FILE.exists():
        try:
            existing = json.loads(VSCODE_MCP_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass

    # Get existing mcpServers or create empty dict
    mcp_servers: dict = existing.get("mcpServers", {})
    existing["mcpServers"] = mcp_servers

    # Load bundled MCP server configurations
    mcp_servers_config = _load_mcp_servers()

    # Collect the MCP server names that will be configured
    mcp_server_names_to_configure = set()
    services_to_configure = []

    # Process Jira
    if jira_url:
        if jira_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[jira_url].get("name", "jira")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, True))
        else:
            mcp_server_name = "jira"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("jira", jira_url, jira_token, mcp_server_name, False))

    # Process Confluence
    if confluence_url:
        if confluence_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[confluence_url].get("name", "confluence")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, True))
        else:
            mcp_server_name = "confluence"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("confluence", confluence_url, confluence_token, mcp_server_name, False))

    # Process GitLab
    if gitlab_url:
        if gitlab_url in mcp_servers_config:
            mcp_server_name = mcp_servers_config[gitlab_url].get("name", "gitlab")
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, True))
        else:
            mcp_server_name = "gitlab"
            mcp_server_names_to_configure.add(mcp_server_name)
            services_to_configure.append(("gitlab", gitlab_url, gitlab_token, mcp_server_name, False))

    # Always add Snyk
    mcp_server_names_to_configure.add("snyk-security-scanner")

    # Delete existing entries for servers we're about to configure
    for server_name in mcp_server_names_to_configure:
        if server_name in mcp_servers:
            del mcp_servers[server_name]

    # Create entries for each service
    for service_type, service_url, token, mcp_server_name, is_oauth in services_to_configure:
        if is_oauth:
            mcp_config = mcp_servers_config[service_url]
            server_entry: dict = {
                "url": mcp_config.get("url", ""),
                "type": "http",
            }
            pat_header = mcp_config.get("pat_header")
            if pat_header and token:
                server_entry["headers"] = {pat_header: token}
            mcp_servers[mcp_server_name] = server_entry
        else:
            if service_type == "jira":
                headers = {"X-Atlassian-Jira-Url": service_url}
                if token:
                    headers["X-Atlassian-Jira-Personal-Token"] = token
            elif service_type == "confluence":
                headers = {"X-Atlassian-Confluence-Url": service_url}
                if token:
                    headers["X-Atlassian-Confluence-Personal-Token"] = token
            else:  # gitlab
                headers = {"X-Gitlab-Url": service_url}
                if token:
                    headers["X-Gitlab-Token"] = token

            mcp_servers[mcp_server_name] = {
                "url": service_url,
                "type": "http",
                "headers": headers,
            }

    # ── Snyk ──
    mcp_servers["snyk-security-scanner"] = {
        "command": "snyk",
        "args": ["mcp", "-t", "stdio"],
        "env": {},
    }

    VSCODE_MCP_FILE.parent.mkdir(parents=True, exist_ok=True)
    VSCODE_MCP_FILE.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")
    success(f"VS Code MCP config updated {ARROW} {VSCODE_MCP_FILE}")


def configure_mcps(workspace: Path, config: dict) -> None:
    """Configure MCP servers for Claude Code, Windsurf, Devin, and VS Code.

    For URLs in oauth-mcp-servers.json: writes the MCP server URL; adds PAT
    header when pat_header is defined for that entry. For other URLs: PAT in
    headers. Only modifies entries for services provided. Other MCP servers
    are preserved.
    """
    step("2.4", "Configure MCP Servers (Claude Code, Windsurf, Devin)")

    jira_url = config.get("JIRA_BASE_URL", "")
    jira_token = config.get("JIRA_PAT", "")
    confluence_url = config.get("CONFLUENCE_BASE_URL", "")
    confluence_token = config.get("CONFLUENCE_PAT", "")
    gitlab_url = config.get("gitlab_url", "")
    gitlab_token = config.get("GIT_PAT", "")

    if not any([jira_url, confluence_url, gitlab_url]):
        warn("No service URLs found — skipping MCP configuration.")
        return

    mcp_servers_config = _load_mcp_servers()
    info("Writing MCP server entries for configured services:")
    if jira_url:
        if jira_url in mcp_servers_config:
            has_pat = bool(jira_token and mcp_servers_config[jira_url].get("pat_header"))
            auth_mode = "MCP + PAT" if has_pat else "MCP"
        else:
            auth_mode = "PAT" if jira_token else "no auth"
        info(f"  Jira:       {jira_url} ({auth_mode})")
    if confluence_url:
        if confluence_url in mcp_servers_config:
            has_pat = bool(confluence_token and mcp_servers_config[confluence_url].get("pat_header"))
            auth_mode = "MCP + PAT" if has_pat else "MCP"
        else:
            auth_mode = "PAT" if confluence_token else "no auth"
        info(f"  Confluence: {confluence_url} ({auth_mode})")
    if gitlab_url:
        if gitlab_url in mcp_servers_config:
            has_pat = bool(gitlab_token and mcp_servers_config[gitlab_url].get("pat_header"))
            auth_mode = "MCP + PAT" if has_pat else "MCP"
        else:
            auth_mode = "PAT" if gitlab_token else "no auth"
        info(f"  GitLab:     {gitlab_url} ({auth_mode})")
    info(f"  Snyk:       command-based")
    print()

    _configure_claude_code_mcps(jira_url, jira_token, confluence_url, confluence_token, gitlab_url, gitlab_token)
    _configure_windsurf_mcps(jira_url, jira_token, confluence_url, confluence_token, gitlab_url, gitlab_token)
    _configure_devin_mcps(jira_url, jira_token, confluence_url, confluence_token, gitlab_url, gitlab_token)
    _configure_vscode_mcps(jira_url, jira_token, confluence_url, confluence_token, gitlab_url, gitlab_token)

    _install_directives()

    info("")
    info("MCP configuration complete. Restart your AI tools to pick up the new servers.")
    info("For MCP/OAuth servers, agents authenticate against the MCP endpoint at runtime.")
    info("PATs are stored in ~/.config/sdd/credentials.json for direct REST API calls.")

# ── Phase 1: Initial Harness Setup ───────────────────────────────────────

def determine_workspace(cli_workspace: str | None) -> Path:
    """Determine the workspace root directory."""
    step("1.1", "Local Workspace Location")

    # Default to a persistent location inside the user's home directory
    if platform.system() == "Windows":
        default = Path.home() / "sdd-workspace"
    else:
        default = Path.home() / "sdd-workspace"
    
    if cli_workspace:
        ws = Path(cli_workspace).resolve()
    else:
        info(f"The workspace root is the shared folder containing 'ai/' and all project repos.")
        info(f"Detected default: {default}")
        raw = ask("Workspace root path", str(default))
        ws = Path(raw).resolve()

    if not ws.exists():
        info(f"Directory does not exist. Creating: {ws}")
        ws.mkdir(parents=True, exist_ok=True)

    success(f"Workspace: {ws}")
    return ws


def _parse_pod_info(pod_info_path: Path) -> dict | None:
    """Parse ai/pod-info.md (simple key-value format). Returns None on failure."""
    try:
        text = pod_info_path.read_text(encoding="utf-8")
    except OSError:
        return None

    kv = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        kv[key.strip().lower()] = val.strip()

    namespace = kv.get("pod namespace")
    domain = kv.get("domain")
    pod_group = kv.get("pod group")
    pod_name = kv.get("pod name")
    git_parent = kv.get("git parent url")
    if not (namespace and domain and pod_group and pod_name and git_parent):
        return None

    git_parent = git_parent.rstrip("/")
    if git_parent.startswith("git@"):
        git_parent_https = _to_https_url(git_parent)
    else:
        git_parent_https = git_parent

    ai_repo_url_https = f"{git_parent_https}/ai"
    if git_parent.endswith(".git"):
        base = git_parent_https.rstrip("/")
        if base.endswith(".git"):
            base = base[:-4]
        ai_repo_url_https = f"{base}/ai"

    ai_repo_url_ssh = _to_ssh_url(ai_repo_url_https)

    return {
        "namespace": namespace,
        "domain": domain,
        "pod_group": pod_group,
        "pod_name": pod_name,
        "git_parent": git_parent,
        "git_parent_https": git_parent_https,
        "ai_repo_url_ssh": ai_repo_url_ssh,
        "ai_repo_url_https": ai_repo_url_https,
    }


def capture_pod_info(workspace: Path) -> dict:
    """Resolve POD identity — re-use existing `ai/pod-info.md` if present, else prompt.

    Prompts for a pod slug and looks it up in the IDP Onboarding API. Accepts
    'dummy-pod' (default) for demo/test setups. Falls back to offering the dummy
    config when a slug is not found or the API is unreachable.

    Returns a dict with keys: namespace, domain, pod_group, pod_name, git_parent,
    git_parent_https, ai_repo_url_ssh, ai_repo_url_https.
    """
    step("1.2", "POD Identity")

    # Check both "ai" and "ai-workspace" for existing pod-info.md
    # We don't know which one to use until after POD identity is determined
    existing_pod_info_ai = workspace / "ai" / "pod-info.md"
    existing_pod_info_ai_workspace = workspace / "ai-workspace" / "pod-info.md"
    
    # Use whichever exists (ai-workspace takes precedence if both exist)
    if existing_pod_info_ai_workspace.exists():
        existing_pod_info = existing_pod_info_ai_workspace
    elif existing_pod_info_ai.exists():
        existing_pod_info = existing_pod_info_ai
    else:
        existing_pod_info = None
    # Remembered when the user declines an existing pod-info.md; used later to
    # detect and warn about mismatches with the newly entered slug.
    existing_pod_name: str | None = None

    if existing_pod_info and existing_pod_info.is_file():
        parsed = _parse_pod_info(existing_pod_info)
        if parsed:
            success(f"Found existing POD identity at {existing_pod_info}")
            info(f"  POD Namespace : {parsed['namespace']}")
            info(f"  Domain        : {parsed['domain']}")
            info(f"  POD Group     : {parsed['pod_group']}")
            info(f"  POD Name      : {parsed['pod_name']}")
            info(f"  Git parent    : {parsed['git_parent']}")
            
            # Transform URLs to use ai-workspace.git instead of ai.git
            # Handle various formats: /ai.git, /ai", or just /ai at the end
            for key in ['ai_repo_url_ssh', 'ai_repo_url_https']:
                url = parsed[key]
                if url.endswith('/ai.git'):
                    url = url[:-8] + '/ai-workspace.git'
                elif url.endswith('/ai"'):
                    url = url[:-4] + '/ai-workspace.git"'
                elif url.endswith('/ai'):
                    url = url[:-3] + '/ai-workspace.git'
                parsed[key] = url
            
            # Always show ai-workspace/ repo label since that's the actual repo name
            info(f"  ai-workspace/ repo (SSH): {parsed['ai_repo_url_ssh']}")
            info(f"  ai-workspace/ repo (HTTP): {parsed['ai_repo_url_https']}")
            if ask_yn("Use this POD identity?", default=True):
                return parsed
            # User declined — remember the existing pod name for the mismatch check below,
            # then fall through to the interactive slug prompt.
            existing_pod_name = parsed.get("pod_name")
            warn("Re-entering POD identity...")
            info()
        else:
            warn(f"{existing_pod_info} exists but could not be parsed — falling back to prompts.")

    info("Enter your POD slug to retrieve POD identity from the onboarding registry.")
    info(f"  Press Enter to use the {C.BOLD}dummy-pod{C.RESET} demo configuration.\n")

    while True:
        pod_slug = ask("POD slug", _DUMMY_POD_SLUG).strip() or _DUMMY_POD_SLUG

        # Dummy-pod path — use hardcoded demo config, no API call
        if pod_slug == _DUMMY_POD_SLUG:
            info(f"Using dummy-pod demo configuration:")
            info(f"  Namespace : {C.BOLD}{_DUMMY_POD_INFO['namespace']}{C.RESET}")
            info(f"  Git parent: {_DUMMY_POD_INFO['git_parent']}")
            return _DUMMY_POD_INFO

        # API lookup
        info(f"Looking up '{pod_slug}' in the POD registry…")
        try:
            api_pod = _fetch_pod_from_api(pod_slug)
        except PodApiUnavailableError as e:
            warn(f"POD registry API is unavailable: {e}")
            warn("Check your network connection or VPN and try again.")
            info()
            if ask_yn("Use dummy-pod configuration instead?", default=True):
                info(f"Using dummy-pod demo configuration:")
                info(f"  Namespace : {C.BOLD}{_DUMMY_POD_INFO['namespace']}{C.RESET}")
                info(f"  Git parent: {_DUMMY_POD_INFO['git_parent']}")
                return _DUMMY_POD_INFO
            continue  # User wants to retry — loop back to slug prompt

        if api_pod:
            # Resolve the full hierarchy (guild/domain -> pod_group -> pod)
            try:
                hierarchy = _resolve_pod_hierarchy(api_pod)
            except ValueError as e:
                warn(f"POD hierarchy resolution failed: {e}")
                warn(f"This POD ('{pod_slug}') has data integrity issues in the registry.")
                if ask_yn("Try a different POD slug?", default=True):
                    continue  # Loop back to try another slug
                if ask_yn("Use dummy-pod configuration instead?", default=False):
                    return _DUMMY_POD_INFO
                continue  # Loop back to try another slug
            
            if not hierarchy:
                warn("Could not resolve POD hierarchy from API data.")
                if ask_yn("Use dummy-pod configuration instead?", default=False):
                    return _DUMMY_POD_INFO
                continue  # Loop back to try another slug
            
            parent_slug = hierarchy["parent_slug"]
            parent_type = hierarchy["parent_type"]
            pod_group = hierarchy["pod_group_slug"]
            pod_name = hierarchy["pod_slug"]
            
            # Build namespace: parent/pod_group/pod (for organizational display)
            namespace = f"{parent_slug}/{pod_group}/{pod_name}"
            
            # Derive git parent URL using Primary CMDB ID and POD Slug
            # GitLab structure: https://gitlab.dell.com/{Primary CMDB ID}/{POD-Slug}
            primary_cmdb_id = api_pod.get("appId")  # Using appId as Primary CMDB ID
            if not primary_cmdb_id:
                raise ValueError(f"POD '{pod_name}' is missing Primary CMDB ID (appId field). "
                               f"Cannot construct Git repository URL without CMDB ID.")
            
            git_parent = f"https://gitlab.dell.com/{primary_cmdb_id}/{pod_name}"

            success("POD found in registry:")
            info(f"  Namespace : {C.BOLD}{namespace}{C.RESET}")
            info(f"  {parent_type.title():11} : {parent_slug}")
            info(f"  POD Group : {pod_group}")
            info(f"  POD Name  : {pod_name}")
            info(f"  CMDB ID   : {primary_cmdb_id}")
            info(f"  Git parent: {git_parent}")

            if ask_yn("Use this POD identity?", default=True):
                # ── Collect all API data for comprehensive pod-info.md ──────────
                info("Collecting comprehensive POD information from API...")
                
                # Start with the POD data we already have
                api_data = {"pod": api_pod}
                
                # Fetch POD Group details
                pod_group_id = api_pod.get('podGroupId')
                if pod_group_id:
                    try:
                        pod_group_data = _fetch_podgroup_by_id(pod_group_id)
                        if pod_group_data:
                            api_data["pod_group"] = pod_group_data
                            
                            # Fetch Guild details if POD Group belongs to a Guild
                            guild_id = pod_group_data.get('guildId')
                            if guild_id:
                                guild_data = _fetch_guild_by_id(guild_id)
                                if guild_data:
                                    api_data["guild"] = guild_data
                            
                            # Fetch Domain details if POD Group belongs to a Domain
                            domain_id = pod_group_data.get('domainId')
                            if domain_id:
                                domain_data = _fetch_domain_by_id(domain_id)
                                if domain_data:
                                    api_data["domain"] = domain_data
                    except Exception as exc:
                        warn(f"Could not fetch complete hierarchy data: {exc}")
                        # Continue with partial data
                
                success(f"Collected comprehensive POD data with {len(api_data)} levels of hierarchy")
                
                # ── Mismatch guard ────────────────────────────────────────────
                # If the user previously declined an existing pod-info.md and the
                # newly confirmed pod is different, require explicit confirmation
                # before replacing the on-disk identity.
                if existing_pod_name and pod_name != existing_pod_name:
                    warn(f"The new POD differs from the existing pod-info.md on disk.")
                    info(f"  Existing : {C.BOLD}{existing_pod_name}{C.RESET}")
                    info(f"  New      : {C.BOLD}{pod_name}{C.RESET}")
                    if not ask_yn(
                        f"Confirm switching from '{existing_pod_name}' to '{pod_name}'?",
                        default=False,
                    ):
                        # User backed out — loop so they can enter a different slug
                        continue
                    # Confirmed switch — remove the stale file so _write_pod_info
                    # can write the correct identity (it never overwrites by default).
                    try:
                        existing_pod_info.unlink()
                        success(f"Removed stale pod-info.md ({existing_pod_name}) — will write updated identity.")
                    except Exception as exc:
                        warn(f"Could not remove existing pod-info.md: {exc}")
                # ─────────────────────────────────────────────────────────────
                # Store the parent info for compatibility
                domain = parent_slug  # For backwards compatibility, store parent as 'domain'
                break  # proceed to URL derivation below
            # User rejected — loop back to slug prompt
            continue

        # Not found or API error
        warn(f"POD '{pod_slug}' was not found in the registry.")
        if ask_yn("Use dummy-pod configuration instead?", default=False):
            info(f"Using dummy-pod demo configuration:")
            info(f"  Namespace : {C.BOLD}{_DUMMY_POD_INFO['namespace']}{C.RESET}")
            info(f"  Git parent: {_DUMMY_POD_INFO['git_parent']}")
            return _DUMMY_POD_INFO
        # Loop back to try another slug

    # Derive ai-workspace repo URLs in both protocols (SSH for push, HTTPS for API calls)
    # Always use ai-workspace.git as the repo name
    if git_parent.endswith(".git"):
        base = git_parent[:-4].rstrip("/")
        ai_repo_url_https = f"{base}/ai-workspace.git"
    elif git_parent.startswith("git@"):
        ai_repo_url_https = _to_https_url(git_parent) + "/ai-workspace.git"
    else:
        ai_repo_url_https = f"{git_parent}/ai-workspace.git"

    ai_repo_url_ssh = _to_ssh_url(ai_repo_url_https)
    git_parent_https = _to_https_url(git_parent) if git_parent.startswith("git@") else git_parent

    # Derive workspace repo URL (Git parent + ai-workspace.git)
    if git_parent.endswith(".git"):
        base = git_parent[:-4].rstrip("/")
        workspace_repo_url_https = f"{base}/ai-workspace.git"
    elif git_parent.startswith("git@"):
        workspace_repo_url_https = _to_https_url(git_parent).rstrip("/") + "/ai-workspace.git"
    else:
        workspace_repo_url_https = f"{git_parent.rstrip('/')}/ai-workspace.git"

    workspace_repo_url_ssh = _to_ssh_url(workspace_repo_url_https)

    success(f"POD identity captured: {namespace}")
    info(f"  Git parent      : {git_parent}")
    info(f"  ai/ repo        : {ai_repo_url_ssh}  (SSH)")
    info(f"                   {ai_repo_url_https}  (HTTPS)")
    info(f"  Workspace repo  : {workspace_repo_url_ssh}  (SSH)")
    info(f"                   {workspace_repo_url_https}  (HTTPS)")

    return {
        "namespace": namespace,
        "domain": domain,
        "pod_group": pod_group,
        "pod_name": pod_name,
        "git_parent": git_parent,
        "git_parent_https": git_parent_https,
        "ai_repo_url_ssh": ai_repo_url_ssh,
        "ai_repo_url_https": ai_repo_url_https,
        "workspace_repo_url_ssh": workspace_repo_url_ssh,
        "workspace_repo_url_https": workspace_repo_url_https,
        "api_data": api_data if 'api_data' in locals() else None,
        "jira_base_url": _DEFAULT_JIRA_URL if 'api_data' in locals() else None,
        "pod_confirmed": True,  # Flag to indicate user confirmed POD identity
    }


def _write_pod_info(ai_dir: Path, pod_info: dict):
    """Write ai/pod-info.md with essential POD information from API.

    Never overwrites an existing file — cloned repos are expected to have this
    file version-controlled in the remote.
    """
    import datetime
    dst = ai_dir / "pod-info.md"
    if dst.exists():
        info("ai/pod-info.md already exists — keeping existing file (not overwriting).")
        return

    timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        git_user = subprocess.check_output(
            ["git", "config", "user.name"], text=True
        ).strip() or getpass.getuser()
    except Exception:
        git_user = getpass.getuser()

    # Basic POD identity (always present)
    content = (
        f"POD Namespace: {pod_info['namespace']}\n"
        f"Domain: {pod_info['domain']}\n"
        f"POD Group: {pod_info['pod_group']}\n"
        f"POD Name: {pod_info['pod_name']}\n"
        f"Git Parent URL: {pod_info['git_parent']}\n"
        f"Captured At: {timestamp}\n"
        f"Captured By: {git_user}\n"
    )
    
    # Add JIRA info for dummy-pod (no API data available)
    jira_project_key = pod_info.get('jira_project_key')
    if not pod_info.get('api_data') and jira_project_key:
        jira_project_name = pod_info.get('jira_project_name', jira_project_key)
        jira_link = f"{_DEFAULT_JIRA_URL}/projects/{jira_project_key}"
        content += f"\n# === Essential POD Information ===\n"
        content += f"JIRA Project: {jira_project_name} ({jira_project_key})\n"
        content += f"JIRA Project Link: {jira_link}\n"

    # Add essential API data if available (from real POD, not dummy-pod)
    api_data = pod_info.get('api_data')
    if api_data:
        content += "\n# === Essential POD Information ===\n"
        
        # POD Details - Key information only
        pod_data = api_data.get('pod', {})
        if pod_data:
            content += f"POD ID: {pod_data.get('id', 'N/A')}\n"
            content += f"POD Status: {pod_data.get('status', 'N/A')}\n"
            content += f"POD Type: {pod_data.get('podType', 'N/A')}\n"
            content += f"App ID (CMDB ID): {pod_data.get('appId', 'N/A')}\n"
            
            # JIRA Project Information
            jira_project = pod_data.get('jiraProjectName', 'N/A')
            jira_key = pod_data.get('jiraProjectKey', 'N/A')
            jira_base_url = pod_info.get('jira_base_url', _DEFAULT_JIRA_URL)
            
            if jira_project != 'N/A' or jira_key != 'N/A':
                content += f"JIRA Project: {jira_project} ({jira_key})\n"
                # Add complete JIRA link if we have the key and base URL
                if jira_key != 'N/A' and jira_base_url:
                    jira_link = f"{jira_base_url}/projects/{jira_key}"
                    content += f"JIRA Project Link: {jira_link}\n"
            
            # POD Members/Developers
            developers = pod_data.get('developers', [])
            if developers:
                content += f"POD Members: {', '.join(developers)}\n"
            
            # POD Lead
            pod_lead_email = pod_data.get('podLeadEmail', '')
            if pod_lead_email:
                content += f"POD Lead: {pod_lead_email}\n"
        
        # POD Group Details - Essential info only
        pod_group_data = api_data.get('pod_group', {})
        if pod_group_data:
            content += f"POD Group Name: {pod_group_data.get('podGroupName', 'N/A')}\n"
            content += f"POD Group Lead: {pod_group_data.get('podGroupLeadName', 'N/A')} ({pod_group_data.get('podGroupLeadEmail', 'N/A')})\n"
            
            # POD Group Description (if available)
            description = pod_group_data.get('podGroupDescription', '')
            if description and description.strip():
                content += f"POD Group Description: {description}\n"
        
        # Parent Hierarchy - Guild or Domain name only
        guild_data = api_data.get('guild', {})
        domain_data = api_data.get('domain', {})
        
        if guild_data:
            content += f"Guild: {guild_data.get('guildName', 'N/A')}\n"
        elif domain_data:
            content += f"Domain: {domain_data.get('domainName', 'N/A')}\n"

    dst.write_text(content, encoding="utf-8")
    success(f"Wrote ai/pod-info.md ({pod_info['namespace']}).")


def _get_git_remote_url(repo_dir: Path) -> str | None:
    """Return the `origin` remote URL for a git repo, or None if not configured."""
    try:
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            cwd=repo_dir, capture_output=True, text=True, timeout=10,
        )
        if result.returncode == 0:
            url = result.stdout.strip()
            return url or None
    except (subprocess.SubprocessError, OSError):
        pass
    return None


def check_ai_repo(workspace: Path, pod_info: dict) -> Path:
    """Ensure the workspace git repo exists and ai/ directory is set up."""
    # Always use ai as the directory name
    ai_dir_name = _get_ai_dir_name(pod_info)
    ai_dir = workspace / ai_dir_name

    if (workspace / ".git").is_dir():
        success(f"Workspace git repo found at {workspace}")
        remote = _get_git_remote_url(workspace)
        if remote:
            info(f"  Git remote (origin): {remote}")
            info("  Existing repo with a configured remote — skipping create/clone prompts.")
        else:
            warn("Workspace repo has no 'origin' remote configured.")
            # Offer to push now (only for real PODs, skip for dummy PODs)
            ssh_url = pod_info.get("ai_repo_url_ssh", "")
            https_url = pod_info.get("ai_repo_url_https", "")
            if ssh_url or https_url and not is_dummy:
                prompt = "Push workspace repo to remote now?"
                    
                if ask_yn(prompt, default=True):
                    _push_workspace_repo(workspace, pod_info)
                else:
                    info(f"  You can push later: cd {workspace} && git remote add origin <url> && git push -u origin main")
        _ensure_ai_scaffold(ai_dir)
        _write_pod_info(ai_dir, pod_info)
        _create_gitignore(workspace)
        return ai_dir

    if workspace.is_dir():
        ai_dir.mkdir(parents=True, exist_ok=True)
        _ensure_ai_scaffold(ai_dir)
        _write_pod_info(ai_dir, pod_info)
        _create_gitignore(workspace)
        # Initialize git in workspace root if not already a git repo
        if not (workspace / ".git").is_dir():
            info(f"Initializing git repo in: {workspace}")
            try:
                run_cmd(["git", "init", "-b", "main"], cwd=workspace)
                run_cmd(["git", "add", "."], cwd=workspace)
                run_cmd(["git", "commit", "-m", "JIRA#JIRA-0000; Initial commit — workspace scaffold"], cwd=workspace)
                success(f"Workspace repo initialized at {workspace}")
            except subprocess.CalledProcessError as e:
                error(f"git init/commit failed: {e.stderr.strip() if e.stderr else str(e)}")
        return ai_dir

    info("Workspace git repo not found.")
    info("The workspace repo stores ai/ directory with domain docs (ai/raw/) and AI-generated specs (ai/knowledge/).\n")
    info(f"  {C.BOLD}1. Create{C.RESET}  — Create a new workspace repo locally (recommended)")
    info(f"  {C.BOLD}2. Clone{C.RESET}   — Clone an existing workspace repo from a remote URL\n")

    choice = ask("Select option (1/2)", "1")

    if choice == "2":
        # ── Clone existing workspace repo, then ensure scaffold dirs exist ──
        default_url = pod_info["ai_repo_url_ssh"]
        url = ask("Full git clone URL for the workspace repo", default_url).strip()
        if not url:
            error("No URL provided. The workspace repo is required — please clone it manually and re-run.")
            sys.exit(1)
        try:
            # Clone to parent directory, then move to workspace
            parent = workspace.parent
            temp_name = workspace.name + "-temp"
            run_cmd(["git", "clone", url, temp_name], cwd=parent)
            # Move contents to workspace
            if workspace.exists():
                shutil.rmtree(workspace)
            shutil.move(parent / temp_name, workspace)
            success("Workspace repo cloned successfully.")
            _ensure_ai_scaffold(ai_dir)
            _write_pod_info(ai_dir, pod_info)
        except subprocess.CalledProcessError as e:
            error(f"git clone failed: {e.stderr}")
            error("Please clone the workspace repo manually and re-run this script.")
            sys.exit(1)
    else:
        # ── Create new workspace repo (default) ──
        _create_workspace_repo(workspace, ai_dir, pod_info)

    return ai_dir


def _ensure_workspace_readme(workspace: Path, pod_info: dict):
    """Ensure a README.md exists at the workspace root with directory tree and git repository description."""
    readme = workspace / "README.md"
    ai_dir_name = _get_ai_dir_name(pod_info)
    
    # Detect existing submodules
    submodules = []
    gitmodules = workspace / ".gitmodules"
    if gitmodules.exists():
        try:
            import configparser
            config = configparser.ConfigParser()
            config.read(gitmodules)
            for section in config.sections():
                if section.startswith("submodule "):
                    path = config.get(section, "path", fallback="")
                    if path:
                        submodules.append(path)
        except Exception:
            pass
    
    # Build the project repos section of the tree
    project_repos_section = ""
    if submodules:
        for sub in submodules:
            project_repos_section += f"├── {sub}/              ← Project repository (Git submodule)\n"
    else:
        project_repos_section = "└── [project-repos]/       ← Project repositories (Git submodules)\n"
    
    # Build the complete directory tree with .gitignore
    directory_tree = (
        "workspace/ (git repo root)\n"
        f"├── .gitignore             ← Git ignore patterns (credentials, IDE files, etc.)\n"
        f"├── {ai_dir_name}/           ← AI knowledge base (POD identity, governance, specs)\n"
        f"│   ├── pod-info.md        ← POD identity (namespace, domain, pod group, Git parent)\n"
        f"│   ├── harness/\n"
        f"│   │   ├── CONSTITUTION.md ← Architectural governance & engineering principles\n"
        f"│   │   ├── AGENTS.md       ← Workspace context (master copy — mirrored to workspace root)\n"
        f"│   │   └── LEARNINGS.md    ← Secondary memory (master copy — mirrored to workspace root)\n"
        f"│   ├── raw/               ← Human-written domain docs (input)\n"
        f"│   ├── knowledge/         ← AI-generated specs (output of /create-pod-knowledge)\n"
        f"│   └── specs/             ← Per-feature specs, plans, and summaries\n"
        f"├── AGENTS.md              ← Workspace context (mirrored from {ai_dir_name}/harness/AGENTS.md)\n"
        f"├── LEARNINGS.md           ← Secondary memory (mirrored from {ai_dir_name}/harness/LEARNINGS.md)\n"
        "├── local.config           ← Local configuration (service URLs, PATs, etc.)\n"
        "├── .windsurf/             ← Windsurf AI tooling configuration\n"
        "│   ├── workflows/         ← AI workflows for Windsurf\n"
        "│   └── hooks.json         ← Git hooks configuration\n"
        "├── .devin/                ← Devin AI tooling configuration\n"
        "│   └── skills/            ← AI skills for Devin\n"
        f"{project_repos_section}"
    )
    
    if not readme.exists():
        # Create new README.md
        readme.write_text(
            "# POD Workspace\n\n"
            "This is the POD workspace repository. It contains the AI knowledge base,\n"
            "project repositories as submodules, and configuration files for AI tooling.\n\n"
            "## Git Repository\n\n"
            f"This Git repository is named `{ai_dir_name}-workspace.git` in GitLab. The workspace root\n"
            f"(this directory) is the Git repository, and the {ai_dir_name}/ subdirectory contains the\n"
            "AI knowledge base. All project repositories are managed as Git submodules\n"
            "under this workspace.\n\n"
            "## Structure\n\n"
            "```\n"
            f"{directory_tree}"
            "```\n\n"
            "## Getting Started\n\n"
            "1. Configure service URLs and PATs in `local.config`\n"
            f"2. Place human domain docs in `{ai_dir_name}/raw/` (architecture docs, requirements, API refs, etc.)\n"
            "3. Run `/create-pod-knowledge` to generate AI-readable specs\n"
            "4. Start delivering features with `/sdlc <JIRA-ID>`\n\n"
            "## Project Repositories\n\n"
            "Project repositories are added as Git submodules under the workspace root.\n"
            "Use `git submodule add <repo-url>` to add new projects.\n",
            encoding="utf-8",
        )
    else:
        # Update existing README.md to ensure .gitignore is in the directory tree
        content = readme.read_text(encoding="utf-8")
        
        # Check if .gitignore is already in the directory tree
        if "├── .gitignore" in content:
            info("README.md already includes .gitignore in directory tree")
            return
        
        # Find the directory tree section and update it
        lines = content.split("\n")
        in_tree = False
        tree_start = -1
        tree_end = -1
        
        for i, line in enumerate(lines):
            if line.strip() == "```" and not in_tree:
                tree_start = i
                in_tree = True
            elif line.strip() == "```" and in_tree:
                tree_end = i
                break
        
        if tree_start != -1 and tree_end != -1:
            # Replace the directory tree with the updated one
            new_lines = lines[:tree_start + 1] + [directory_tree] + lines[tree_end:]
            readme.write_text("\n".join(new_lines), encoding="utf-8")
            success("Updated README.md to include .gitignore in directory tree")
        else:
            warn("Could not find directory tree in README.md to update")


def _ensure_ai_scaffold(ai_dir: Path):
    """Ensure the standard ai/ directory structure exists (idempotent)."""
    (ai_dir / "raw").mkdir(exist_ok=True)
    (ai_dir / "knowledge").mkdir(exist_ok=True)
    (ai_dir / "specs").mkdir(exist_ok=True)

    readme = ai_dir / "README.md"
    if not readme.exists():
        readme.write_text(
            "# AI Knowledge Base\n\n"
            "This repository stores domain documentation, AI-generated specs,\n"
            "and the harness files that govern this POD (constitution, agents,\n"
            "and learnings).\n\n"
            "## Repository Information\n\n"
            "This is the AI knowledge base repository for your POD. It contains:\n"
            "- POD identity and metadata (pod-info.md)\n"
            "- Architectural governance (CONSTITUTION.md)\n"
            "- Workspace context (AGENTS.md)\n"
            "- Developer learnings (LEARNINGS.md)\n"
            "- Human-written domain documentation (raw/)\n"
            "- AI-generated specifications (knowledge/)\n"
            "- Feature-specific artifacts (specs/)\n\n"
            "## Structure\n\n"
            "```\n"
            f"{ai_dir.name}/\n"
            "├── pod-info.md       ← POD identity (namespace, domain, pod group, Git parent)\n"
            "├── harness/\n"
            "│   ├── CONSTITUTION.md ← Architectural governance & engineering principles\n"
            "│   ├── AGENTS.md       ← Workspace context (master copy — mirrored to workspace root)\n"
            "│   └── LEARNINGS.md    ← Secondary memory (master copy — mirrored to workspace root)\n"
            "├── raw/              ← Human-written domain docs (input)\n"
            "├── knowledge/        ← AI-generated specs (output of /create-pod-knowledge)\n"
            "│   ├── POD.md         ← Executive POD summary\n"
            "│   ├── functional-spec.md\n"
            "│   ├── technical-spec.md\n"
            "│   ├── data-model-spec.md\n"
            "│   ├── api-spec.md\n"
            "│   ├── integration-spec.md\n"
            "│   ├── security-spec.md\n"
            "│   ├── deployment-spec.md\n"
            "│   ├── nfr-spec.md\n"
            "│   ├── flows/          ← Mermaid flow diagrams\n"
            "│   ├── data/           ← Sample JSON payloads\n"
            "│   └── CHANGELOG.md    ← Knowledge-base audit trail\n"
            "└── specs/            ← Per-feature specs, plans, and summaries\n"
            "    └── {JIRA-ID}/\n"
            "        ├── specs.md         ← Requirements, scope, FRs, ACs, NFRs\n"
            "        ├── plan.md          ← File-level implementation plan\n"
            "        └── change-summary.md ← Per-project changes, MR links, traceability\n"
            "```\n"
            "## Getting Started\n\n"
            "1. Place human domain docs in `raw/` (architecture docs, requirements, API refs, etc.)\n"
            "2. Run `/create-pod-knowledge` to generate AI-readable specs\n"
            "3. Start delivering features with `/sdlc <JIRA-ID>`\n\n"
            "## Git Repository\n\n"
            f"This repository is named `{ai_dir.name}-workspace.git` in GitLab but the local directory is named `{ai_dir.name}/`.\n"
            "The workspace root (parent directory) is the Git repository, not this subdirectory.\n",
            encoding="utf-8",
        )

    # Ensure harness/ exists
    harness_dir = ai_dir / "harness"
    harness_dir.mkdir(exist_ok=True)

    # Copy CONSTITUTION.md template into ai/harness/ (ships with the starter kit)
    constitution_dst = harness_dir / "CONSTITUTION.md"
    if not constitution_dst.exists():
        constitution_src = SETUP_DIR / "CONSTITUTION.md"
        if constitution_src.exists():
            shutil.copy2(constitution_src, constitution_dst)
            success("Copied CONSTITUTION.md template into ai/harness/")
        else:
            warn("CONSTITUTION.md template not found in starter kit — skipping.")
    else:
        info("ai/harness/CONSTITUTION.md already exists — keeping existing file.")

    # Skills are generated from SETUP_DIR/skills and installed directly to .windsurf/workflows and .devin/skills
    # No need to copy them to ai/harness/skills

    for subdir in ["raw", "knowledge", "specs"]:
        gitkeep = ai_dir / subdir / ".gitkeep"
        if not gitkeep.exists():
            gitkeep.write_text("", encoding="utf-8")

    # Copy contract.md template from ai/contracts
    contracts_dir = ai_dir / "contracts"
    contracts_dir.mkdir(exist_ok=True)
    contract_dst = contracts_dir / "contract-template.md"
    contract_src = SETUP_DIR / "contracts" / "contract-template.md"
    if not contract_dst.exists() and contract_src.exists():
        shutil.copy2(contract_src, contract_dst)
        success("Copied contract-template.md template from ai/contracts to ai/contracts/")
    elif contract_dst.exists():
        info("ai/contracts/contract-template.md already exists — keeping existing file.")
    else:
        warn(f"contract-template.md template not found at {contract_src} — skipping.")

    # Seed AGENTS.md / LEARNINGS.md templates into ai/harness/ and mirror to workspace root.
    _seed_ai_agents_and_learnings(ai_dir)

    success("ai/ scaffold ensured: pod-info.md, harness/ (CONSTITUTION.md, AGENTS.md, LEARNINGS.md, skills/), raw/, knowledge/, specs/, contracts/, README.md")


def _seed_ai_agents_and_learnings(ai_dir: Path):
    """Seed AGENTS.md and LEARNINGS.md templates into ai/harness/ on a newly-created ai/ repo,
    and mirror them to the workspace root.

    Master copies live under `ai/harness/` so they are version-controlled with the rest of
    the harness. The workspace-root copies at `<workspace>/AGENTS.md` and
    `<workspace>/LEARNINGS.md` are runtime mirrors read directly by AI tooling.

    For cloned ai/ repos, the master copies are expected to already exist in the remote;
    this function only writes when the files are missing.
    """
    workspace_root = ai_dir.parent
    harness_dir = ai_dir / "harness"
    harness_dir.mkdir(exist_ok=True)

    agents_master = harness_dir / "AGENTS.md"
    if not agents_master.exists():
        agents_master.write_text(
            "# AGENTS.md — Workspace Context\n\n"
            "> Generated template. Master copy lives here (`ai/harness/AGENTS.md`).\n"
            "> A mirror at the workspace root is what AI tooling actually reads.\n"
            "> Run `/create-pod-knowledge` to populate this file with a full workspace\n"
            "> context derived from the actual codebase.\n\n"
            "## Purpose\n\n"
            "This file is the canonical context document for AI agents operating in\n"
            "this workspace. It captures:\n\n"
            "- POD identity (see `ai/pod-info.md`)\n"
            "- POD name, sub-domain, and owned projects\n"
            "- Tech stack and architectural patterns\n"
            "- Build, test, lint, and run commands per project\n"
            "- Git conventions (branch names, commit format, MR target)\n"
            "- Coding conventions and cross-cutting constraints\n"
            "- Domain quick reference (core concepts, entities, flows)\n"
            "- Constitution summary (see `ai/harness/CONSTITUTION.md`)\n\n"
            "## Status\n\n"
            "**Not yet generated.** Run the `/create-pod-knowledge` skill to produce\n"
            "the real content.\n",
            encoding="utf-8",
        )
        success("Seeded ai/harness/AGENTS.md template.")

    learnings_master = harness_dir / "LEARNINGS.md"
    if not learnings_master.exists():
        learnings_master.write_text(
            "# LEARNINGS.md — Secondary Memory\n\n"
            "> Accumulated learnings, gotchas, and recipes discovered while working\n"
            "> in this workspace. Master copy at `ai/harness/LEARNINGS.md`; a mirror\n"
            "> at the workspace root is what AI tooling reads at runtime. Updated by\n"
            "> the `/update-knowledge` skill and by humans as they encounter new\n"
            "> insights.\n\n"
            "## How to use this file\n\n"
            "- Add concise, reusable learnings — not one-off debugging logs.\n"
            "- Each entry: short title, context, root cause (if applicable), and the\n"
            "  fix/approach that worked.\n"
            "- Prefer links to code, JIRA, and MRs over long prose.\n\n"
            "## Entries\n\n"
            "_No entries yet. The `/update-knowledge` skill will append here as\n"
            "features are delivered._\n",
            encoding="utf-8",
        )
        success("Seeded ai/harness/LEARNINGS.md template.")

    # Mirror master copies to workspace root (always — these are the runtime-read copies).
    for name in ("AGENTS.md", "LEARNINGS.md"):
        src = harness_dir / name
        dst = workspace_root / name
        if not src.exists():
            continue
        if dst.exists():
            info(f"{dst.name} already exists at workspace root — keeping existing file.")
            continue
        shutil.copy2(src, dst)
        success(f"Mirrored ai/harness/{name} {ARROW} {dst}")


def _mirror_harness_to_workspace(workspace: Path, pod_info: dict):
    """Copy AGENTS.md and LEARNINGS.md from ai/harness/ to the workspace root.

    This ensures the workspace-root mirrors exist even before
    /create-pod-knowledge is run. If the files already exist at the workspace
    root they are left untouched.
    """
    ai_dir_name = _get_ai_dir_name(pod_info)
    ai_harness = workspace / ai_dir_name / "harness"
    if not ai_harness.is_dir():
        return

    for name in ("AGENTS.md", "LEARNINGS.md"):
        src = ai_harness / name
        dst = workspace / name
        if not src.exists():
            continue
        if dst.exists():
            info(f"{dst.name} already exists at workspace root — keeping existing file.")
            continue
        shutil.copy2(src, dst)
        success(f"Mirrored ai/harness/{name} {ARROW} {dst}")


# ── Git credential helpers ────────────────────────────────────────────────

# Module-level cache so we only prompt once per session
_cached_git_pat: str | None = None


def _to_ssh_url(https_url: str) -> str:
    """Convert an HTTPS GitLab/GitHub URL to its SSH equivalent.

    Example: https://gitlab.dell.com/CMDB-001/pod-slug/ai-workspace
          -> git@gitlab.dell.com:CMDB-001/pod-slug/ai-workspace.git
    """
    parsed = urllib.parse.urlparse(https_url)
    host = parsed.hostname or ""
    path = parsed.path.strip("/")
    if not path.endswith(".git"):
        path += ".git"
    return f"git@{host}:{path}"


def _to_https_url(ssh_url: str) -> str:
    """Convert an SSH git URL to its HTTPS equivalent.

    Example: git@gitlab.dell.com:CMDB-001/pod-slug/ai-workspace.git
          -> https://gitlab.dell.com/CMDB-001/pod-slug/ai-workspace
    """
    # git@host:path.git
    if ssh_url.startswith("git@"):
        rest = ssh_url[4:]  # host:path.git
        host, _, path = rest.partition(":")
        if path.endswith(".git"):
            path = path[:-4]
        return f"https://{host}/{path}"
    return ssh_url


def _check_ssh_keys() -> bool:
    """Check if user has SSH keys for GitLab access.
    
    Returns True if SSH keys are found, False otherwise.
    On Windows, checks for id_rsa and id_ed25519 in ~/.ssh
    On Unix, checks for id_rsa and id_ed25519 in ~/.ssh
    """
    ssh_dir = Path.home() / ".ssh"
    if not ssh_dir.exists():
        return False
    
    # Check for common SSH key files
    key_files = ["id_rsa", "id_ed25519", "id_ecdsa", "id_ecdsa_sk", "id_ed25519_sk"]
    for key_file in key_files:
        if (ssh_dir / key_file).exists():
            return True
    
    return False


def _resolve_git_pat(workspace: Path | None = None) -> str:
    """Try to find a GIT_PAT without prompting. Checks env var -> local.config."""
    global _cached_git_pat
    if _cached_git_pat is not None:
        return _cached_git_pat

    pat = os.environ.get("GIT_PAT", "")
    if pat:
        _cached_git_pat = pat
        return pat

    # Try local.config candidates
    candidates = []
    if workspace:
        candidates.append(workspace / "local.config")
    candidates.append(Path.cwd() / "local.config")
    for cfg in candidates:
        if cfg.is_file():
            try:
                for line in cfg.read_text(encoding="utf-8").splitlines():
                    if line.startswith("GIT_PAT="):
                        pat = line.split("=", 1)[1].strip()
                        if pat:
                            _cached_git_pat = pat
                            return pat
            except OSError:
                pass

    return ""


def _ensure_gitlab_repository(git_parent_url: str, repo_name: str, pat: str = ""):
    """Ensure a GitLab repository exists under the git parent group, creating it if missing.

    Uses the GitLab REST API (v4) with the provided PAT. The function is
    best-effort — if the API call fails (e.g. permissions, network issues),
    it logs a warning and lets the caller proceed.
    """
    if not git_parent_url or not git_parent_url.startswith(("http://", "https://")):
        return  # SSH URLs or empty — skip API check

    # Parse host + group path from the URL
    parsed = urllib.parse.urlparse(git_parent_url)
    host = f"{parsed.scheme}://{parsed.hostname}"
    if parsed.port:
        host += f":{parsed.port}"
    # Group path is everything after the leading slash, e.g. "infrastructure/ase/dlf/licensing/dl-registrations"
    group_path = parsed.path.strip("/")
    if not group_path:
        return

    if not pat:
        warn("No GIT_PAT available — skipping automatic repository creation.")
        info("Ensure the repository exists on GitLab before pushing.")
        return

    # Check if the repository already exists
    encoded_group_path = urllib.parse.quote(group_path, safe="")
    encoded_repo_name = urllib.parse.quote(repo_name, safe="")
    api_url = f"{host}/api/v4/projects/{encoded_group_path}%2F{encoded_repo_name}"

    req = urllib.request.Request(api_url, method="GET")
    req.add_header("PRIVATE-TOKEN", pat)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                dim(f"GitLab repository already exists: {group_path}/{repo_name}")
                return True  # Repository exists
    except urllib.error.HTTPError as e:
        if e.code != 404:
            warn(f"GitLab API check failed (HTTP {e.code}). Will attempt to create anyway.")
    except (urllib.error.URLError, OSError) as e:
        warn(f"Could not reach GitLab API: {e}. Skipping repository creation.")
        return False

    # Repository does not exist — create it
    # Get the parent group ID
    encoded_group = urllib.parse.quote(group_path, safe="")
    group_api_url = f"{host}/api/v4/groups/{encoded_group}"

    req = urllib.request.Request(group_api_url, method="GET")
    req.add_header("PRIVATE-TOKEN", pat)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                group_data = json.loads(resp.read().decode("utf-8"))
                group_id = group_data.get("id")
            else:
                warn(f"Could not get parent group ID (HTTP {resp.status}). Skipping repository creation.")
                return False
    except (urllib.error.HTTPError, urllib.error.URLError, OSError, json.JSONDecodeError) as e:
        warn(f"Could not get parent group ID: {e}. Skipping repository creation.")
        return False

    # Create the repository under the parent group
    create_api_url = f"{host}/api/v4/projects"
    create_data = json.dumps({
        "name": repo_name,
        "namespace_id": group_id,
        "visibility": "private",
        "initialize_with_readme": False
    }).encode("utf-8")

    req = urllib.request.Request(create_api_url, data=create_data, method="POST")
    req.add_header("PRIVATE-TOKEN", pat)
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status in (201, 200):
                success(f"GitLab repository created: {group_path}/{repo_name}")
                return True  # Repository created
            else:
                warn(f"Failed to create repository (HTTP {resp.status}).")
                return False
    except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
        warn(f"Could not create repository: {e}. You may need to create it manually.")
        return False


def _check_gitlab_repository_exists(git_parent_url: str, pat: str = "") -> bool:
    """Check if a GitLab repository exists.

    Returns True if the repository exists, False otherwise.
    """
    if not git_parent_url or not git_parent_url.startswith(("http://", "https://")):
        return False  # SSH URLs or empty — assume it exists or can't check

    # Parse host + group path from the URL
    parsed = urllib.parse.urlparse(git_parent_url)
    host = f"{parsed.scheme}://{parsed.hostname}"
    if parsed.port:
        host += f":{parsed.port}"
    # Group path is everything after the leading slash
    group_path = parsed.path.strip("/")
    if not group_path:
        return False

    if not pat:
        warn("No GIT_PAT available — cannot verify repository existence.")
        return False

    encoded_group_path = urllib.parse.quote(group_path, safe="")
    api_url = f"{host}/api/v4/projects/{encoded_group_path}"

    req = urllib.request.Request(api_url, method="GET")
    req.add_header("PRIVATE-TOKEN", pat)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                return True  # Repository exists
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False  # Repository does not exist
        else:
            warn(f"GitLab API check failed (HTTP {e.code}). Assuming repository exists.")
            return True
    except (urllib.error.URLError, OSError) as e:
        warn(f"Could not reach GitLab API: {e}. Assuming repository exists.")
        return True

    return False


def _ensure_gitlab_subgroup(git_parent_url: str, pat: str = ""):
    """Ensure the Git Sub Group exists on GitLab, creating it if missing.

    Uses the GitLab REST API (v4) with the provided PAT. The function is
    best-effort — if the API call fails (e.g. permissions, network issues),
    it logs a warning and lets the caller proceed.
    """
    if not git_parent_url or not git_parent_url.startswith(("http://", "https://")):
        return  # SSH URLs or empty — skip API check

    # Parse host + group path from the URL
    parsed = urllib.parse.urlparse(git_parent_url)
    host = f"{parsed.scheme}://{parsed.hostname}"
    if parsed.port:
        host += f":{parsed.port}"
    # Group path is everything after the leading slash, e.g. "infrastructure/ase/dlf/licensing/dl-registrations"
    group_path = parsed.path.strip("/")
    if not group_path:
        return

    if not pat:
        warn("No GIT_PAT available — skipping automatic sub group creation.")
        info("Ensure the sub group exists on GitLab before pushing.")
        return

    encoded_path = urllib.parse.quote(group_path, safe="")
    api_url = f"{host}/api/v4/groups/{encoded_path}"

    # Check if the group already exists
    req = urllib.request.Request(api_url, method="GET")
    req.add_header("PRIVATE-TOKEN", pat)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                dim(f"Git Sub Group already exists: {group_path}")
                return
    except urllib.error.HTTPError as e:
        if e.code != 404:
            warn(f"GitLab API check failed (HTTP {e.code}). Will attempt to create anyway.")
    except (urllib.error.URLError, OSError) as e:
        warn(f"Could not reach GitLab API: {e}. Skipping sub group creation.")
        return

    # Group does not exist — create it
    # We need the parent group ID. Walk up one level.
    parts = group_path.rsplit("/", 1)
    if len(parts) < 2:
        warn("Cannot determine parent group for sub group creation.")
        return
    parent_path, subgroup_name = parts
    encoded_parent = urllib.parse.quote(parent_path, safe="")
    parent_api_url = f"{host}/api/v4/groups/{encoded_parent}"

    parent_req = urllib.request.Request(parent_api_url, method="GET")
    parent_req.add_header("PRIVATE-TOKEN", pat)
    parent_id = None
    try:
        with urllib.request.urlopen(parent_req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            parent_id = data.get("id")
    except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
        warn(f"Could not resolve parent group '{parent_path}': {e}")
        info("Ensure the sub group exists on GitLab before pushing.")
        return

    if not parent_id:
        warn(f"Could not determine ID for parent group '{parent_path}'.")
        return

    info(f"Creating Git Sub Group: {C.BOLD}{group_path}{C.RESET} ...")
    create_payload = json.dumps({
        "name": subgroup_name,
        "path": subgroup_name,
        "parent_id": parent_id,
        "visibility": "internal",
    }).encode("utf-8")
    create_req = urllib.request.Request(
        f"{host}/api/v4/groups",
        data=create_payload,
        method="POST",
    )
    create_req.add_header("PRIVATE-TOKEN", pat)
    create_req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(create_req, timeout=15) as resp:
            if resp.status in (200, 201):
                success(f"Created Git Sub Group: {group_path}")
            else:
                warn(f"Unexpected response (HTTP {resp.status}) when creating sub group.")
    except urllib.error.HTTPError as e:
        body = ""
        try:
            body = e.read().decode("utf-8", errors="replace")
        except Exception:
            pass
        if e.code == 409:
            dim(f"Git Sub Group already exists (409 conflict): {group_path}")
        else:
            warn(f"Failed to create sub group (HTTP {e.code}): {body}")
            info("Ensure the sub group exists on GitLab before pushing.")
    except (urllib.error.URLError, OSError) as e:
        warn(f"Network error creating sub group: {e}")
        info("Ensure the sub group exists on GitLab before pushing.")


def _is_dummy_pod(pod_info: dict) -> bool:
    """Check if this is a dummy POD configuration."""
    return pod_info.get("pod_name") == _DUMMY_POD_SLUG or pod_info.get("namespace", "").startswith("demo/")


def _get_ai_dir_name(pod_info: dict) -> str:
    """Get the AI directory name (always 'ai' regardless of POD type)."""
    return "ai"


def _push_workspace_repo(workspace: Path, pod_info: dict):
    """Push the workspace repo to its remote. Tries SSH then HTTPS with retry loop."""
    # Detect actual branch name (could be main or master)
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=workspace, capture_output=True, text=True, timeout=10,
        )
        branch = result.stdout.strip() if result.returncode == 0 else "main"
    except (subprocess.SubprocessError, OSError):
        branch = "main"

    ssh_url = pod_info.get("workspace_repo_url_ssh", "")
    https_url = pod_info.get("workspace_repo_url_https", "")
    if not ssh_url and not https_url:
        warn("Could not derive workspace repo URL. You can push manually later.")
        return

    info("")
    info(f"Pushing workspace repo to remote...")
    info(f"  SSH  : {C.BOLD}{ssh_url}{C.RESET}")
    info(f"  HTTPS: {C.BOLD}{https_url}{C.RESET}")

    # Resolve PAT (silently) for sub group creation
    pat = _resolve_git_pat(workspace)

    # Attempt repository creation via API if PAT is available (best-effort)
    git_parent_https = pod_info.get("git_parent_https", pod_info.get("git_parent", ""))
    _ensure_gitlab_repository(git_parent_https, "ai-workspace", pat=pat)

    # Ensure remote is configured
    existing_remote = _get_git_remote_url(workspace)
    if not existing_remote:
        run_cmd(["git", "remote", "add", "origin", ssh_url or https_url], cwd=workspace)

    # Push loop — allows retrying after manual sub group creation
    while True:
        # Try SSH
        if ssh_url:
            info("Trying push via SSH...")
            run_cmd(["git", "remote", "set-url", "origin", ssh_url], cwd=workspace)
            try:
                run_cmd(["git", "push", "-u", "origin", branch], cwd=workspace)
                success(f"Workspace repo pushed to {ssh_url}")
                return
            except subprocess.CalledProcessError as e:
                last_error = (e.stderr or e.stdout or str(e)).strip()
                dim(f"SSH push failed: {last_error}")

        # Try HTTPS
        if https_url:
            https_git = https_url if https_url.endswith(".git") else f"{https_url}.git"
            info("Trying push via HTTPS...")
            run_cmd(["git", "remote", "set-url", "origin", https_git], cwd=workspace)
            try:
                run_cmd(["git", "push", "-u", "origin", branch], cwd=workspace)
                success(f"Workspace repo pushed to {https_git}")
                return
            except subprocess.CalledProcessError as e:
                last_error = (e.stderr or e.stdout or str(e)).strip()
                dim(f"HTTPS push failed: {last_error}")

        # Both failed — offer retry or skip
        warn("Could not push workspace repo to remote.")
        info("")
        info("This usually means the Git Sub Group does not exist yet on GitLab.")
        info(f"  Create it at: {C.BOLD}{git_parent_https}{C.RESET}")
        info("")
        info(f"  {C.BOLD}1){C.RESET} Retry push (after creating the sub group)")
        info(f"  {C.BOLD}2){C.RESET} Skip — push workspace repo manually later")
        choice = ask("Choice [1/2]", "1").strip()
        if choice != "1":
            break

    info("")
    info("Push manually when ready:")
    info(f"  cd {workspace}")
    info(f"  git push -u origin {branch}")


def _create_gitignore(workspace: Path):
    """Create a .gitignore file in the workspace root."""
    gitignore_path = workspace / ".gitignore"
    gitignore_content = """# Credentials and secrets
local.config
*.key
*.pem
*.p12

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
venv/
ENV/
env/
.venv

# Jupyter Notebook
.ipynb_checkpoints

# pytest
.pytest_cache/
.coverage
htmlcov/

# MyPy
.mypy_cache/
.dmypy.json
dmypy.json

# Temporary files
*.tmp
*.temp
*.log
"""
    try:
        gitignore_path.write_text(gitignore_content, encoding="utf-8")
        success(f"Created .gitignore at {gitignore_path}")
    except Exception as exc:
        error(f"Failed to create .gitignore: {exc}")


def _create_workspace_repo(workspace: Path, ai_dir: Path, pod_info: dict):
    """Create a new workspace repo with ai/ directory structure."""
    info("Creating new workspace repository...")
    workspace.mkdir(parents=True, exist_ok=True)
    _ensure_ai_scaffold(ai_dir)
    _write_pod_info(ai_dir, pod_info)
    _create_gitignore(workspace)

    # git init at workspace root (the workspace is the Git Repo, ai/ is just a directory)
    info(f"Initializing git repo at: {C.BOLD}{workspace}{C.RESET}")
    try:
        run_cmd(["git", "init", "-b", "main"], cwd=workspace)
        run_cmd(["git", "add", "."], cwd=workspace)
        run_cmd(["git", "commit", "-m", "JIRA#JIRA-0000; Initial commit — workspace with ai knowledge base scaffold"], cwd=workspace)
        success(f"Workspace repo created at {workspace}")
    except subprocess.CalledProcessError as e:
        error(f"git init/commit failed: {e.stderr.strip() if e.stderr else str(e)}")
        return

    # Ask user if they want to push now
    ssh_url = pod_info.get("workspace_repo_url_ssh", "")
    https_url = pod_info.get("workspace_repo_url_https", "")

    if ssh_url or https_url:
        # Set default based on POD type - dummy PODs default to No, real PODs to Yes
        is_dummy = _is_dummy_pod(pod_info)
        default_push = not is_dummy

        if is_dummy:
            prompt = "Push the workspace repo to remote now? (dummy POD - repository may not exist)"
        else:
            prompt = "Push the workspace repo to remote now?"

        if ask_yn(prompt, default=default_push):
            _push_workspace_repo(workspace, pod_info)
        else:
            info(f"\nTo push the workspace repo to remote later:")
            info(f"  cd {workspace}")
            if ssh_url:
                info(f"  git remote add origin {ssh_url}")
            else:
                info(f"  git remote add origin {https_url}")
            info(f"  git push -u origin main\n")
    else:
        info(f"\nNo remote URL configured. To push the workspace repo later:")
        info(f"  cd {workspace}")
        info(f"  git remote add origin <remote-url>")
        info(f"  git push -u origin main\n")


def migrate_to_submodules(workspace: Path, pod_info: dict):
    """Convert existing workspace-root repos to submodules at workspace root."""
    step("1.4.1", "Migrate Workspace Repos to Submodules")
    
    ai_dir_name = _get_ai_dir_name(pod_info)
    
    # Detect repos at workspace root (excluding ai/)
    workspace_repos = []
    for child in sorted(workspace.iterdir()):
        if child.is_dir() and (child / ".git").is_dir() and child.name != ai_dir_name:
            workspace_repos.append(child)
    
    if not workspace_repos:
        info("No workspace-root repos found to migrate.")
        return
    
    info(f"Found {len(workspace_repos)} repos to migrate:")
    for repo in workspace_repos:
        info(f"  - {repo.name}")
    
    if not ask_yn("Proceed with migration? This will add repos as submodules at workspace root."):
        info("Migration cancelled.")
        return
    
    # Get the git parent URL from ai/pod-info.md if it exists
    git_parent = ""
    pod_info_file = workspace / ai_dir_name / "pod-info.md"
    if pod_info_file.exists():
        try:
            content = pod_info_file.read_text(encoding="utf-8")
            for line in content.split("\n"):
                if line.startswith("Git Parent URL:"):
                    git_parent = line.split(":", 1)[1].strip()
                    break
        except OSError:
            pass
    
    migrated = []
    failed = []
    
    for repo in workspace_repos:
        try:
            # Repo is already at workspace root, just add as submodule
            target = repo  # Already at correct location
            info(f"\nAdding {repo.name} as submodule at workspace root...")
            
            # Determine the submodule URL
            if git_parent:
                submodule_url = f"{git_parent}/{repo.name}.git"
            else:
                # Try to get the origin URL from the moved repo
                try:
                    result = subprocess.run(
                        ["git", "remote", "get-url", "origin"],
                        cwd=target,
                        capture_output=True,
                        text=True,
                        check=True
                    )
                    submodule_url = result.stdout.strip()
                except subprocess.CalledProcessError:
                    warn(f"Could not determine remote URL for {repo.name}")
                    submodule_url = f"<please-edit>.git"
            
            # Add as submodule at root
            info(f"Adding {repo.name} as submodule...")
            run_cmd(["git", "submodule", "add", submodule_url, repo.name], 
                    cwd=workspace)
            
            migrated.append(repo.name)
            success(f"{repo.name} migrated successfully.")
            
        except Exception as e:
            error(f"Failed to migrate {repo.name}: {e}")
            failed.append(repo.name)
    
    # Commit the migration if successful
    if migrated:
        info("\nCommitting migration changes...")
        try:
            run_cmd(["git", "add", ".gitmodules"], cwd=workspace)
            # Add each submodule directory to git
            for name in migrated:
                run_cmd(["git", "add", name], cwd=workspace)
            run_cmd(["git", "commit", "-m", 
                    f"JIRA#JIRA-0000; Migrate to submodule structure: {', '.join(migrated)}"], 
                    cwd=workspace)
            success("Migration committed to workspace repo.")
        except subprocess.CalledProcessError as e:
            warn(f"Failed to commit migration: {e}")
    
    if failed:
        warn(f"Failed to migrate: {', '.join(failed)}")
        info("Please migrate these manually.")
    
    # Initialize and update all submodules
    info("\nInitializing and updating submodules...")
    try:
        run_cmd(["git", "submodule", "update", "--init", "--recursive"], cwd=workspace)
        success("Submodules initialized and updated.")
    except subprocess.CalledProcessError as e:
        warn(f"Failed to initialize submodules: {e}")


def clone_projects(workspace: Path, pod_info: dict):
    """Discover existing repos and optionally add projects as submodules."""
    step("1.4", "Add Git Projects as Submodules")

    ai_dir_name = _get_ai_dir_name(pod_info)
    ai_dir = workspace / ai_dir_name

    # Auto-detect existing Git repos in the workspace (excluding ai/)
    existing = []
    existing_submodules = []
    
    # Check for workspace-root repos (for migration)
    for child in sorted(workspace.iterdir()):
        if child.is_dir() and (child / ".git").is_dir() and child.name != ai_dir_name:
            existing.append(child.name)
    
    # Check for existing submodules (in workspace repo)
    if (workspace / ".gitmodules").exists():
        try:
            result = subprocess.run(
                ["git", "config", "--file", ".gitmodules", "--get-regexp", "path"],
                cwd=workspace,
                capture_output=True,
                text=True,
                check=True
            )
            for line in result.stdout.strip().split("\n"):
                if line:
                    parts = line.split(" ")
                    if len(parts) >= 2:
                        path = parts[1]
                        name = path.split("/")[-1] if "/" in path else path
                        existing_submodules.append(name)
        except subprocess.CalledProcessError:
            pass

    if existing:
        info(f"Found existing Git repos at workspace root ({len(existing)}):")
        for name in existing:
            info(f"  - {name}")
        info("\nThese can be migrated to submodules.")
    
    if existing_submodules:
        info(f"Existing submodules at workspace root ({len(existing_submodules)}):")
        for name in existing_submodules:
            info(f"  - {name}")
        print()

    # Offer migration if workspace-root repos exist
    if existing and ask_yn("Migrate workspace-root repos to submodules at root?", default=True):
        migrate_to_submodules(workspace, pod_info)
        existing_submodules.extend(existing)
        existing = []

    # Ask for GitLab URLs
    info("\nEnter the GitLab URLs to add as submodules.")
    info("The directory name will be derived from the URL.")
    info("One URL per line. Press Enter on empty line when done.")
    if existing_submodules:
        info(f"  Already present (will be skipped): {', '.join(existing_submodules)}")
    
    projects_to_add = []
    while True:
        raw_input = ask("GitLab URL (or empty to finish)", "")
        if not raw_input:
            break
        
        url = raw_input.strip()
        
        if not url:
            warn("URL is required.")
            continue
        
        # Derive directory name from URL
        # From https://gitlab.dell.com/group/project.git -> project
        # From git@gitlab.dell.com:group/project.git -> project
        if url.startswith(("http://", "https://")):
            # HTTPS URL: extract last part of path
            path = urllib.parse.urlparse(url).path
            name = path.rstrip("/").split("/")[-1].replace(".git", "")
        elif url.startswith("git@"):
            # SSH URL: extract last part after colon
            path = url.split(":")[-1]
            name = path.rstrip("/").split("/")[-1].replace(".git", "")
        else:
            warn("Invalid URL format. Use HTTPS or SSH URL.")
            continue
        
        if not name:
            warn("Could not derive directory name from URL.")
            continue
        
        if name in existing_submodules:
            warn(f"Project '{name}' already exists as submodule. Skipping.")
            continue
        
        # Verify access to the repository before accepting it
        info(f"Verifying access to {name}...")
        access_verified = False
        
        # Try to verify access using git ls-remote
        try:
            subprocess.run(
                ["git", "ls-remote", url],
                capture_output=True,
                text=True,
                timeout=10,
                check=True
            )
            info(f"Access verified for {name}")
            access_verified = True
        except subprocess.CalledProcessError:
            dim(f"Could not verify access via original URL: {url}")
        
        # Try alternative URL if original failed
        if not access_verified:
            ssh_url = ""
            if url.startswith(("http://", "https://")):
                ssh_url = _to_ssh_url(url)
            elif url.startswith("git@"):
                ssh_url = _to_https_url(url)
            
            if ssh_url and ssh_url != url:
                try:
                    subprocess.run(
                        ["git", "ls-remote", ssh_url],
                        capture_output=True,
                        text=True,
                        timeout=10,
                        check=True
                    )
                    info(f"Access verified for {name} via alternative URL")
                    access_verified = True
                    # Update the URL to the working one
                    url = ssh_url
                except subprocess.CalledProcessError:
                    dim(f"Could not verify access via alternative URL: {ssh_url}")
        
        if not access_verified:
            error(f"Access denied to {name}. Please check your permissions or provide a different URL.")
            continue
        
        projects_to_add.append((name, url))
    
    if not projects_to_add:
        warn("No projects provided. Skipping submodule addition.")
        return

    failed = []
    for name, url in projects_to_add:
        # Derive SSH URL for fallback if needed
        ssh_url = ""
        if url.startswith(("http://", "https://")):
            ssh_url = _to_ssh_url(url)
        elif url.startswith("git@"):
            ssh_url = _to_https_url(url)
        
        # Regular submodule handling for all projects
        submodule_path = name  # At workspace root
        info(f"\n      Adding {name} as submodule...")

        # Add submodule using default branch (no -b flag)
        try:
            run_cmd(["git", "submodule", "add", url, submodule_path], cwd=workspace)
            success(f"{name} added as submodule.")
            continue
        except subprocess.CalledProcessError:
            pass

        # Try alternative URL if original failed
        if ssh_url and ssh_url != url:
            info(f"Original URL failed. Trying alternative...")
            try:
                run_cmd(["git", "submodule", "add", ssh_url, submodule_path], cwd=workspace)
                success(f"{name} added as submodule with alternative URL.")
                continue
            except subprocess.CalledProcessError:
                pass

        error(f"Failed to add {name} as submodule via both URLs.")
        failed.append(name)

    # Initialize and update all submodules
    if projects_to_add:
        info("\nInitializing and updating submodules...")
        try:
            run_cmd(["git", "submodule", "update", "--init", "--recursive"], cwd=workspace)
            success("Submodules initialized and updated.")
        except subprocess.CalledProcessError as e:
            warn(f"Failed to initialize submodules: {e}")

    if failed:
        warn(f"Failed to add: {', '.join(failed)}")
        info("Add the failed repos manually and re-run setup if needed.")
    else:
        successful = [name for name, _ in projects_to_add if name not in failed]
        success(f"All {len(successful)} project(s) added as submodules successfully.")
        
        # Commit the submodule changes automatically
        try:
            run_cmd(["git", "add", ".gitmodules"], cwd=workspace)
            # Add each submodule directory to git
            for name in successful:
                run_cmd(["git", "add", name], cwd=workspace)
            run_cmd(["git", "commit", "-m", "JIRA#JIRA-0000; Add submodules: " + ", ".join(successful)], cwd=workspace)
            success("Submodule changes committed to workspace repo.")
        except subprocess.CalledProcessError as e:
            warn(f"Failed to commit submodule changes: {e}")


def install_base_skills(workspace: Path):
    """Install skills/rules into the workspace.

    Windsurf and Devin are installed by default.
    Nothing is written to the user's home directory — everything lives under the
    workspace root so that (a) multiple workspaces don't collide and (b) it is obvious
    which skills apply to which project.
    """
    step("1.5", "Install Skills & Workflows (per-workspace)")

    info(f"Installing skills into workspace: {workspace}\n")

    workflows_src  = SETUP_DIR / ".windsurf" / "workflows"
    skills_src     = SETUP_DIR / ".devin" / "skills"
    hooks_src      = SETUP_DIR / ".windsurf" / "hooks"
    hooks_json_src = SETUP_DIR / ".windsurf" / "hooks.json"

    # ── Windsurf -> workspace (default) ──
    if workflows_src.exists():
        copy_tree(workflows_src, workspace / ".windsurf" / "workflows",
                  "Windsurf workflows (.windsurf/workflows/)")
    else:
        warn(f"Windsurf workflows source not found at: {workflows_src}")
    if hooks_src.exists():
        copy_tree(hooks_src, workspace / ".windsurf" / "hooks",
                  "Windsurf hooks (.windsurf/hooks/)")
    if hooks_json_src.exists():
        copy_file(hooks_json_src, workspace / ".windsurf" / "hooks.json",
                  "hooks.json (.windsurf/)")

    # ── Devin -> workspace (default) ──
    if skills_src.exists():
        copy_tree(skills_src, workspace / ".devin" / "skills",
                  "Devin skills (.devin/skills/)")
    else:
        warn(f"Devin skills source not found at: {skills_src}")

    success("Base skills & workflows installed into the workspace.")
    info("")
    info("  Commands now available in Windsurf and Devin:")
    info(f"    {C.BOLD}/sdlc <JIRA-ID>{C.RESET}          — Full end-to-end SDLC")
    info(f"    {C.BOLD}/create-pod-knowledge{C.RESET}     — One-time knowledge base setup")
    info(f"    {C.BOLD}/create-specs <JIRA-ID>{C.RESET}   — Generate feature spec")
    info(f"    {C.BOLD}/create-plan <JIRA-ID>{C.RESET}    — Generate implementation plan")
    info(f"    {C.BOLD}/execute <JIRA-ID>{C.RESET}        — Implement, push, create MRs, fix review comments")
    info(f"    {C.BOLD}/wrap-up <JIRA-ID>{C.RESET}        — Close JIRA, clean up branches")
    info(f"    {C.BOLD}/update-knowledge{C.RESET}         — Batch-integrate features (POD lead)")


# ── Phase 2: Initial POD/Domain Setup ─────────────────────────────────────

def guide_human_docs(workspace: Path, pod_info: dict):
    """Guide the user through creating human-written domain documentation."""
    step("2.1", "Create Human-Written Domain Documentation")

    ai_dir_name = _get_ai_dir_name(pod_info)
    info(f"Place any human-written documentation about your domain in {ai_dir_name}/raw/.")
    info("This is the primary input for AI knowledge generation.\n")

    docs = [
        ("Domain guides",       "Business domain overviews, glossaries, domain model descriptions"),
        ("Architecture docs",   "ADRs, system context diagrams, high-level architecture decisions"),
        ("Requirements docs",   "PRDs, functional requirements, user stories, acceptance criteria"),
        ("API documentation",   "External API references, integration guides, contract specs"),
        ("UI/UX designs",       "Figma exports, wireframes, mockups, screen flows"),
        ("Onboarding docs",     "Team onboarding guides, developer setup guides, coding conventions"),
    ]

    for name, description in docs:
        info(f"  {C.BOLD}{name}{C.RESET}")
        info(f"    {C.DIM}{description}{C.RESET}")

    ai_raw = workspace / ai_dir_name / "raw"
    print()
    if ai_raw.is_dir():
        existing = list(ai_raw.rglob("*"))
        files = [f for f in existing if f.is_file()]
        if files:
            success(f"ai/raw/ found with {len(files)} file(s).")
        else:
            info(f"ai/raw/ exists but is empty: {ai_raw}")
    else:
        info(f"Target directory: {ai_raw}")
        if ask_yn("Create ai/raw/ now?"):
            ai_raw.mkdir(parents=True, exist_ok=True)
            success(f"Created: {ai_raw}")

    print()
    info("Quality in = quality out. The richer your domain docs, the better")
    info("the AI-generated knowledge will be.")
    pause()


def run_pod_knowledge(workspace: Path) -> bool:
    """Run create-pod-knowledge via Devin CLI, or guide the user to run it manually.

    Returns True if the skill was executed successfully, False otherwise.
    """
    step("2.2", "Generate POD Knowledge (AI-powered)")

    info("This step analyses your codebase and human docs (ai/raw/) to generate")
    info("structured AI-readable specs in ai/knowledge/.\n")

    info(f"  Sources: {C.BOLD}(1){C.RESET} Human-written business/functional docs in ai/raw/ (=why)")
    info(f"           {C.BOLD}(2){C.RESET} All git projects in the workspace (=what + how)\n")

    info(f"  Output:  ai/knowledge/ (functional, technical, data model,")
    info(f"           API specs, flow diagrams, and sample data)")
    info(f"           {C.BOLD}AGENTS.md{C.RESET}  (workspace context for AI agents)")
    info(f"           {C.BOLD}LEARNINGS.md{C.RESET} (persistent cross-session memory)\n")

    devin_path = shutil.which("devin")
    if not devin_path:
        warn("Devin CLI not found on PATH.")
        info("")
        info("Install Devin CLI from: https://cli.devin.ai/docs")
        info("Then run the skill manually:")
        info(f"  {C.BOLD}cd {workspace} && devin -- /create-pod-knowledge{C.RESET}")
        info("")
        info(f"Or from Windsurf: {C.BOLD}/create-pod-knowledge{C.RESET}")
        pause()
        return False

    success(f"Devin CLI found: {devin_path}")
    info("")
    info("Launching Devin CLI in non-interactive mode...")
    info("This will run the skill and exit automatically when complete.\n")

    # Start spinner in a separate thread
    stop_spinner = threading.Event()
    spinner_thread = threading.Thread(target=_show_spinner, args=(stop_spinner, "Devin processing"))
    spinner_thread.daemon = True
    spinner_thread.start()

    try:
        result = subprocess.run(["devin", "-p", "--", "/create-pod-knowledge"], cwd=workspace)
        # Stop the spinner
        stop_spinner.set()
        spinner_thread.join()
        
        if result.returncode == 0:
            success("Devin session completed successfully.")
            return True
        else:
            warn(f"Devin exited with code {result.returncode}.")
            info("You can re-run the skill later:")
            info(f"  {C.BOLD}cd {workspace} && devin -- /create-pod-knowledge{C.RESET}")
            return False
    except FileNotFoundError:
        stop_spinner.set()
        spinner_thread.join()
        error("Could not launch Devin CLI.")
        info("Run the skill manually:")
        info(f"  {C.BOLD}cd {workspace} && devin -- /create-pod-knowledge{C.RESET}")
        return False
    except KeyboardInterrupt:
        stop_spinner.set()
        spinner_thread.join()
        info("\nDevin session interrupted.")
        info("You can re-run the skill later:")
        info(f"  {C.BOLD}cd {workspace} && devin -- /create-pod-knowledge{C.RESET}")
        return False


def create_local_config(workspace: Path):
    """Interactively collect base URLs and PATs for JIRA, Confluence, and GitLab.

    Default Dell service URLs are pre-filled. PATs are collected interactively
    and stored in ~/.config/sdd/credentials.json. Services with no credential are skipped.
    """
    step("2.3", "Configure Service URLs and PATs")

    info("This step configures base URLs and PATs for JIRA, Confluence, and GitLab.")
    info("Default URLs are pre-filled — accept with Enter or type a new value.\n")

    # Collect URLs and PATs
    jira_creds = collect_atlassian_credentials("JIRA", "jira")
    confluence_creds = collect_atlassian_credentials("Confluence", "confluence")
    gitlab_creds = collect_gitlab_credentials()

    # Save to config
    config = {}
    if jira_creds:
        jira_url, jira_token = jira_creds
        config["JIRA_BASE_URL"] = jira_url
        if jira_token:
            config["JIRA_PAT"] = jira_token
    if confluence_creds:
        confluence_url, confluence_token = confluence_creds
        config["CONFLUENCE_BASE_URL"] = confluence_url
        if confluence_token:
            config["CONFLUENCE_PAT"] = confluence_token
    if gitlab_creds:
        gitlab_url, gitlab_token = gitlab_creds
        config["gitlab_url"] = gitlab_url
        if gitlab_token:
            config["GIT_PAT"] = gitlab_token

    if config:
        config_file = workspace / "local.config"
        config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(config_file, "w") as f:
            for key, value in config.items():
                f.write(f"{key}={value}\n")
        success(f"Service URLs and PATs saved to {config_file}")

        # Also persist to the secure per-user credentials file
        creds = _load_user_credentials()
        if jira_creds:
            creds.setdefault("jira", {})[config["JIRA_BASE_URL"]] = config.get("JIRA_PAT", "")
        if confluence_creds:
            creds.setdefault("confluence", {})[config["CONFLUENCE_BASE_URL"]] = config.get("CONFLUENCE_PAT", "")
        if gitlab_creds:
            creds.setdefault("gitlab", {})[config["gitlab_url"]] = config.get("GIT_PAT", "")
        _save_user_credentials(creds)
        success(f"Credentials also saved to {USER_CREDENTIALS_FILE}")

        info("MCP servers will be configured in the next step.")
        return config
    else:
        warn("No service URLs were provided. Skipping MCP configuration.")
        return None


# ── Main ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="AI-Native SDLC Harness — Interactive Setup Script",
    )
    parser.add_argument(
        "--workspace", "-w",
        help="Workspace root directory (skips the interactive prompt for this)",
    )
    args = parser.parse_args()

    banner("AI-Native SDLC Harness — Setup")
    info("This script will guide you through setting up a new workspace with the")
    info("AI-native SDLC harness (Devin/Windsurf skills & workflows).\n")
    info(f"Platform: {platform.system()} {platform.release()}")
    info(f"User:     {getpass.getuser()}")
    info(f"Setup:    {SETUP_DIR}")
    print()
    git_found = shutil.which("git")
    devin_found = shutil.which("devin")

    info(f"{C.BOLD}Prerequisites:{C.RESET}")
    info(f"  git       {C.GREEN}{'found' if git_found else f'{C.RED}NOT FOUND — required'}{C.RESET}")

    if not git_found:
        error("git is required. Please install git and try again.")
        sys.exit(1)

    # Check for SSH keys for GitLab access
    ssh_keys_found = _check_ssh_keys()
    info(f"  SSH keys  {C.GREEN}{'found' if ssh_keys_found else f'{C.RED}NOT FOUND — required'}{C.RESET}")

    if not ssh_keys_found:
        error("SSH keys not found in ~/.ssh directory.")
        error("SSH keys are required for GitLab access.")
        info("")
        info("To set up SSH keys for GitLab, follow this guide:")
        info(f"{C.BOLD}https://gitlab.dell.com/help/user/ssh.md{C.RESET}")
        info("")
        sys.exit(1)

    info(f"  devin     {C.GREEN}{'found' if devin_found else f'{C.YELLOW}not found (optional — for Devin CLI)'}{C.RESET}")
    print()

    # ── Determine workspace ──
    workspace = determine_workspace(args.workspace)

    # ── Detect existing state for resume ──
    # Check both "ai" and "ai-workspace" directories for existing state
    ai_dir = workspace / "ai"
    ai_workspace_dir = workspace / "ai-workspace"
    
    # Determine which ai directory exists
    if ai_workspace_dir.exists():
        ai_dir = ai_workspace_dir
    
    has_pod_info = (ai_dir / "pod-info.md").is_file()
    has_workspace_repo = (workspace / ".git").is_dir()
    has_workspace_remote = has_workspace_repo and _get_git_remote_url(workspace) is not None
    has_skills = (workspace / ".windsurf" / "workflows").is_dir() or (workspace / ".devin" / "skills").is_dir()
    has_local_config = (workspace / "local.config").is_file()
    has_knowledge = (ai_dir / "knowledge").is_dir() and any((ai_dir / "knowledge").glob("*.md"))

    is_resume = has_pod_info or has_workspace_repo or has_skills
    if is_resume:
        info(f"{C.BOLD}Existing workspace detected — resuming setup.{C.RESET}")
        info(f"  POD identity     : {C.GREEN + 'found' + C.RESET if has_pod_info else C.YELLOW + 'missing' + C.RESET}")
        info(f"  workspace repo   : {C.GREEN + 'found' + C.RESET if has_workspace_repo else C.YELLOW + 'missing' + C.RESET}")
        info(f"  workspace remote : {C.GREEN + 'configured' + C.RESET if has_workspace_remote else C.YELLOW + 'not pushed' + C.RESET}")
        info(f"  Skills installed : {C.GREEN + 'found (will overwrite)' + C.RESET if has_skills else C.YELLOW + 'missing' + C.RESET}")
        info(f"  local.config     : {C.GREEN + 'found' + C.RESET if has_local_config else C.YELLOW + 'missing' + C.RESET}")
        info(f"  POD knowledge    : {C.GREEN + 'found' + C.RESET if has_knowledge else C.YELLOW + 'not generated' + C.RESET}")
        print()

    # ── Phase 1 ──
    phase_header(1, "INITIAL HARNESS SETUP")

    pod_info = capture_pod_info(workspace)
    
    # ── Checkout Git parent if POD identity confirmed ──
    # This happens after git/ssh verification and POD identity confirmation
    git_parent_checked_out = False
    git_parent_created_locally = False
    ai_workspace_repo_url = None
    
    if pod_info.get("pod_confirmed") and pod_info.get("git_parent"):
        git_parent = pod_info.get("git_parent")
        git_parent_https = pod_info.get("git_parent_https", git_parent) if not git_parent.startswith("git@") else _to_https_url(git_parent)

        step("1.1", "Checkout Git Parent Repository")
        info(f"Checking out Git parent repository...")
        
        # Construct the ai-workspace.git URL
        if git_parent.endswith(".git"):
            base = git_parent[:-4].rstrip("/")
            ai_workspace_repo_url = f"{base}/ai-workspace.git"
        elif git_parent.startswith("git@"):
            ai_workspace_repo_url = _to_ssh_url(git_parent).rstrip("/") + "/ai-workspace.git"
        else:
            ai_workspace_repo_url = f"{git_parent.rstrip('/')}/ai-workspace.git"
        
        ai_workspace_repo_https = _to_https_url(ai_workspace_repo_url) if not ai_workspace_repo_url.startswith("http") else ai_workspace_repo_url
        
        # Check if the ai-workspace repository exists
        pat = _resolve_git_pat(workspace)
        ai_workspace_exists = _check_gitlab_repository_exists(ai_workspace_repo_https, pat=pat)
        
        if ai_workspace_exists:
            # ai-workspace.git exists, checkout to target directory (workspace root)
            info(f"Found ai-workspace repository: {ai_workspace_repo_url}")
            info(f"Checking out ai-workspace to target directory...")
            
            if ai_workspace_repo_url.startswith("git@"):
                ssh_url = ai_workspace_repo_url
                https_url = ai_workspace_repo_https
            else:
                ssh_url = _to_ssh_url(ai_workspace_repo_url) if not ai_workspace_repo_url.startswith("git@") else ai_workspace_repo_url
                https_url = ai_workspace_repo_https

            checkout_success = False
            
            # Try SSH
            if ssh_url and ssh_url.startswith("git@"):
                info(f"Trying checkout via SSH: {ssh_url}")
                try:
                    subprocess.run(
                        ["git", "clone", ssh_url, "."],
                        cwd=workspace,
                        check=True,
                        capture_output=True,
                        text=True
                    )
                    success("ai-workspace repository checked out successfully via SSH")
                    checkout_success = True
                    git_parent_checked_out = True
                except subprocess.CalledProcessError as e:
                    error_output = e.stderr.strip() if e.stderr else str(e)
                    dim(f"SSH checkout failed: {error_output}")
            
            # Try HTTPS if SSH failed
            if not checkout_success and https_url:
                info(f"Trying checkout via HTTPS: {https_url}")
                try:
                    subprocess.run(
                        ["git", "clone", https_url, "."],
                        cwd=workspace,
                        check=True,
                        capture_output=True,
                        text=True
                    )
                    success("ai-workspace repository checked out successfully via HTTPS")
                    checkout_success = True
                    git_parent_checked_out = True
                except subprocess.CalledProcessError as e:
                    error_output = e.stderr.strip() if e.stderr else str(e)
                    dim(f"HTTPS checkout failed: {error_output}")
            
            if not checkout_success:
                error("Failed to checkout ai-workspace repository")
                warn("Continuing without ai-workspace checkout...")
                info("You can manually clone the ai-workspace repository later:")
                info(f"  cd {workspace}")
                info(f"  git clone {ssh_url or https_url} .")
        else:
            # ai-workspace.git doesn't exist, will create it locally and push later
            warn(f"ai-workspace repository does not exist: {ai_workspace_repo_url}")
            info("Will create ai-workspace repository locally and push later.")
            git_parent_created_locally = True
    
    check_ai_repo(workspace, pod_info)
    clone_projects(workspace, pod_info)

    # Generate platform-specific outputs from canonical skills/
    _generate_build_outputs()

    # Always install/overwrite base skills (Windsurf + Devin + hooks)
    install_base_skills(workspace)

    # Mirror AGENTS.md and LEARNINGS.md to workspace root
    _mirror_harness_to_workspace(workspace, pod_info)

    # Ensure workspace root README.md exists
    _ensure_workspace_readme(workspace, pod_info)

    # ── Phase 2 ──
    phase_header(2, "INITIAL POD / DOMAIN SETUP")

    guide_human_docs(workspace, pod_info)

    # Configure service URLs and MCP servers
    config = create_local_config(workspace)
    if config:
        configure_mcps(workspace, config)

    # ── Commit generated files to git repository ──
    if (workspace / ".git").is_dir():
        info("Committing generated files to git repository...")
        try:
            run_cmd(["git", "add", "."], cwd=workspace)
            run_cmd(["git", "commit", "-m", "JIRA#JIRA-0000; Initial setup — skills, workflows, and configuration"], cwd=workspace)
            success("Generated files committed to git repository.")
        except subprocess.CalledProcessError as e:
            # If nothing to commit, that's okay
            if "nothing to commit" in (e.stderr or "").lower():
                dim("No changes to commit.")
            else:
                warn(f"Failed to commit generated files: {e.stderr.strip() if e.stderr else str(e)}")

    # ── Done ──
    banner("Setup Complete!")
    ai_dir_name = _get_ai_dir_name(pod_info)
    info("Your workspace is ready. Here's what to do next:\n")
    info(f"  1. Place human domain docs in {ai_dir_name}/raw/ if not done yet.\n")
    info(f"  2. Run {C.BOLD}/create-pod-knowledge{C.RESET} to derive AI-readable specs.")
    info(f"     This also generates {C.BOLD}AGENTS.md{C.RESET} (workspace context) and")
    info(f"     {C.BOLD}LEARNINGS.md{C.RESET} (persistent cross-session memory).\n")
    info(f"  3. Start the SDLC: {C.BOLD}/sdlc <JIRA-ID>{C.RESET}\n")

    info(f"  {C.DIM}For help, see: README.md in the ai/ folder.{C.RESET}")
    print()
    info(f"  {C.DIM}You can safely remove this setup repository ({SETUP_DIR})")
    info(f"  from your laptop unless you plan to create more POD workspaces.{C.RESET}")

    # ── Push ai-workspace repo if it was created locally (not checked out) and not a dummy POD ──
    if git_parent_created_locally and pod_info.get("pod_confirmed") and pod_info.get("git_parent"):
        is_dummy = _is_dummy_pod(pod_info)
        if not is_dummy:
            git_parent = pod_info.get("git_parent")
            git_parent_https = pod_info.get("git_parent_https", git_parent) if not git_parent.startswith("git@") else _to_https_url(git_parent)
            
            # Construct the ai-workspace.git URL
            if git_parent.endswith(".git"):
                base = git_parent[:-4].rstrip("/")
                ai_workspace_repo_url = f"{base}/ai-workspace.git"
            elif git_parent.startswith("git@"):
                ai_workspace_repo_url = _to_ssh_url(git_parent).rstrip("/") + "/ai-workspace.git"
            else:
                ai_workspace_repo_url = f"{git_parent.rstrip('/')}/ai-workspace.git"
            
            ai_workspace_repo_https = _to_https_url(ai_workspace_repo_url) if not ai_workspace_repo_url.startswith("http") else ai_workspace_repo_url
            
            # Check if the workspace is a git repo
            if (workspace / ".git").is_dir():
                step("1.6", "Push ai-workspace Repository")
                info(f"Pushing ai-workspace repository to remote: {ai_workspace_repo_url}")
                
                # Add remote if not configured
                try:
                    subprocess.run(
                        ["git", "remote", "add", "origin", ai_workspace_repo_url],
                        cwd=workspace,
                        check=True,
                        capture_output=True,
                        text=True
                    )
                except subprocess.CalledProcessError:
                    # Remote might already exist, try to set-url
                    try:
                        subprocess.run(
                            ["git", "remote", "set-url", "origin", ai_workspace_repo_url],
                            cwd=workspace,
                            check=True,
                            capture_output=True,
                            text=True
                        )
                    except subprocess.CalledProcessError:
                        pass  # Continue anyway
                
                # Try SSH first, then HTTPS
                ssh_url = _to_ssh_url(ai_workspace_repo_url) if not ai_workspace_repo_url.startswith("git@") else ai_workspace_repo_url
                https_url = ai_workspace_repo_https
                
                push_success = False
                
                # Try SSH
                if ssh_url and ssh_url.startswith("git@"):
                    info(f"Trying push via SSH...")
                    try:
                        subprocess.run(
                            ["git", "push", "-u", "origin", "main"],
                            cwd=workspace,
                            check=True,
                            capture_output=True,
                            text=True
                        )
                        success(f"ai-workspace repository pushed successfully via SSH")
                        push_success = True
                    except subprocess.CalledProcessError as e:
                        error_output = e.stderr.strip() if e.stderr else str(e)
                        dim(f"SSH push failed: {error_output}")
                
                # Try HTTPS if SSH failed
                if not push_success and https_url:
                    info(f"Trying push via HTTPS...")
                    try:
                        subprocess.run(
                            ["git", "push", "-u", "origin", "main"],
                            cwd=workspace,
                            check=True,
                            capture_output=True,
                            text=True
                        )
                        success(f"ai-workspace repository pushed successfully via HTTPS")
                        push_success = True
                    except subprocess.CalledProcessError as e:
                        error_output = e.stderr.strip() if e.stderr else str(e)
                        dim(f"HTTPS push failed: {error_output}")
                
                if not push_success:
                    error("Failed to push ai-workspace repository")
                    warn("You can push manually later:")
                    info(f"  cd {workspace}")
                    info(f"  git remote add origin {ai_workspace_repo_url}")
                    info(f"  git push -u origin main")
            else:
                warn(f"Workspace is not a git repo: {workspace}")
                info("Skipping ai-workspace push.")

    # Change to target workspace directory before asking what to launch
    os.chdir(workspace)
    info(f"Changed to workspace directory: {workspace}")
    print()

    # Ask what to launch
    _ask_to_launch_ai_tool(workspace)


def _ask_to_launch_ai_tool(workspace: Path):
    """Ask the user which AI tool to launch and launch it."""
    print()
    info("Which AI tool would you like to launch?")
    info(f"  {C.BOLD}1{C.RESET}. Windsurf")
    info(f"  {C.BOLD}2{C.RESET}. Quit (exit setup)")
    print()

    choice = ask("Choice [1/2]", "1").strip()

    if choice == "1":
        _launch_windsurf(workspace)
    elif choice == "2":
        info("Exiting setup. You are now in the workspace directory.")
        info("To launch Devin manually, run: devin")
        return
    else:
        warn("Invalid choice. Exiting setup.")
        return


def _launch_windsurf(workspace: Path):
    """Launch Windsurf with the workspace."""
    info(f"Launching Windsurf with workspace: {workspace}")

    # Try to launch Windsurf using the windsurf command
    windsurf_path = shutil.which("windsurf")
    if windsurf_path:
        try:
            # Pass workspace path as argument to Windsurf
            subprocess.Popen([windsurf_path, str(workspace)])
            success("Windsurf launched successfully!")
            info("You can now use the AI skills in Windsurf.")
        except Exception as e:
            error(f"Failed to launch Windsurf: {e}")
            info("Please launch Windsurf manually and open the workspace:")
            info(f"  {workspace}")
    else:
        warn("Windsurf command not found on PATH.")
        info("Please launch Windsurf manually and open the workspace:")
        info(f"  {workspace}")


def _generate_build_outputs():
    """Run build.py to generate platform-specific outputs from canonical skills/.

    This produces .devin/skills/, .windsurf/workflows/ outputs
    on-the-fly from the single source of truth in skills/.
    """
    build_script = SETUP_DIR / "build.py"
    skills_dir = SETUP_DIR / "skills"

    if not build_script.exists():
        warn("build.py not found — skipping output generation.")
        info("Pre-generated outputs in .devin/, .windsurf/ will be used if present.")
        return

    if not skills_dir.exists() or not any(skills_dir.glob("*.md")):
        warn("skills/ directory empty or missing — skipping output generation.")
        info("Pre-generated outputs in .devin/, .windsurf/ will be used if present.")
        return

    info("Generating platform-specific outputs from canonical skills/...")
    try:
        result = subprocess.run(
            [sys.executable, "-u", "-X", "utf8", str(build_script), "build"],
            cwd=SETUP_DIR,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if result.returncode == 0:
            success("Build outputs generated (Devin, Windsurf).")
        else:
            warn(f"Build had issues: {result.stderr.strip()[:200]}")
            info("Continuing with whatever outputs are available.")
    except Exception as e:
        warn(f"Could not run build.py: {e}")
        info("Continuing with whatever outputs are available.")


if __name__ == "__main__":
    main()
