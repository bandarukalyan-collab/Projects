# AI-Native SDLC Skills

An AI-powered Software Development Lifecycle harness that lets AI agents autonomously deliver features — from JIRA issue to merged code — with minimal human intervention.

Share this folder with any new team member to get them up and running.

> **Note:** You do not need to add this repo to your POD workspace. This quick-start is only meant to bootstrap your laptop with the `sdd-install` CLI tool and create a new POD workspace (`ai-workspace` Git repository). Once that is done, you no longer need this `pod-starter-kit` project.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [New Developer Setup](#new-developer-setup)
4. [How It Works](#how-it-works)
5. [Skills Reference](#skills-reference)
6. [Configuration](#configuration)
7. [Conventions](#conventions)
8. [Uninstall](#uninstall)
9. [Troubleshooting](#troubleshooting)
10. [For Harness Maintainers](#for-harness-maintainers)

---

## Prerequisites

- **Python 3.10+** and **Git** on PATH
- **uv** (Python package manager) — [install from https://docs.astral.sh/uv/getting-started/installation/](https://docs.astral.sh/uv/getting-started/installation/)
- Access to your Git remote (SSH keys or HTTPS)
- **POD approval and setup** — Your POD must be approved by L5 in the [AI Native SDLC Taxonomy Tool](https://ai-native.devops360-p3.kob.dell.com/SDD/Pods). The tool organizes PODs under POD-GROUPs within domains and guilds, which creates:
  - GitLab Sub Group: `https://gitlab.dell.com/{CMDB-ID}/{POD-SLUG}`
  - JIRA Project with key matching your POD Slug
  - JIRA team mapped to the Spec project for costing purposes
- *(Optional)* **Devin CLI** — for running Dell skills via `devin` command ([install](https://cli.devin.ai/docs))
- *(Optional)* **JIRA/Confluence/GitLab PATs** — collected interactively during setup for skills that call these services directly

---

## Quick Start

### POD Lead: First-Time Workspace Setup

The POD Lead runs `sdd-install` once to create the `ai-workspace` Git repository with all necessary structure. Team members then clone this repository (see [New Developer Setup](#new-developer-setup)).

#### 1. Install the CLI tool

**Latest version (from main branch):**
```bash
uv tool install sdd-install-kit --index-url https://artifacts.dell.com/artifactory/api/pypi/python-remote/simple --native-tls --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git --reinstall

```

**Specific version (recommended for production):**
```bash
# Replace v2.1.0 with your desired version tag
uv tool install sdd-install-kit --index-url https://artifacts.dell.com/artifactory/api/pypi/python-remote/simple --native-tls --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git@v2.1.0 --reinstall
```

> **Note:** Using a specific version tag ensures reproducible installations across your team. See [GitLab releases](https://gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit/-/releases) for available versions.

#### 2. Run the setup wizard

```bash
sdd-install
```

**Default Workspace Location:**
By default, the setup creates the workspace inside your home directory:
- **Windows**: `C:\Users\<you>\sdd-workspace`
- **Linux/macOS/WSL**: `~/sdd-workspace`

The local directory is named `sdd-workspace`, but when pushed to GitLab, it becomes `ai-workspace.git` under your POD group:
- **Local directory**: `~/sdd-workspace/`
- **GitLab repository**: `{git_parent}/ai-workspace.git`

You can accept the default or specify a custom location:

```bash
# Custom workspace location
sdd-install --workspace /path/to/sdd-workspace
```

#### What `sdd-install` does (POD Lead first-time setup):

1. **Captures POD identity** — prompts for your **POD slug** and retrieves POD details from the [AI Native SDLC Taxonomy Tool](https://ai-native.devops360-p3.kob.dell.com/SDD/Pods) (or uses `dummy-pod` for demo/testing). This provides the **POD Namespace**, **Git parent URL**, and other details written to `ai/pod-info.md` and used to derive the repository location (`{git_parent}/ai-workspace.git`).

2. **Creates and initializes the ai-workspace Git repository** with complete directory structure (see [Workspace Directory Layout](#workspace-directory-layout) for full details)

3. **Adds source project repositories as Git submodules** at workspace root level (same level as `ai/` folder)

4. **Installs skills/workflows/rules** into workspace root (Windsurf, Devin, and Claude Code)

5. **Creates workspace-level configuration** (`local.config`, `AGENTS.md`, `LEARNINGS.md`)

6. **Commits and pushes ai-workspace repository to GitLab** at `{git_parent}/ai-workspace.git`

### 2. Next steps (after setup completes)

1. **Place human domain docs in `ai/raw/`** — domain guides, architecture docs, requirements, API refs, UI/UX designs, onboarding material. These are the raw inputs the AI will learn from.

2. **Run `/create-pod-knowledge`** — analyses your codebase + raw docs to generate:
   - `ai/knowledge/POD.md` — executive POD summary (10–15 min read) — **mandatory, always generated**
   - `ai/knowledge/` — 8 AI-readable specs (functional, technical, data model, API, integration, security, deployment, NFR)
   - `ai/knowledge/CHANGELOG.md` — audit trail of all knowledge-base changes
   - `AGENTS.md` at the workspace root — POD-wide context file (regenerated on every run; master lives at `ai/harness/AGENTS.md`)
   - `LEARNINGS.md` at the workspace root — developer-local template (only seeded if missing; each developer curates their own)

   This is a one-time step per project.

3. **Start delivering features:**

```
/sdlc <JIRA-ID>
```

---

## New Developer Setup

For new team members joining an existing POD workspace (after the POD Lead has run `sdd-install` and created the `ai-workspace` repository):

### Option 1: Clone with Submodules (Recommended)

```bash
# Clone the ai-workspace repository recursively to include all submodules
# Note: GitLab repo is named ai-workspace.git, but you can name the local directory anything
git clone --recurse-submodules <ai-workspace-repo-url> sdd-workspace
cd sdd-workspace
```

### Option 2: Clone and Initialize Separately

```bash
# Clone the ai-workspace repository first
git clone <ai-workspace-repo-url> sdd-workspace
cd sdd-workspace

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

### Stage 2 — Spec Delivery

Spec delivery is driven end-to-end by a single command:

```
/sdlc <JIRA-ID>
```

The `/sdlc` orchestrator chains 4 skills in order with **3 user checkpoints**:

1. **`/create-specs`** → Generate `specs.md` ◆ **CHECKPOINT 1** — User reviews spec
2. **`/create-plan`** → Generate `plan.md` ◆ **CHECKPOINT 2** — User reviews implementation plan  
3. **`/execute`** → Implement, push & create MRs ◆ **CHECKPOINT 3** — Human reviewer adds MR comments
4. **`/wrap-up`** → Verify merged, update JIRA, publish Confluence docs

Between checkpoints, the agent operates fully autonomously — JIRA updates, Git operations, builds, tests, commits, pushes, and MR creation all happen without user intervention.

See [Skills Reference](#skills-reference) for detailed information on each skill, including features, outputs, and usage.

### Stage 3 — Periodic Maintenance

```
/update-knowledge
```

Run by the **POD lead** (not part of the spec delivery flow). This skill batch-integrates two streams into the shared `ai/knowledge/` specs on `develop`:

1. **Delivered specs** — any spec with a `change-summary.md` but no `.knowledge-integrated` marker.
2. **New or changed raw docs** — files under `ai/raw/**` detected via SHA-256 hashes in `ai/knowledge/.raw-integrated.log`.

Run it after a sprint ends, after multiple specs merge, after new raw docs are added, or before starting a major new spec to keep the knowledge base current. Every run appends an entry to `ai/knowledge/CHANGELOG.md` with timestamp, author, and a summary of what changed.

---

## Skills Reference

| Skill | Command | Purpose |
|-------|---------|---------|
| `sdlc` | `/sdlc <JIRA-ID>` | End-to-end orchestrator — chains all feature delivery skills with 3 user checkpoints |
| `create-pod-knowledge` | `/create-pod-knowledge` | One-time setup: generates **mandatory** `POD.md` + 8 AI-readable specs from `ai/raw/` + codebase; also generates `AGENTS.md` + `LEARNINGS.md` |
| `create-specs` | `/create-specs <JIRA-ID>` | Generate `specs.md` — requirements, scope, acceptance criteria |
| `create-plan` | `/create-plan <JIRA-ID>` | Generate `plan.md` — file-level changes, test strategy, constraints |
| `execute` | `/execute <JIRA-ID>` | Full implementation lifecycle — TDD, test, push, create MRs, fix review comments |
| `wrap-up` | `/wrap-up <JIRA-ID>` | Verify MRs merged, update JIRA, publish Confluence docs (mandatory), clean up branches |
| `update-knowledge` | `/update-knowledge` | Batch-integrate delivered specs **and new/changed `ai/raw/` docs** into `ai/knowledge/` (POD lead only) |

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

## Configuration

### `local.config` (Required, gitignored)

Create at workspace root. The setup script creates this interactively, or you can create it manually:

```
JIRA_PAT=<your-jira-personal-access-token>
JIRA_BASE_URL=https://jira.example.com
GIT_PAT=glpat-xxxxxxxxxxxxxxxxxxxx
CONFLUENCE_PAT=<your-confluence-pat>
CONFLUENCE_PARENT=https://confluence.example.com/spaces/SPACE/pages/12345/Parent+Page
CONFLUENCE_BASE_URL=https://confluence.example.com
```

| Key | Required | Description |
|-----|----------|-------------|
| `JIRA_PAT` | No | JIRA Personal Access Token (for skills calling JIRA REST API) |
| `JIRA_BASE_URL` | Yes | JIRA instance base URL |
| `GIT_PAT` | Yes | GitLab PAT with `api` scope |
| `CONFLUENCE_PAT` | No | Confluence PAT (for doc publishing) |
| `CONFLUENCE_PARENT` | No | Full URL of parent Confluence page |
| `CONFLUENCE_BASE_URL` | No | Confluence instance base URL |

> **Never commit this file.** It should be in `.gitignore`.

### Workspace Directory Layout

```
sdd-workspace/                   ← Local directory name (GitLab repo: ai-workspace.git)
├── .git/                        ← Git repository
├── .gitmodules                  ← Submodule tracking
├── local.config                 ← PATs (gitignored)
├── AGENTS.md                    ← Runtime mirror of ai/harness/AGENTS.md (POD-lead-maintained)
├── LEARNINGS.md                 ← Developer-local secondary memory (each dev maintains their own)
├── .windsurf/                   ← Windsurf workflows + safety hooks (installed by sdd-install)
├── .devin/                      ← Devin skills (installed by sdd-install)
├── .claude/                     ← Claude Code commands (optional, installed by sdd-install)
├── ai/                          ← Folder for POD knowledge/governance (part of ai-workspace repo)
│   ├── pod-info.md              ← POD identity as key-value pairs (written by sdd-install)
│   ├── harness/                 ← Harness master copies (version-controlled in ai-workspace repo)
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
├── project-alpha/               ← Git submodule (source code project)
├── project-beta/                ← Git submodule (source code project)
└── project-gamma/               ← Git submodule (source code project)
```

**Key rules:**
- **Local directory name**: `sdd-workspace` (or any name you choose)
- **GitLab repository name**: `ai-workspace.git` (pushed to `{git_parent}/ai-workspace.git`)
- **ai/** is a folder within the repository (not a separate repo)
- **Source projects** are Git submodules at the same level as `ai/` folder
- **`.gitmodules`** is at the repository root and tracks all source project submodules
- **Platform-specific installations** (`.windsurf/`, `.devin/`, etc.) are created by `sdd-install` and are gitignored
- `ai/pod-info.md` captures **essential POD identity and metadata** — retrieved from the AI Native SDLC Taxonomy Tool by POD slug — and version-controlled in the ai-workspace repo. Every AI skill that runs in the workspace can rely on this file to know which POD it is operating in. The file contains high-level details including:

  ```
  POD Namespace: infrastructure/ase/dlf/cloud-licensing-solution
  Domain: Infrastructure Solutions
  POD Group: Digital Licensing & Fulfillment
  POD Name: Connected Licensing Integrated Platform
  Git Parent URL: https://gitlab.dell.com/CLIP-001/cloud-licensing-solution
  Captured At: 2026-05-08T19:10:33Z
  Captured By: Ponaka, Kamalakar

  # === Essential POD Information ===
  POD ID: 142
  POD Status: Active
  POD Type: Application
  App ID (CMDB ID): CLIP-001
  JIRA Project: SCLP - Connected Licensing Integrated Platform (SCLP)
  POD Members: john.doe@dell.com, jane.smith@dell.com, bob.wilson@dell.com
  POD Lead: john.doe@dell.com
  POD Group Name: Digital Licensing & Fulfillment
  POD Group Lead: Alice Johnson (alice.johnson@dell.com)
  Guild: Infrastructure Solutions Guild
  ```
- `ai/` is a **folder** within the ai-workspace repository. Every feature delivery produces commits + an MR against the ai-workspace repo (feature branch `develop-{JIRA-ID}`).
- The **local directory** is typically named `sdd-workspace`, but the **GitLab repository** is named `ai-workspace.git`
- `ai/knowledge/CHANGELOG.md` and `ai/knowledge/.raw-integrated.log` are **provenance-only** — `AGENTS.md` must not reference them, and feature-spec lifecycle skills (`create-specs`, `create-plan`, `execute`, `wrap-up`) must ignore them.
- Technology stack is documented in `AGENTS.md` (auto-detected from the codebase), **not** in `ai/harness/CONSTITUTION.md`.

---

## Conventions

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

## Uninstall

### Remove the CLI Tool

```bash
sdd-install --uninstall
```

This shows the uninstall command and explains what will not be automatically removed.

To actually uninstall:

```bash
uv tool uninstall sdd-install-kit
```

### Upgrade to a Newer Version

**Upgrade to latest:**
```bash
uv tool install sdd-install-kit --index-url https://artifacts.dell.com/artifactory/api/pypi/python-remote/simple --native-tls --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git --reinstall --force
```

**Upgrade to specific version:**
```bash
# Replace v2.2.0 with your desired version
uv tool install sdd-install-kit --index-url https://artifacts.dell.com/artifactory/api/pypi/python-remote/simple --native-tls --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git@v2.2.0 --reinstall --force
```

> **Tip:** After upgrading the CLI tool, run `sdd-install` in each workspace to update the installed skills to match the new version.

### Manual Cleanup (Optional)

The uninstaller removes only the CLI tool. The following are left in place and can be manually removed if desired:

**Per-user configurations:**
- `~/.config/sdd/credentials.json` — stored PATs
- `~/.codeium/windsurf/global_rules.md` — Snyk security directives
- `~/.claude/CLAUDE.md` — Snyk security directives
- `~/.codeium/mcp_config.json` — Windsurf MCP server configs
- `~/.claude.json` — Claude Code MCP server configs
- `~/.config/devin/config.json` — Devin MCP server configs

**Workspace-specific installations:**
- `<workspace>/.windsurf/workflows/` — Windsurf workflows
- `<workspace>/.devin/skills/` — Devin skills
- `<workspace>/.claude/commands/` — Claude Code commands (if installed)
- `<workspace>/local.config` — workspace PATs (gitignored)
- `<workspace>/ai/` — entire AI knowledge base repository

**To completely remove everything:**

```bash
# Remove per-user configs
rm -rf ~/.config/sdd
rm -f ~/.codeium/windsurf/global_rules.md  # Only removes Snyk directives
rm -f ~/.claude/CLAUDE.md                  # Only removes Snyk directives

# Remove workspace installations (run from each workspace root)
rm -rf .windsurf .devin .claude local.config
# Optionally remove the ai/ repository (contains your knowledge base)
rm -rf ai/
```

---

## Troubleshooting

### Installation Issues

#### "uv: command not found"

Install uv first: https://docs.astral.sh/uv/getting-started/installation/

```bash
# On Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# On macOS/Linux  
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### "Permission denied (publickey)" or SSH key issues

Either set up SSH keys for GitLab or use HTTPS instead:

```bash
uv tool install sdd-install-kit --index-url https://artifacts.dell.com/artifactory/api/pypi/python-remote/simple --native-tls --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git --reinstall

```

#### "Failed building wheel" or build errors

Ensure you have Python 3.10+ and try updating uv:

```bash
uv self update
```

#### Network/firewall issues

If behind a corporate firewall, you may need to configure proxy settings or use internal package mirrors.

### Runtime Issues

### "No POD knowledge found"

Run `/create-pod-knowledge` first. Ensure `ai/raw/` contains domain documentation.

### "local.config not found"

Run `setup.py` or create it manually (see [Configuration Reference](#configuration)).

### "JIRA API authentication failed"

Regenerate your JIRA PAT and update `local.config`. Ensure `JIRA_BASE_URL` is correct.

### "GitLab MR creation failed (401/403)"

Regenerate your GitLab PAT with `api` scope and update `GIT_PAT` in `local.config`.

### "MR already exists"

The `execute` skill checks for existing MRs before creating new ones. If an MR already exists, it is recorded as "Existing" in the report.

### "Wrap-up halted — MRs still open"

The `wrap-up` skill requires all MRs to be in `merged` state. Merge all MRs first, then re-run.

### Destructive Command Blocked

The safety hook (`block_destructive_commands.py`) prevents AI agents from running `rm`, `del`, `Remove-Item`, and similar commands. If a command is blocked and you need to run it, execute it manually.

---

## For Harness Maintainers

This section is only relevant if you're contributing to the harness itself (not using it).

### Source Repository Structure (pod-starter-kit)

This describes the **pod-starter-kit repository** structure (the repo you're reading now), NOT the workspace structure created by `sdd-install`.

```
pod-starter-kit/
├── README.md                 ← This file
├── CLAUDE.md                 ← Project context for AI agents
├── dell-sdd/                 ← Harness source code
│   ├── setup.py              ← Interactive setup script
│   ├── build.py              ← Build system: skills/ → platform outputs
│   ├── skills/               ← CANONICAL SOURCE (7 skills, platform-agnostic)
│   │   ├── sdlc.md
│   │   ├── create-pod-knowledge.md
│   │   ├── create-specs.md
│   │   ├── create-plan.md
│   │   ├── execute.md
│   │   ├── wrap-up.md
│   │   └── update-knowledge.md
│   ├── .devin/skills/        ← Generated: Devin format
│   ├── .windsurf/workflows/  ← Generated: Windsurf workflows
│   ├── .claude/commands/     ← Generated: Claude Code commands
│   └── docs/                 ← Documentation
│       └── DEMO-GUIDE.md
├── sdd_install_kit/          ← Python package (sdd-install CLI)
└── hooks_installer/          ← Windsurf safety hooks
```

> **Note:** Only `skills/`, `build.py`, `setup.py`, and docs are committed. Platform-specific outputs (`.devin/`, `.windsurf/workflows/`, `.claude/`) are generated on-the-fly by `build.py build` and gitignored.

### Installation Paths

All skills, workflows, and rules are installed **into the workspace** — nothing is written to your home directory. Windsurf and Devin are installed by default; Claude Code is opt-in (default: no).

| Location | Path | Contents | Default |
|----------|------|----------|---------|
| Workspace | `.windsurf/workflows/` | 7 Windsurf workflows | yes |
| Workspace | `.windsurf/hooks/` + `.windsurf/hooks.json` | Safety hooks | yes |
| Workspace | `.devin/skills/` | 7 Devin skills | yes |
| Workspace | `.claude/commands/` | 7 Claude Code commands | no (opt-in) |
| Workspace | `AGENTS.md` | Runtime mirror of `ai/harness/AGENTS.md` (POD-lead-maintained) |  |
| Workspace | `LEARNINGS.md` | Developer-local secondary memory (each developer maintains their own) |  |

### Maintaining This Folder

The canonical source for all skills is `skills/*.md`. When updating:

1. Edit the skill in `skills/{name}.md` (platform-agnostic markdown)
2. Regenerate all platform outputs: `python build.py build`
3. Verify outputs are up-to-date: `python build.py verify`
4. Check output sizes across platforms: `python build.py status`
5. Re-run `setup.py` to install the updated skills into each POD workspace

**Do NOT edit generated files** under `.devin/`, `.windsurf/workflows/`, or `.claude/` directly — they are overwritten by `build.py build`.
