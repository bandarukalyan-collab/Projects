# Changelog

All notable changes to **sdd-install-kit** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **Dummy-pod JIRA project** — `_DUMMY_POD_INFO` now includes `jira_project_key: "PODT"` and `jira_project_name: "POD Training"`; `_write_pod_info` writes the JIRA project block to `pod-info.md` for dummy-pod setups, matching the format produced for real PODs
- **Training Tuesday webinar assets** — `dell-sdd/docs/webinar/POD-Starter-Kit-Webinar.pptx` and `dell-sdd/docs/DEMO-GUIDE.md` added as presentation and speaker guide for the POD Starter Kit onboarding session
- **CLAUDE.md** — project context file for cross-machine Claude Code continuity

### Fixed
- **POD Group / Guild / Domain not found for higher IDs** — `_fetch_podgroup_by_id`, `_fetch_guild_by_id`, `_fetch_domain_by_id`, and `_fetch_all_domains` now paginate through all pages using `?pageNumber=N&pageSize=100` and the `pagination.total_pages` metadata; fixes lookups for entities like POD Group ID 40 that fell outside the default first page of results
- **Dummy-pod CMDB ID corrected** — `_DUMMY_POD_INFO` CMDB ID changed from `9999999` to `999999` (6 digits, matching the standard Dell CMDB ID length)
- **Demo guide workspace paths** — updated `C:\temp\` references to `~\` (home directory) and replaced `SCLP-4342` example ticket with `EXAMPLE-101` to align with the generic Greeting Service example workspace

---

## [2.0.0] - 2026-05-08

### Added
- Guild hierarchy support (`guild/pod_group/pod` patterns) in addition to existing domain hierarchies
- Production API integration with separate endpoints for PODs, POD Groups, Guilds, and Domains
- Multi-API call orchestration for complete hierarchy resolution with fallback mechanisms
- Cross-platform Unicode character constants with ASCII fallbacks for legacy systems
- Smart push defaults: dummy PODs default to "No", real PODs default to "Yes" for Git push prompts
- Comprehensive test workspace patterns in `.gitignore` to prevent accidental commits
- Windows UTF-8 encoding enforcement to resolve Unicode compatibility issues
- Primary CMDB ID-based Git URL construction pattern
- POD identity now resolved from IDP Onboarding API (`GET …/api/SDD/pods?key=<slug>`) — user enters a pod slug instead of manually typing namespace and Git parent URL
- `_fetch_pod_from_api(pod_key)` — new helper that calls the IDP Onboarding API and returns the first matching pod dict, or `None` on failure
- `dummy-pod` default slug for demo/onboarding setups: pre-populated config with no API call, available by pressing Enter at the pod slug prompt
- Default Dell service base URLs pre-filled: `https://jira.dell.com`, `https://confluence.dell.com`, `https://gitlab.dell.com` — users can override during setup
- OAuth/DCR now attempted automatically (rather than opt-in) when a service URL matches an entry in `oauth-mcp-servers.json`; falls back to manual PAT on failure
- `ai/app-knowledge/` knowledge base: 8 AI-generated spec files (functional, technical, API, data model, integration, security, deployment, NFR)
- `AGENTS.md` workspace context file and `LEARNINGS.md` secondary memory template added to repo root
- Hybrid OAuth/PAT authentication mode for MCP server configuration
- OAuth-enabled MCP server registry (`oauth-mcp-servers.json`) for endpoints with MCP servers that handle OAuth internally
- Credential reuse mechanism for existing credentials during setup
- CLI argument `--workspace` / `-w` to skip interactive workspace prompt
- Resume detection for setup.py to handle existing workspace state
- Local configuration file (`local.config`) for service URLs and PATs
- Full OAuth 2.0 PKCE suite built into `setup.py`
- PAT verification helpers: `_verify_atlassian_pat()`, `_verify_gitlab_pat()`
- `_sdd_config_dir()` — platform-aware config directory (`%APPDATA%/sdd` on Windows, `~/.config/sdd` on Unix)
- `_make_ssl_context()` — Dell CA cert chain with priority fallback: bundled `dell-ca.crt` → `REQUESTS_CA_BUNDLE` → `SSL_CERT_FILE` → `CURL_CA_BUNDLE` → system default
- Snyk security directives now installed automatically at end of `configure_mcps()` via `_install_directives()` / `_upsert_sentinel_block()`
- **Confirmation prompt** when existing `ai/pod-info.md` is found — user is now asked "Use this POD identity? [Y/n]" before proceeding; answering No drops into the interactive slug prompt
- **`PodApiUnavailableError`** — new exception class distinguishing network/SSL failures from genuine pod-not-found results; when raised, `capture_pod_info` immediately offers dummy-pod with default Yes instead of re-prompting for another slug
- **Streamlined pod-info.md format** — essential POD information only (Domain, POD Group, POD, GitLab project, JIRA Project, POD Members, POD Lead, Guild/Domain hierarchy) instead of comprehensive API data
- **JIRA Project Link** — complete JIRA project URL captured in pod-info.md (`https://jira.dell.com/projects/{PROJECT_KEY}`)
- **Default workspace location** — changed from temp directory to persistent home directory (`~/sdd-workspace`) to prevent data loss from OS cleanup of temp paths

