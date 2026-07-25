# AI-Native SDLC Skills

An AI-powered Software Development Lifecycle harness that lets AI agents autonomously deliver features — from JIRA issue to merged code — with minimal human intervention.

Share this folder with any new team member to get them up and running.

> **Note:** You do not need to add this repo to your POD workspace. This quick-start is only meant to bootstrap your laptop with the `sdd-install` CLI tool and create a new POD workspace (`ai-workspace` Git repository). Once that is done, you no longer need this `pod-starter-kit` project.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [How It Works](#how-it-works)
3. [Skills Inventory](#skills-inventory)
4. [Individual Skill Descriptions](#individual-skill-descriptions)
5. [Prerequisites](#prerequisites)
6. [Configuration Reference](#configuration-reference)
7. [Folder Contents](#folder-contents)
8. [Installation Paths](#installation-paths)
9. [What `setup.py` Does](#what-setuppy-does)
10. [Maintaining This Folder](#maintaining-this-folder)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Python 3.10+** and **Git** on PATH
- Access to your Git remote (SSH keys or HTTPS)
- A **GitLab Sub Group** created for your POD (e.g. `https://gitlab.dell.com/{CMDB-ID}/{POD-SLUG}`). The setup script will create the `ai-workspace` project under this sub group.
- *(Optional)* **Devin CLI** — for running Dell skills via `devin` command ([install](https://cli.devin.ai/docs))
- *(Optional)* **JIRA/Confluence/GitLab PATs** — Collected interactively during setup; used by skills that call these services directly

---

## Quick Start

### 1. Run the setup script

```bash
python setup.py
```

**Optional CLI argument:**

```bash
python setup.py --workspace /path/to/workspace
# or
python setup.py -w /path/to/workspace
```

The `--workspace` flag skips the interactive workspace prompt and uses the specified path directly.

This single command bootstraps everything:
- **First**, captures POD identity — prompts for your **POD slug** and retrieves POD details from the [AI Native SDLC Taxonomy Tool](https://ai-native.devops360-p3.kob.dell.com/SDD/Pods). This provides the **CMDB ID**, **POD Namespace**, **Git parent URL** (`https://gitlab.dell.com/{CMDB-ID}/{POD-SLUG}`), and other details written to `ai/pod-info.md` and used to derive the repository location (`{git_parent}/ai-workspace.git`).
- Creates and initializes the ai-workspace Git repository
- Scaffolds the `ai/` folder structure (part of ai-workspace repo):
  - `ai/pod-info.md` — POD identity as plain key-value pairs (POD Namespace, Domain, POD Group, POD Name, Git Parent URL, Captured At, Captured By)
  - `ai/harness/CONSTITUTION.md` — architectural governance & principles *(maintained by the POD lead)*
  - `ai/harness/AGENTS.md` — workspace context master *(maintained by the POD lead)*; automatically mirrored to `<workspace>/AGENTS.md`
  - `ai/harness/LEARNINGS.md` — starter template for a developer's personal secondary memory; mirrored to `<workspace>/LEARNINGS.md`. **Not a team-shared file** — each developer maintains their own copy in Git (or elsewhere) however they like.
  - `ai/harness/skills/` — user-editable, version-controlled copies of the AI skills
  - `ai/raw/`, `ai/knowledge/`, `ai/specs/` directories
- Adds source project repositories as Git submodules at workspace root level (same level as `ai/` folder)
- Generates platform-specific outputs on-the-fly via `build.py`
- Installs skills/workflows/rules **into the workspace root** (nothing written to your home directory):
  - **Windsurf** — workflows + safety hooks → `.windsurf/` *(default: yes)*
  - **Devin** — skills → `.devin/skills/` *(default: yes)*
  - **Claude Code** — commands → `.claude/commands/` *(default: no — opt-in prompt)*
- Collects PATs for JIRA, Confluence, and GitLab; stores them in `~/.config/sdd/credentials.json` and `local.config`
- Configures MCP servers for Claude Code, Windsurf, Devin, and VS Code using the service URLs provided; agents handle OAuth against those MCP endpoints at runtime
- Commits and pushes ai-workspace repository to GitLab at `{git_parent}/ai-workspace.git`

### 2. Next steps (after setup completes)

1. **Place human domain docs in `ai/raw/`** — domain guides, architecture docs, requirements, API refs, UI/UX designs, onboarding material. These are the raw inputs the AI will learn from.

2. **Run `/create-pod-knowledge`** — analyses your codebase + raw docs to generate:
   - `ai/knowledge/POD.md` — executive POD summary (10–15 min read) — **mandatory, always generated**
   - `ai/knowledge/` — 8 AI-readable specs (functional, technical, data model, API, integration, security, deployment, NFR)
   - `ai/knowledge/CHANGELOG.md` — audit trail of all knowledge-base changes
   - `AGENTS.md` at the workspace root — POD-wide context file (regenerated on every run; master lives at `ai/harness/AGENTS.md`)
   - `LEARNINGS.md` at the workspace root — developer-local template (only seeded if missing; each developer curates their own)

   This is a one-time step per project. **Note:** If Devin CLI was available during setup, this step may have already been completed.

3. **Start delivering features:**

```
/sdlc <JIRA-ID>
```

---

## New Developer Setup

For new team members joining an existing POD workspace (after the POD Lead has run `setup.py` and created the `ai-workspace` repository):

### Option 1: Clone with Submodules (Recommended)

```bash
# Clone the ai-workspace repository recursively to include all submodules
git clone --recurse-submodules <ai-workspace-repo-url> ai-workspace
cd ai-workspace
```

### Option 2: Clone and Initialize Separately

```bash
# Clone the ai-workspace repository first
git clone <ai-workspace-repo-url> ai-workspace
cd ai-workspace

# Initialize and update all submodules
git submodule update --init --recursive
```

### After Cloning

1. Create your `local.config` file with your personal access tokens:
   ```bash
   cp local.config.template local.config
   # Edit local.config with your PATs
   ```

2. Ensure all submodules are on the correct branch:
   ```bash
   git submodule foreach 'git checkout develop'
   git submodule foreach 'git pull origin develop'
   ```

### Submodule Troubleshooting

**Detached HEAD State:**
If you see "detected detached HEAD" in a submodule:
```bash
cd <project-name>
git checkout develop
```

**Sync Issues:**
If submodules are out of sync:
```bash
git submodule update --remote --merge
```

**Adding New Submodules (POD Lead only):**
```bash
git submodule add -b develop <repo-url> <project-name>
git commit -m "JIRA#JIRA-0000; Add submodule: <project-name>"
git push
```

---

## Resume Detection

If you re-run `setup.py` in an existing workspace, the script automatically detects the current state and resumes setup from where it left off.

**Detected state includes:**
- POD identity (`ai/pod-info.md`)
- ai/ repository existence and Git remote configuration
- Skills installation status (Windsurf workflows, Devin skills)
- local.config file (service URLs and PATs)
- POD knowledge generation (`ai/knowledge/`)

**Resume behavior:**
- POD identity: Reuses existing `ai/pod-info.md` if valid and complete
- ai/ repo: Skips create/clone prompts if repo exists; offers to configure remote if missing
- Skills: Overwrites existing skills with latest versions (idempotent)
- Git projects: Auto-detects existing repos and skips them during cloning
- MCP configuration: Updates MCP server entries for configured services only

**Example resume output:**
```
Existing workspace detected — resuming setup.
  POD identity     : found
  ai/ repo         : found
  ai/ remote       : configured
  Skills installed : found (will overwrite)
  local.config     : found
  POD knowledge    : not generated
```

This makes the setup script safe to re-run at any time — it will only perform missing steps and update components as needed.

---

## How It Works

There are three stages to using the harness: **one-time setup**, **feature delivery** (repeatable), and **periodic maintenance**.

### Stage 1 — One-Time Knowledge Base Setup

Before delivering features, the AI needs to understand your codebase. This is a one-time setup per project.

**Step 1: Write human domain docs** → `ai/raw/`

Place any human-written documentation in `ai/raw/`:

| Doc Type | Examples |
|----------|----------|
| Domain guides | Business domain overviews, glossaries |
| Architecture docs | ADRs, system context diagrams |
| Requirements | PRDs, user stories, acceptance criteria |
| API documentation | External API refs, integration guides |
| UI/UX designs | Figma exports, wireframes, mockups |
| Onboarding docs | Developer setup guides, coding conventions |

**Step 2: Run `/create-pod-knowledge`** → `ai/knowledge/`

This skill derives AI-readable specs by analysing three sources:

```
┌──────────────────────────────────────────────────────────────┐
│                          INPUTS                              │
│                                                              │
│  (1) ai/raw/                 Human-written docs & artifacts  │
│      ├── domain-guide.md         Domain overviews, glossaries│
│      ├── architecture.md         ADRs, system context        │
│      ├── requirements.md         PRDs, user stories          │
│      ├── figma-exports/          Wireframes, mockups         │
│      └── ...                                                 │
│                                                              │
│  (2) All git projects            Codebase analysis           │
│      Source code, config, tests, build files, dependencies   │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼  /create-pod-knowledge
                            │
┌──────────────────────────────────────────────────────────────┐
│                          OUTPUT                              │
│                                                              │
│  ai/knowledge/               AI-generated specs              │
│      ├── POD.md                  Executive POD summary       │
│      ├── functional-spec.md      Features, use cases, rules  │
│      ├── technical-spec.md       Architecture, modules       │
│      ├── data-model-spec.md      Collections, fields, indexes│
│      ├── api-spec.md             Every REST endpoint         │
│      ├── integration-spec.md     Internal + External interfaces│
│      ├── security-spec.md        Auth, authz, data protection│
│      ├── deployment-spec.md      Build, CI/CD, infra         │
│      ├── nfr-spec.md             Performance, reliability    │
│      ├── flows/                  Mermaid flow diagrams       │
│      ├── data/                   Sample JSON payloads        │
│      └── CHANGELOG.md            Knowledge-base audit trail  │
│                                                              │
│  AGENTS.md                  Workspace context for AI agents  │
│  LEARNINGS.md               Persistent cross-session memory  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The generated knowledge in `ai/knowledge/` is used by every subsequent skill to make informed decisions about your codebase.

---

### Stage 2 — Spec Delivery

Spec delivery is driven end-to-end by a single command:

```
/sdlc <JIRA-ID>
```

The `/sdlc` orchestrator chains 4 skills in order with **3 user checkpoints**. You can also run each skill individually.

```
  /sdlc <JIRA-ID>
  │
  ├─ 1. /create-specs ─────── Generate specs.md
  │     Fetches JIRA issue details, merges with ai/knowledge,
  │     and produces a scoped requirements spec. Runs recursive
  │     clarification (max 5 open questions), enforces tech-agnostic
  │     success criteria, and validates with 8-point quality checklist.
  │
  │  ◆ CHECKPOINT 1 — User reviews spec
  │
  ├─ 2. /create-plan ──────── Generate plan.md
  │     Reads the approved spec + ai/knowledge + all git projects.
  │     Hard gate: all open questions & assumptions must be resolved.
  │     Constitution check: validates against ai/harness/CONSTITUTION.md (if present).
  │     Cross-artifact consistency: FR→code and AC→test traceability.
  │
  │  ◆ CHECKPOINT 2 — User reviews implementation plan
  │
  ├─ 3. /execute ──────────── Implement, push & create MRs
  │     Pre-implementation checklist gate (blocks on unresolved items).
  │     Prepares workspace (branches, JIRA), implements via TDD with
  │     task progress tracking, self-reviews against spec, commits,
  │     pushes, and creates MRs. change-summary.md includes task checklist.
  │     On re-entry: MR Review Fix Phase for review comments.
  │
  │  ◆ CHECKPOINT 3 — Human reviewer adds MR comments
  │     (Re-run /execute to address them)
  │
  └─ 4. /wrap-up ──────────── Close and clean up
        Verifies MRs are merged, updates JIRA (comments + transition
        to Complete), publishes Confluence documentation (mandatory),
        deletes feature branches.
```

Between checkpoints, the agent operates fully autonomously — JIRA updates, Git operations, builds, tests, commits, pushes, and MR creation all happen without user intervention.

**Step-by-step manual flow** (if you prefer running commands individually):

```bash
# 1. Generate POD knowledge (one-time per project by POD lead)
/create-pod-knowledge

# 2. Create specs from JIRA issue
/create-specs PROJECT-1234
# → Review ai/specs/PROJECT-1234/specs.md

# 3. Create implementation plan
/create-plan PROJECT-1234
# → Review ai/specs/PROJECT-1234/plan.md

# 4. Execute (prepare branches + TDD + push + create MRs)
/execute PROJECT-1234

# 5. Fix MR review comments (after human review, re-run execute)
/execute PROJECT-1234

# 6. Wrap up (after all MRs merged)
/wrap-up PROJECT-1234

# Periodic: Integrate delivered features into knowledge (POD lead)
/update-knowledge
```

---

### Stage 3 — Periodic Maintenance

```
/update-knowledge
```

Run by the **POD lead** (not part of the spec delivery flow). This skill batch-integrates two streams into the shared `ai/knowledge/` specs on `develop`:

1. **Delivered specs** — any spec with a `change-summary.md` but no `.knowledge-integrated` marker.
2. **New or changed raw docs** — files under `ai/raw/**` detected via SHA-256 hashes in `ai/knowledge/.raw-integrated.log`.

Run it after a sprint ends, after multiple specs merge, after new raw docs are added, or before starting a major new spec to keep the knowledge base current. Every run appends an entry to `ai/knowledge/CHANGELOG.md` with timestamp, author, and a summary of what changed.

---

## Skills Inventory

| Skill | Command | Purpose |
|-------|---------|---------|
| `sdlc` | `/sdlc <JIRA-ID>` | End-to-end orchestrator — chains all feature delivery skills with 3 user checkpoints |
| `create-pod-knowledge` | `/create-pod-knowledge` | One-time setup: generates **mandatory** `POD.md` + 8 AI-readable specs from `ai/raw/` + codebase; also generates `AGENTS.md` + `LEARNINGS.md` |
| `create-specs` | `/create-specs <JIRA-ID>` | Generate `specs.md` — requirements, scope, acceptance criteria |
| `create-plan` | `/create-plan <JIRA-ID>` | Generate `plan.md` — file-level changes, test strategy, constraints |
| `execute` | `/execute <JIRA-ID>` | Full implementation lifecycle — TDD, test, push, create MRs, fix review comments |
| `wrap-up` | `/wrap-up <JIRA-ID>` | Verify MRs merged, update JIRA, publish Confluence docs (mandatory), clean up branches |
| `update-knowledge` | `/update-knowledge` | Batch-integrate delivered specs **and new/changed `ai/raw/` docs** into `ai/knowledge/` (POD lead only) |

---

## Individual Skill Descriptions

### `/create-pod-knowledge`

Generates comprehensive AI-readable specs from human docs + codebase analysis. Run once per project; thereafter run `/update-knowledge` to keep it current.

**Outputs:**
- `ai/knowledge/POD.md` — **mandatory** executive POD summary (purpose, sub-domain, capabilities, business entities, primary flows — 10–15 min read). Always generated, even if all other specs are skipped.
- `ai/knowledge/` — 8 detailed specs: `functional-spec.md`, `technical-spec.md`, `data-model-spec.md`, `api-spec.md`, `integration-spec.md` (internal + external), `security-spec.md`, `deployment-spec.md`, `nfr-spec.md`
- `ai/knowledge/CHANGELOG.md` — provenance/audit trail of every knowledge-base change (excluded from AGENTS.md and feature-spec lifecycle skills)
- `AGENTS.md` and `LEARNINGS.md` at the workspace root

### `/create-specs <JIRA-ID>`

Generates `specs.md` from a JIRA issue. Fetches issue content, cross-references POD knowledge, analyses codebase, and runs a recursive clarification loop for ambiguities.

**Key features:**
- **Recursive self-answering clarification** — 3-iteration loop that auto-resolves ambiguities from JIRA, POD knowledge, and codebase evidence
- **Max 5 open questions cap** — if >5 questions survive the loop, keeps the top 5 by impact and auto-resolves the rest with documented assumptions (`[AUTO-RESOLVED: OVERFLOW]`)
- **Success criteria guidelines** — enforces technology-agnostic, user-focused, measurable success criteria (no DB names, framework terms, or infra metrics in requirements)
- **Spec quality self-validation** — 8-point checklist run after generation: no implementation leakage, all FRs testable, scope clearly bounded, all FRs have sources, no orphan requirements, etc. Fixes issues before presenting to the user.

**Output:** `ai/specs/{JIRA-ID}/specs.md`

### `/create-plan <JIRA-ID>`

Generates a detailed implementation plan from the spec. Includes exact files to modify, TDD implementation order, critical constraints, and cross-artifact validation against the spec.

**Key features:**
- **Open questions hard gate** — all open questions and unverified assumptions in the spec must be resolved before plan generation proceeds
- **Constitution/governance check** — reads `ai/harness/CONSTITUTION.md` (if present) and validates the spec against its core principles, quality gates, conventions, and feature development standards. Technology-stack alignment is checked against `AGENTS.md` (not the constitution). Blocks on violations, logs warnings for soft mismatches.
- **Cross-artifact consistency** — verifies every FR maps to a file change and every AC maps to a test case (traceability matrix)

**Output:** `ai/specs/{JIRA-ID}/plan.md`

### `/execute <JIRA-ID>`

Full implementation lifecycle in a single skill:
1. **Pre-implementation checklist gate** — scans spec and plan for unresolved open questions, unconfirmed assumptions, placeholder text, and traceability gaps. Blocks if any issues found.
2. **Preparation** — attaches specs to JIRA, creates `develop-{JIRA-ID}` branches (including one for the `ai/` repo), transitions JIRA to "In Development"
3. **Implementation with task tracking** — TDD (tests first → implement → refactor), build, cross-project verification, self-review, post-implementation validation. Maintains a running task progress checklist (`T-01`, `T-02`, ...) updated after each completed item.
4. **Push & MRs** — commits, pushes branches, creates GitLab MRs targeting `develop` (one per impacted source project **and** one for the `ai/` repo), generates `change-summary.md` with traceability matrix + task progress checklist
5. **MR Review Fix** (on re-entry) — fetches unresolved MR comments, analyses each, implements fixes or explains rejection, builds, pushes, replies

**Output:** `ai/specs/{JIRA-ID}/change-summary.md` (includes MR links + traceability matrix + task checklist)

### `/wrap-up <JIRA-ID>`

Post-merge wrap-up: verifies all MRs are merged, deletes feature branches, posts a coding summary to JIRA, adds the `AI-Delivered` label, transitions to Complete, and **publishes comprehensive Confluence documentation** (mandatory — prompts for credentials if missing).

**Note:** Shared `ai/knowledge/` specs are NOT updated here. Use `/update-knowledge` separately.

**Output:** Confluence documentation page

### `/update-knowledge`

Batch-integrates two input streams into the shared `ai/knowledge/` specs:

1. **Delivered specs** — scans `ai/specs/*/` for specs with a `change-summary.md` but no `.knowledge-integrated` marker.
2. **New or changed raw docs** — scans `ai/raw/**` using SHA-256 hashes tracked in `ai/knowledge/.raw-integrated.log` to detect new or modified human-authored documents.

Either stream alone may trigger a run. Updates include `POD.md` (executive-level changes), all 8 detailed specs (targeted edits with source attribution), `AGENTS.md`, `LEARNINGS.md`, and appends an entry to `ai/knowledge/CHANGELOG.md`.

**Run on `develop` branch only.** Designed for periodic use by the POD lead after one or more features are merged, or after raw docs are updated. Commits use the reserved operational ID: `JIRA#JIRA-0000; Update knowledge for ...`.

---

## Configuration Reference

### MCP Server Registry

The `oauth-mcp-servers.json` file (in `ai/`) maps service base URLs to their MCP server endpoints. During setup, if a service URL you provide is found in this file, an MCP server entry is written to each AI tool's config file. Agents handle OAuth against those MCP endpoints at runtime.

**Format:**
```json
{
  "https://jira-uat.dell.com": {
    "name": "jira-it-np",
    "type": "http",
    "url": "https://jira-mcp-np.devsecops-r4-np.kob.dell.com/mcp"
  },
  "https://jira.dell.com": {
    "name": "jira-it",
    "type": "http",
    "url": "https://jira-mcp-prod.devsecops-r4-np.kob.dell.com/mcp"
  }
}
```

**How it works:**
- During setup, you provide service URLs (e.g., `https://jira-uat.dell.com`)
- If the URL is in `oauth-mcp-servers.json`: the MCP server entry is written to AI tool configs; agents handle OAuth against the MCP endpoint at runtime
- If the URL is NOT in `oauth-mcp-servers.json`: only PAT-based access is configured (no MCP server entry)
- PATs are always collected for all configured services and stored in `~/.config/sdd/credentials.json`
- The `name` property defines the MCP server name used in the configuration
- The `url` property is the MCP server endpoint URL
- Only servers for URLs you provide are configured; other entries in `oauth-mcp-servers.json` are ignored

**Adding new MCP server endpoints:**
To add support for a new endpoint, add an entry to `oauth-mcp-servers.json` with the service URL as the key, a unique `name` property, and the MCP server endpoint URL.

### MCP Server Configuration

MCP (Model Context Protocol) servers are configured automatically by the setup script to enable AI tools to integrate with external services.

**Configured MCP Servers:**

Only servers for service URLs you provide during setup are configured:

| Service | Authentication | Configured For |
|---------|----------------|----------------|
| JIRA | MCP server (if URL in oauth-mcp-servers.json) or PAT | Claude Code, Windsurf, Devin, VS Code |
| Confluence | MCP server (if URL in oauth-mcp-servers.json) or PAT | Claude Code, Windsurf, Devin, VS Code |
| GitLab | MCP server (if URL in oauth-mcp-servers.json) or PAT | Claude Code, Windsurf, Devin, VS Code |
| Snyk | stdio (`snyk auth`) | Claude Code, Windsurf, Devin, VS Code |

**Configuration Files:**
- Claude Code: `~/.claude.json`
- Windsurf: `~/.codeium/mcp_config.json`
- Devin: `~/.config/devin/config.json`
- VS Code: `~/.vscode/mcp.json`

**Selective Updates:**
The setup script only modifies MCP server entries for services you configure. Other user-configured MCP servers are preserved.

### Dell CA Certificate Bundle

For internal Dell Atlassian instances (JIRA, Confluence), the setup script uses the Dell corporate CA certificate bundle for TLS verification.

**Location:** `ai/certs/dell-ca.crt`

**How it works:**
- The certificate bundle is used for TLS verification when MCP endpoints handle authentication
- Falls back to system CA bundles if the Dell CA is not available
- Respects `REQUESTS_CA_BUNDLE`, `SSL_CERT_FILE`, and `CURL_CA_BUNDLE` environment variables

**Updating certificates:**
1. Export the Dell root/intermediate CA certificates from Windows Certificate Manager
2. Place them in `ai/certs/dell-ca.crt` (PEM format)
3. See `ai/certs/README.md` for detailed instructions

### Local Configuration File

The `local.config` file in the workspace root stores service URLs and PATs for JIRA, Confluence, and GitLab. This file is created during Phase 2 of setup and is used by MCP server configuration.

**Location:** `<workspace>/local.config`

**Format:**
```
jira_url=https://jira.dell.com
jira_token=<PAT-or-empty>
confluence_url=https://confluence.dell.com
confluence_token=<PAT-or-empty>
gitlab_url=https://gitlab.dell.com
gitlab_token=<PAT-or-empty>
```

**Key points:**
- PATs are always collected during setup for each service and stored in `~/.config/sdd/credentials.json` (global, 0600) and mirrored to `local.config`
- MCP server URLs are configured separately — agents handle OAuth against those endpoints at runtime
- This file is gitignored and should not be committed to version control
- The file is reused if it already exists (resume detection)

**Updating configuration:**
If you need to change service URLs or add PATs, you can either:
1. Edit `local.config` manually and re-run `setup.py` to update MCP configurations
2. Delete `local.config` and re-run `setup.py` to be prompted for credentials again

### Workspace Directory Layout

```
workspace/
├── AGENTS.md                    ← Runtime mirror of ai/harness/AGENTS.md (POD-lead-maintained)
├── LEARNINGS.md                 ← Developer-local secondary memory (each dev maintains their own)
├── ai/                          ← Mandatory separate Git repository
│   ├── pod-info.md              ← POD identity as key-value pairs (written by setup.py)
│   ├── harness/                 ← Harness master copies (version-controlled in ai/ repo)
│   │   ├── CONSTITUTION.md      ← [POD lead] Architectural governance, principles,
│   │   │                          quality gates, conventions, amendment process
│   │   ├── AGENTS.md            ← [POD lead] Workspace context master (mirrored to workspace root)
│   │   ├── LEARNINGS.md         ← [Starter template only — per-developer, NOT team-shared]
│   │   └── skills/              ← User-editable copies of the AI skills
│   │       ├── sdlc.md
│   │       ├── create-pod-knowledge.md
│   │       ├── create-specs.md
│   │       ├── create-plan.md
│   │       ├── execute.md
│   │       ├── wrap-up.md
│   │       └── update-knowledge.md
│   ├── raw/                     ← Human-written domain docs (INPUT — any format)
│   ├── knowledge/               ← AI-generated specs (OUTPUT of /create-pod-knowledge)
│   │   ├── POD.md               ← Executive POD summary (10–15 min read)
│   │   ├── functional-spec.md   ← Features, use cases, business rules, Mermaid flows
│   │   ├── technical-spec.md    ← Architecture, modules, tech stack, control flow
│   │   ├── data-model-spec.md   ← Entities, fields, indexes, ER diagrams
│   │   ├── api-spec.md          ← REST/gRPC endpoints with request/response schemas
│   │   ├── integration-spec.md  ← Internal Integrations (between POD repos) +
│   │   │                          External Interfaces (across POD boundary)
│   │   ├── security-spec.md     ← Auth, authz, data protection, compliance
│   │   ├── deployment-spec.md   ← Build, CI/CD, infrastructure, observability
│   │   ├── nfr-spec.md          ← Performance, scalability, reliability SLAs
│   │   ├── flows/               ← Mermaid flow diagrams per process
│   │   ├── data/                ← Sample JSON payloads
│   │   ├── CHANGELOG.md         ← Audit trail of every knowledge-base change
│   │   │                          (excluded from AGENTS.md & feature lifecycle skills)
│   │   └── .raw-integrated.log  ← Hash log tracking which ai/raw/ files are integrated
│   └── specs/                   ← Per-feature artifacts
│       └── PROJECT-1234/
│           ├── specs.md         ← Requirements, scope, FRs, ACs, NFRs
│           ├── plan.md          ← File-level implementation plan (TDD order)
│           ├── change-summary.md ← Per-project changes, MR links, traceability matrix
│           └── .knowledge-integrated  ← Marker (set by /update-knowledge)
│   └── submodules/              ← Git submodules for source projects (owned by this POD)
│       ├── project-alpha/       ← Git submodule
│       └── project-beta/        ← Git submodule
```

**Key rules:**
- `ai/pod-info.md` captures **POD identity** — unique POD Namespace and Git parent URL — set once by `setup.py` and version-controlled in the ai-workspace repo. Every AI skill that runs in the workspace can rely on this file to know which POD it is operating in. The file is a plain key-value list (no markdown formatting), e.g.:

  ```
  POD Namespace: infrastructure/ase/dlf/cloud-licensing-solution
  Domain: Infrastructure Solutions
  POD Group: Digital Licensing & Fulfillment
  POD Name: Connected Licensing Integrated Platform
  Git Parent URL: https://gitlab.dell.com/CLIP-001/cloud-licensing-solution
  Captured At: 2026-04-20T14:32:10Z
  Captured By: Karan K
  ```
- `ai/` is a **folder** within the ai-workspace repository. Every feature delivery produces commits + an MR against the ai-workspace repo (feature branch `develop-{JIRA-ID}`).
- `ai/knowledge/CHANGELOG.md` and `ai/knowledge/.raw-integrated.log` are **provenance-only** — `AGENTS.md` must not reference them, and feature-spec lifecycle skills (`create-specs`, `create-plan`, `execute`, `wrap-up`) must ignore them.
- Technology stack is documented in `AGENTS.md` (auto-detected from the codebase), **not** in `ai/harness/CONSTITUTION.md`.

### File Ownership — Who Maintains What

The three harness files have **different ownership models**. Respect them when editing:

| File | Canonical Location | Owner | Notes |
|------|--------------------|-------|-------|
| `CONSTITUTION.md` | `ai/harness/CONSTITUTION.md` | **POD lead** (team-wide) | Governs the whole POD. Amendments go through a reviewed MR (see §8 of the constitution). All developers read it; only the POD lead edits it. |
| `AGENTS.md`       | `ai/harness/AGENTS.md` (master) → `<workspace>/AGENTS.md` (runtime mirror) | **POD lead** (team-wide) | Regenerated by `/create-pod-knowledge` and refined over time. All developers read it; only the POD lead edits the master. The workspace-root mirror is auto-refreshed by `setup.py`. |
| `LEARNINGS.md`    | `<workspace>/LEARNINGS.md` (developer-local) | **Individual developer** | Personal secondary memory. Each POD developer maintains their own copy however they like — in a personal Git repo, a gist, a private fork, or just locally. **Not shared via the POD `ai/` repo.** The `ai/harness/LEARNINGS.md` seeded by `setup.py` is a starter template only; developers are free to replace, delete, or ignore it. |

**Why the split?** `CONSTITUTION.md` and `AGENTS.md` describe what the POD agrees on — governance, architecture, conventions — and must be consistent across the team. `LEARNINGS.md` captures how each developer personally navigates the codebase (gotchas, recipes, mental models); forcing it into a shared file would dilute it and create noisy merge conflicts.

### Branch Naming Convention

Feature branches follow the pattern: `develop-{JIRA-ID}` (e.g. `develop-PROJECT-1234`).

All Merge Requests target the `develop` branch. **Never `main` or `master`.**

### Commit Message Format

Commit messages follow the format defined in `AGENTS.md` and `ai/harness/CONSTITUTION.md`:

```
JIRA#{ISSUE_ID}; {description}
```

Example: `JIRA#PROJECT-1234; Add hardware serial validation to registration endpoint`

**Operational commits** that sit outside a single feature-delivery workflow (e.g. `/update-knowledge` batch runs, `setup.py` scaffold bootstraps) use the reserved placeholder ID **`JIRA-0000`**:

```
JIRA#JIRA-0000; Update knowledge for 3 feature(s) and 2 raw doc(s): PROJECT-1234, PROJECT-1235, PROJECT-1236
JIRA#JIRA-0000; Initial commit — ai knowledge base scaffold
```

This keeps every commit message aligned with the pre-receive hook format while cleanly distinguishing operational commits from feature work.

---

## Folder Contents

```
ai/
├── setup.py                  ← Interactive setup script (run this)
├── build.py                  ← Build system: skills/ → platform outputs
├── README.md                 ← This file
├── oauth-mcp-servers.json          ← OAuth-enabled MCP servers (endpoints with MCP servers that handle OAuth)
├── certs/                    ← Dell CA certificate bundle
│   ├── README.md             ← Instructions for certificate export
│   └── dell-ca.crt          ← Dell corporate root/intermediate CA certificates
│
├── skills/                   ← CANONICAL SOURCE (7 skills, platform-agnostic)
│   ├── sdlc.md
│   ├── create-pod-knowledge.md
│   ├── create-specs.md
│   ├── create-plan.md
│   ├── execute.md            ← Full lifecycle: TDD + push + MRs + review fix
│   ├── wrap-up.md
│   └── update-knowledge.md
│
├── .devin/skills/            ← Generated: Devin format
├── .windsurf/workflows/      ← Generated: Windsurf workflows
├── .claude/commands/         ← Generated: Claude Code commands
│
└── .windsurf/
    ├── hooks/                ← Static: Safety hooks (block destructive commands)
    └── hooks.json            ← Static: Hook configuration
```

> **Note:** Only `skills/`, `build.py`, `setup.py`, `oauth-mcp-servers.json`, `certs/`, static config, and hooks are committed. All platform-specific outputs under `.devin/`, `.windsurf/workflows/`, and `.claude/` are generated on-the-fly by `build.py build` and gitignored.

---

## Installation Paths

All skills, workflows, and rules are installed **into the workspace** — nothing is written to your home directory. Windsurf and Devin are installed by default; Claude Code is opt-in (default: no).

| Location | Path | Contents | Default |
|----------|------|----------|---------|
| Workspace | `.windsurf/workflows/` | 7 Windsurf workflows | yes |
| Workspace | `.windsurf/hooks/` + `.windsurf/hooks.json` | Safety hooks | yes |
| Workspace | `.devin/skills/` | 7 Devin skills | yes |
| Workspace | `.claude/commands/` | 7 Claude Code commands | no (opt-in) |
| Workspace | `AGENTS.md` | Runtime mirror of `ai/harness/AGENTS.md` (POD-lead-maintained) |  |
| Workspace | `LEARNINGS.md` | Developer-local secondary memory (each developer maintains their own) |  |


**MCP Server Configuration Files:** (user-global, configured by setup.py):
- `~/.claude.json` — Claude Code MCP server configuration
- `~/.codeium/mcp_config.json` — Windsurf MCP server configuration
- `~/.config/devin/config.json` — Devin MCP server configuration
- `~/.vscode/mcp.json` — VS Code MCP server configuration


---

## What `setup.py` Does

### Phase 1: Initial Harness Setup

| Step | Action |
|------|--------|
| 1.1 | **Capture POD identity** — prompts for the **POD Namespace** (`<domain>/<pod-group>/<pod-name>`, e.g. `digital-fulfilment/software-licensing/dynamic-licensing-registrations`) and the **POD Git parent URL** (e.g. `https://gitlab.dell.com/infrastructure/ase/dlf/licensing/dl-registrations`). Validated for format. The `ai/` repo URL is derived as `{git_parent}/ai-workspace.git`. |
| 1.2 | Determine workspace root directory |
| 1.3 | Verify `ai/` repo exists — **mandatory**. Prompt the user to either `1) Create` a new repo locally (default-pushed to `{git_parent}/ai-workspace.git`) or `2) Clone` an existing one (default clone URL pre-filled from POD info). New repos are seeded with `pod-info.md`, `harness/CONSTITUTION.md`, `harness/AGENTS.md`, `harness/LEARNINGS.md`, `harness/skills/` (user-editable skill copies), and `raw/`, `knowledge/`, `specs/` scaffolds. The `harness/AGENTS.md` and `harness/LEARNINGS.md` master copies are automatically mirrored to the workspace root. The initial commit uses `JIRA#JIRA-0000; Initial commit — ai-workspace knowledge base scaffold`. For cloned repos, `pod-info.md` is only written if it does not already exist, and the workspace-root mirrors are refreshed from the cloned masters. |
| 1.4 | Clone selected Git source project repositories (interactive — provide Git base URL + project names) |
| 1.5 | Generate platform outputs on-the-fly (`build.py build`) and install skills/workflows/rules **into the workspace**. Windsurf and Devin are installed by default; Claude Code is opt-in (default: no). **Nothing is written to the user's home directory.** |

**Additional Phase 1 Implementation Details:**

- **Git URL Conversion:** The setup automatically converts between SSH and HTTPS Git URLs. SSH URLs are used for push operations, while HTTPS URLs are used for API calls to GitLab.
- **Git Repo Auto-detection:** During Git project cloning, the setup auto-detects existing Git repositories in the workspace and skips them, preventing duplicate clones.
- **GitLab Subgroup Creation:** When creating a new ai/ repository, the setup ensures the GitLab subgroup exists before creating the repository under it.
- **AI Repo Remote Configuration:** If the ai/ repository exists but has no Git remote configured, the setup offers to add the remote and push it immediately.
- **POD Info Reuse:** If `ai/pod-info.md` already exists and contains valid POD identity information, the setup reuses it instead of prompting for POD namespace and Git parent URL.

### Phase 2: Initial POD/Domain Setup

| Step | Action |
|------|--------|
| 2.1 | Guide creation of human-written domain docs in `ai/raw/` |
| 2.2 | Run `/create-pod-knowledge` (if Devin CLI is available) to generate `POD.md`, the 8 knowledge specs, `CHANGELOG.md`, and to populate workspace-root `AGENTS.md` and `LEARNINGS.md` |
| 2.3 | **Configure service URLs** — Collect base URLs for JIRA, Confluence, and GitLab. URLs are saved to `local.config` in the workspace. 
| 2.4 | **Configure MCP servers** — Write MCP server configurations to `~/.claude.json`, `~/.codeium/mcp_config.json`, `~/.config/devin/config.json`, and `~/.vscode/mcp.json` using the service URLs from step 2.3. Agents handle OAuth against these MCP endpoints at runtime. |

---

## Maintaining This Folder

The canonical source for all skills is `skills/*.md`. When updating:

1. Edit the skill in `skills/{name}.md` (platform-agnostic markdown)
2. Regenerate all platform outputs: `python build.py build`
3. Verify outputs are up-to-date: `python build.py verify`
4. Check output sizes across platforms: `python build.py status`
5. Re-run `setup.py` to install the updated skills into each POD workspace

**Do NOT edit generated files** under `.devin/`, `.windsurf/workflows/`, or `.claude/` directly — they are overwritten by `build.py build`.

---

## Troubleshooting

### MCP Server Configuration Issues

**Problem:** MCP servers not appearing in AI tools.

**Solution:**
1. Restart your AI tool (Claude Code, Windsurf, Devin, VS Code) after running setup
2. Check that the configuration files were created correctly:
   - `~/.claude.json`
   - `~/.codeium/mcp_config.json`
   - `~/.config/devin/config.json`
   - `~/.vscode/mcp.json`
3. Verify the MCP server entries match the format in `oauth-mcp-servers.json`

**Problem:** Snyk MCP server not working.

**Solution:**
1. Ensure Snyk CLI is installed: `snyk --version`
2. Authenticate with Snyk: `snyk auth`
3. Restart your AI tool after authentication

**Snyk Installation Instructions:**

If Snyk CLI is not found in PATH, install it using one of these methods:

**Windows (Company Portal):**
1. Open Company Portal with Application ID: `00d29775-44f1-4807-a87a-88f22296289f`
2. Or download from: https://snyk.io/download

**Linux/WSL:**
```bash
# Download Snyk CLI
curl --compressed https://downloads.snyk.io/cli/latest/snyk-linux -o snyk

# Make the file executable
chmod +x ./snyk

# Move to a folder in your PATH
sudo mv ./snyk /usr/local/bin/

# Authenticate
snyk auth
```

**macOS:**
```bash
# Using Homebrew
brew install snyk

# Or download directly
curl --compressed https://downloads.snyk.io/cli/latest/snyk-macos -o snyk
chmod +x ./snyk
sudo mv ./snyk /usr/local/bin/
snyk auth
```

After installation, restart your AI tool to trigger MCP server authentication.

### General Setup Issues

**Problem:** `build.py build` fails.

**Solution:**
1. Ensure Python 3.10+ is installed
2. Check that all required dependencies are available
3. Verify that `skills/` directory exists and contains markdown files

**Problem:** Skills not installing into workspace.

**Solution:**
1. Check that the workspace directory exists and is writable
2. Verify that you have write permissions for `.windsurf/`, `.devin/`, and `.claude/` directories
3. Run `setup.py` again with verbose output if needed

### Git Integration Issues

**Problem:** JIRA/GitLab integration not working.

**Solution:**
1. Check that the MCP server URLs in `oauth-mcp-servers.json` match your instances
2. Ensure network connectivity to JIRA/GitLab servers
3. Restart your AI tool to trigger MCP server authentication
4. Verify MCP server authentication is working by checking the MCP client logs

For additional help, see the project documentation or contact the Dell DevSecOps SDD Team.
