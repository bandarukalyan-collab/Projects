# SDD Install Kit

Spec-Driven Development installer for Dell development teams. Sets up the complete AI-native SDLC pipeline — shared AI workspace, Dell SDLC skills, MCP integrations, and SpecKit workflows.

## Prerequisites

| Tool | Install |
|------|---------|
| [git](https://git-scm.com/) | https://git-scm.com/downloads |
| [uv](https://docs.astral.sh/uv/) — runs the installer | https://docs.astral.sh/uv/ |
| [Windsurf](https://windsurf.com/) — IDE where slash commands run | https://windsurf.com |
| [Claude Code](https://claude.com/claude-code) *(optional)* | https://claude.com/claude-code |
| [Devin CLI](https://cli.devin.ai/docs) *(optional)* | https://cli.devin.ai/docs |

---

## Install

```powershell
uv tool install sdd-install-kit --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git --reinstall
sdd-install
```

To uninstall:

```powershell
uv tool uninstall sdd-install-kit
```

MCP configs, security hooks, credentials, and Snyk directives are per-user and are not removed.

---

## Quick Start

After `sdd-install` completes:

1. Place domain docs (ADRs, PRDs, API references) in `ai/raw/`
2. Run `/create-pod-knowledge` in Windsurf — generates AI-readable specs in `ai/knowledge/`
3. Start delivering: `/sdlc <JIRA-ID>`

---

## Dell SDLC Harness

Sets up a shared AI workspace, clones Git projects, installs Dell SDLC skills to Windsurf, Devin, and Claude Code, and optionally installs SpecKit + Dell enterprise extension.

### Workspace Structure

```
workspace/                    ← Your workspace root (you choose this path)
├── ai/
│   ├── raw/                  ← Human-written domain docs (INPUT)
│   └── knowledge/            ← AI-generated specs (OUTPUT of /create-pod-knowledge)
├── specs/                    ← Per-feature specs, plans, and summaries
├── <your-project-1>/         ← Cloned git repos
├── <your-project-2>/
├── .windsurf/
│   ├── workflows/            ← Dell SDLC slash-command workflows
│   └── hooks/                ← Safety and lifecycle hooks
├── .specify/                 ← SpecKit framework (if SpecKit add-on selected)
│   ├── constitution.md
│   ├── templates/
│   ├── extensions/dell/      ← Dell enterprise extension
│   └── extensions.yml
├── AGENTS.md                 ← AI agent context file (auto-generated)
└── LEARNINGS.md              ← Persistent cross-session AI memory (auto-generated)
```

**Skills are installed into the workspace** (per-project, not machine-wide):

```
<workspace>/.windsurf/workflows/   ← Dell SDLC workflows for Windsurf
<workspace>/.windsurf/hooks/       ← Safety hooks
<workspace>/.devin/skills/         ← Dell SDLC skills for Devin CLI
<workspace>/.claude/commands/      ← Dell SDLC commands for Claude Code
```

### Skills

Available in Windsurf, Devin CLI, and Claude Code:

| Skill | What it does |
|-------|-------------|
| `/sdlc` | Full end-to-end delivery from JIRA to merged code |
| `/create-pod-knowledge` | One-time AI knowledge base generation |
| `/create-specs` | Generate feature spec from a JIRA issue |
| `/create-plan` | Generate implementation plan |
| `/execute` | Implement, push, create MRs, fix review comments |
| `/wrap-up` | Close JIRA, clean up branches |
| `/update-knowledge` | Batch-integrate features (POD lead) |

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `sdd-install: command not found` | Run `uv tool list`; ensure uv tools bin is in PATH |
| Install picks up old version | Add `--reinstall` (from GitLab) or `--no-cache --force` (local dev) to force a fresh fetch |
| Skills not working | Re-run `sdd-install` to overwrite workflow files |
| Snyk binary download fails | Download manually from `https://downloads.snyk.io/cli/stable/` and place on PATH as `snyk` |
| Snyk MCP calls fail / unauthorized | Run `snyk auth` to refresh the SSO token |
| GitLab MCP not working | Verify the GitLab MCP URL in `oauth-mcp-servers.json` is reachable and the PAT in `~/.config/sdd/credentials.json` has `api` scope |

---

## MCP Integrations

MCP server entries are written to per-tool config files during setup:

| Service | MCP server | Auth |
|---------|-----------|------|
| Jira, Confluence | Dell-hosted MCP server (HTTP) — URL from `oauth-mcp-servers.json` | PAT (stored in `~/.config/sdd/credentials.json`); agents handle OAuth at runtime |
| GitLab | Dell-hosted MCP server (HTTP) — URL from `oauth-mcp-servers.json` | PAT (stored in `~/.config/sdd/credentials.json`) |
| Snyk | Snyk standalone binary — `snyk mcp -t stdio` ([docs](https://docs.snyk.io/integrations/snyk-studio-agentic-integrations)) | `snyk auth` — browser opens once; token cached by CLI |

PATs are stored in `~/.config/sdd/credentials.json`. MCP server configurations are written to `~/.claude.json`, `~/.codeium/mcp_config.json`, `~/.config/devin/config.json`, and `~/.vscode/mcp.json`. Never commit these files.

**Before running the installer:**
- Create a GitLab PAT with `api` scope at https://gitlab.dell.com/-/user_settings/personal_access_tokens
- After install, run `snyk auth` once from any terminal to authenticate via Dell SSO

### Snyk Directives

The installer writes Dell's baseline [Snyk security directives](ai/snyk-directives.md) into each developer's global AI rules (`~/.codeium/windsurf/global_rules.md`, `~/.claude/CLAUDE.md`), covering SAST scans, dependency health checks, and MR-merge blockers for high/critical findings. To update directives org-wide, edit `ai/snyk-directives.md` and open an MR — each developer's next `sdd-install` picks up the changes. Tenant-level rules are managed separately in Snyk Studio → Directives.

Docs: [Snyk Studio Directives](https://docs.snyk.io/integrations/snyk-studio-agentic-integrations/directives) · [Distribution at Scale](https://docs.snyk.io/integrations/snyk-studio-agentic-integrations/distribution-at-scale)

---

[Source](https://gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit)