### Changed
- **BREAKING**: API endpoints updated from dev to production URLs (`https://idp-onboarding-api.devops360-p3.kob.dell.com`)
- **BREAKING**: Git repository URLs now use Primary CMDB ID pattern: `https://gitlab.dell.com/{CMDB_ID}/{POD_SLUG}`
- **BREAKING**: Dummy POD CMDB ID changed from `1000000` to `999999`
- **BREAKING**: Missing POD Groups now throw `ValueError` exceptions instead of creating fallback namespaces
- **BREAKING**: `pod-info.md` format changed from comprehensive API data (80+ fields) to streamlined essential information (Domain, POD Group, POD, GitLab project, JIRA Project, POD Members, POD Lead, Guild/Domain hierarchy)
- Enhanced push prompts with context-aware messaging for dummy PODs: "(repository may not exist)"
- Improved error handling with actionable guidance for data integrity issues
- Unicode character rendering now works consistently across Windows and Linux platforms
- **Module consolidation**: `mcp_config.py`, `oauth.py`, `ui.py`, and `utils.py` merged into `setup.py`; the four separate files are deleted — `setup.py` is now the single self-contained script
- `capture_pod_info()` replaced manual namespace + Git parent URL prompts with a single pod slug prompt backed by the IDP Onboarding API
- MCP server authentication approach from OAuth-only to hybrid OAuth/PAT mode
- MCP server configuration now only updates entries for services configured by the user
- Credential collection functions now accept `existing_creds` parameter for credential reuse
- `_fetch_pod_from_api` refactored into `_search_pods_by_key` (raw HTTP call, raises on error) + `_fetch_pod_from_api` (variant loop, exact-match filter, single error log)
- `info()` now accepts an optional `text` argument (`text: str = ""`) so it can be called with no arguments as a blank-line spacer
- Default workspace location changed from script-relative path to platform-specific temp directory

### Fixed
- **Hyphenated pod slugs not found** (e.g. `isg-software-updates`): `_fetch_pod_from_api` now tries three search variants in order — original slug, hyphens→spaces, hyphens→underscores — always verifying by exact `podSlug` match so a broad display-name search never returns the wrong pod
- **Repeated error messages when API is unreachable**: previously the same network/SSL warning was printed once per search variant (up to 3×); now logged exactly once and `PodApiUnavailableError` is raised immediately
- **POD slug lookup returns wrong pod**: `_fetch_pod_from_api` now filters for an exact `podSlug` match from the `?key=` fuzzy search results instead of blindly returning `pods[0]`
- **POD Group / Guild / Domain not found despite existing**: `_fetch_podgroup_by_id`, `_fetch_guild_by_id`, and `_fetch_domain_by_id` now normalise all ID comparisons via `str()` on both sides, preventing silent lookup failures when one API returns IDs as JSON strings and another as JSON numbers
- **Accidental pod-info.md overwrite**: when user declines an existing `pod-info.md` and enters a different pod slug, a mismatch warning is shown with explicit confirmation required (`default=False`); confirmed switches delete the stale file so `_write_pod_info` writes the correct identity
- **`info()` TypeError at runtime**: `def info(text: str)` crashed when called with no arguments as a blank-line spacer; fixed to `def info(text: str = "")`
- Unicode encoding errors on Windows systems with cp1252 encoding — now forces UTF-8 output
- Cross-platform compatibility issues between Windows and Linux developers
- Silent fallback behaviors for missing POD Groups — now provides clear error messages
- Accidental test workspace commits — comprehensive `.gitignore` patterns added
- Git URL construction to align with Dell's actual GitLab repository structure
- **Credential file TOCTOU race condition**: replaced `path.write_text()` + `os.chmod()` with atomic `os.open(O_WRONLY|O_CREAT|O_TRUNC, 0o600)`
- OAuth DCR documentation inaccuracies in README.md
- Merge conflicts between `oauth-clients-pats` branch and `origin/main` resolved

---

## [1.0.0] - 2026-04-29

First stable release of the **Spec-Driven Development (SDD) harness** for Dell development teams.

### Added
- Full SDD harness with 7 canonical skills: `sdlc`, `create-pod-knowledge`, `create-specs`, `create-plan`, `execute`, `wrap-up`, `update-knowledge`
- Single-source build system (`build.py`) — compiles canonical `skills/*.md` to Windsurf, Devin, Cursor, and Claude Code formats
- Interactive setup wizard (`setup.py`) — POD onboarding, `ai/` repo creation, PAT capture, skill installation
- `sdd-install` CLI entry point via `uv tool install`
- OAuth 2.0 PKCE flows for Atlassian and GitLab authentication (`oauth.py`)
- MCP server configuration for Atlassian, GitLab, and Snyk (`mcp_config.py`)
- Windsurf security hooks — polyglot installer (`install_hooks.bat`) deploying AI prompt/command/MCP gateways via Prisma AIRS
- Dell corporate CA certificate bundle for internal Atlassian OAuth
- Snyk agentic security directives (`snyk-directives.md`) — 4 guardrails covering SAST, SCA, IaC, and pre-merge checks
- `CONSTITUTION.md` — 10 engineering principles and 13 quality gates
- Example workspace template (`example-workspace/`)
- Auto-detection of installed AI tools (Windsurf, Devin, Cursor, Claude Code)
- `--uninstall` flag for clean harness removal
- Support for Dell corporate network — SSH Git URLs and Dell Artifactory routing
- POD identity model (`ai/pod-info.md`) for multi-POD support
- Knowledge base structure: `ai/raw/` for source docs, `ai/app-knowledge/` for generated specs
- Spec delivery summary published to Confluence via `wrap-up` skill

### Changed
- Migrated skill auth from PAT-based to MCP server-based (GitLab MCP, Atlassian MCP)
- Replaced glab CLI dependency with GitLab MCP server
- Replaced Node.js/npm dependency with `uvx`-based GitLab MCP and standalone Snyk binary
- MCP configuration scoped globally (not per-workspace)
- Removed Cursor support to reduce maintenance surface
- Removed SpecKit-only install path — Full Harness is the only supported option
- Uninstall simplified — per-user configs are preserved, only harness artifacts removed

### Fixed
- PowerShell 5.1 compatibility — replaced PS7-only `??` operator with explicit fallback
- Windows Unicode errors in subprocess calls (forced UTF-8 encoding)
- `utils.py` NameError and `--uninstall` implementation
- Sentinel marker mismatch in Snyk directives install
- Fragile environment-variable path fallbacks replaced with `Path.home()` in `mcp_config.py`
- Hooks updated to allow requests when API security gateway is unavailable

---

[Unreleased]: https://gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit/-/compare/v2.0.0...HEAD
[2.0.0]: https://gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit/-/compare/v1.0.0...v2.0.0
[1.0.0]: https://gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit/-/tags/v1.0.0
