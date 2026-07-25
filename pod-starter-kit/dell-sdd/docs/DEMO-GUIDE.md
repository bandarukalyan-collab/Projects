# POD Starter Kit — Demo Guide

**Audience:** POD Leads and AI Native Developers  
**Format:** Zoom Webinar  
**Platform:** Windows (PowerShell / WSL / Bash) · Windsurf · Devin  
**Duration:** ~30 min (Structural context: 3 min · Part 1: 12 min · Part 2: 15 min)

> **Speaker note format:** Steps show what to *do*. `> 🎤` blocks show what to *say*.  
> Lines marked `⚠️` are things that can go wrong and how to handle them.

> **Webinar reminders:**
> - Attendees join at different times — open with the orientation block below before any content
> - Name every file and folder out loud when you navigate to it — attendees can't follow your cursor
> - Replace "as you can see here" with "on your screen you'll see X" or "I'm looking at `ai\pod-info.md` now"
> - Screen share setup: share the **Windsurf window at 1920×1080**, crop the taskbar — do this before the session starts
> - Take chat questions **at checkpoints only** — say "I'll read chat while the AI runs between checkpoints" at the start; don't interrupt the live flow
> - Pin **ai.native.sdlc.support@dell.com** in Zoom chat before you begin so attendees can save it immediately
> - Use Zoom's "Share a portion of screen" to crop out your taskbar and keep text large

---

## Opening Orientation (30 sec — say this first, before any screen share)

> 🎤 **Say:** "Welcome — glad you're here. Over the next 30 minutes I'm going to show you three things: how a POD Lead sets up a workspace in about two minutes, how the AI builds a complete understanding of your codebase, and how a developer goes from a JIRA ticket to merged code and Confluence docs without writing a single doc manually. There's a chat panel open — drop questions there as we go, I'll take them throughout. Let's get into it."

---

## What This Demo Covers

| Part | Persona | What You Show |
|------|---------|---------------|
| 1a | **POD Lead** | Install + live wizard with `dummy-pod` — no credentials, safe to run anywhere |
| 1b | **POD Lead** | Switch to pre-set-up real POD workspace — show what Taxonomy API lookup produces |
| 2 | **Developer** | Deliver a feature end-to-end: JIRA → specs → plan → code → MR → close |

**Why two POD modes?**

| | `dummy-pod` | Real POD |
|---|---|---|
| Taxonomy API called? | No | Yes — retrieves namespace, Git URL, JIRA project, members |
| Repos cloned? | No | Yes — your actual GitLab projects |
| `pod-info.md` | Placeholder values | Real POD identity from the taxonomy |
| Push to GitLab? | Defaults to **No** | Defaults to **Yes** |
| Best for | Learning, experimentation, demos without credentials | Actual team use |

**Demo strategy:** Run the wizard live with `dummy-pod` (predictable, safe, no live API calls mid-demo), then switch to a workspace already set up against a real POD to show the difference. Running the wizard twice is repetitive — the switch is cleaner.

---

## Structural Changes — Key Context for This Demo

Cover these before the live walkthrough (~3 min). The audience needs this backdrop before they see the kit.

### JIRA Issue Type Hierarchy: 6 → 3

The JIRA issue type hierarchy has been simplified from 6 levels down to 3:

```
OLD — Non-POD (6 levels)                NEW — POD (3 levels)
──────────────────────────────          ──────────────────
Theme                                   Program
  └─ Portfolio Epic                       └─ Feature
       └─ Capability                            └─ Spec   ← /sdlc targets this
            └─ Epic
                 └─ Story / Task / Defect
                      └─ Sub-task
```

**What this means for the kit:**

| Level | Owner | Purpose |
|-------|-------|---------|
| **Program** | Portfolio / L5+ | Tracks a strategic initiative across multiple PODs |
| **Feature** | Feature Lead | A deliverable capability within the Program — Feature Lead creates it and decomposes it into Specs |
| **Spec** | Feature Lead + POD Lead | A single implementable slice — Feature Lead drafts the high-level decomposition; POD Lead refines and reviews before handoff to developers |

> 🎤 **Say:** "The non-POD JIRA hierarchy has six levels — Theme, Portfolio Epic, Capability, Epic, Story or Task or Defect, and Sub-task. For POD teams we've collapsed that down to three — Program, Feature, and Spec. The bottom level is called a *Spec* intentionally. That name comes from how the AI works: every Spec issue in JIRA becomes a `specs.md`, a `plan.md`, an implementation, and a Confluence doc. The JIRA hierarchy and the SDD workflow are the same shape. Feature Leads create Features and decompose them into high-level Specs; the POD Lead refines and reviews each Spec before developers pick them up. Developers hand a Spec ID to the AI and come back to review."

**Practical impact:**
- Feature Leads create Features in JIRA and decompose them into Specs (high-level scope and acceptance criteria)
- POD Leads refine and review each Spec before it is handed off to developers
- Developers run `/sdlc <SPEC-ID>` — not against Programs or Features
- The kit fetches the Spec issue content + its parent Feature for broader context when generating `specs.md`
- Spec IDs follow the existing project key pattern: `PODT-9`, `SCLP-4342`, `PROJ-1234`, etc.

---

### Git Restructure: Based on CMDB ID

GitLab group structure is moving from deep namespace paths to a flat, CMDB-anchored format. **Already implemented in the kit** — `sdd-install` writes the flat URL today.

```
OLD (deep namespace)                    NEW (flat, CMDB-anchored)
──────────────────────────────────      ──────────────────────────────────
gitlab.dell.com/                        gitlab.dell.com/
  infrastructure/                         {CMDB-ID}/
    ase/                                    {POD-SLUG}/
      dlf/                                    clip-app.git
        cloud-licensing-solution/             clip-integrations.git
          clip-app.git                        dlfportal.git
          clip-integrations.git               ...
          dlfportal.git
```

> 🎤 **Say:** "The second structural change is Git. We're flattening the GitLab group hierarchy to be rooted at the CMDB ID. The reason is compliance — code is an asset. Dell's audit framework requires every asset to trace back to a CMDB entry, and the old namespace paths didn't give us that cleanly. Two PODs could have the same slug under different hierarchies and there was no reliable way to tie a repo back to CMDB without manual lookup. The new structure makes CMDB ID the root of every repo URL. You can go from any GitLab URL directly to its CMDB record, and vice versa. The kit handles this automatically — `sdd-install` reads the CMDB ID from the Taxonomy API and writes the correct URL into `pod-info.md`. Developers never type a CMDB ID."

**How the kit handles it (already live):**

When `sdd-install` runs, the Taxonomy API returns the CMDB ID (`appId`). The installer builds:

```
Git Parent URL = https://gitlab.dell.com/{CMDB-ID}/{pod-slug}
```

| Field | Example |
|-------|---------|
| `pod-info.md` — Git Parent URL | `https://gitlab.dell.com/APP-001/clip` |
| Repo remote URL | `git@gitlab.dell.com:APP-001/clip/clip-app.git` |
| `ai/` repo remote | `git@gitlab.dell.com:APP-001/clip/ai.git` |
| MR target (created by `/execute`) | `APP-001/clip` group |

**Practical impact for POD Leads:**
- **New PODs** — flat URL is set automatically by `sdd-install`, nothing to do
- **Existing workspaces** — `pod-info.md` Git Parent URL and repo remotes must be updated when the GitLab migration runs; re-run `sdd-install` or update manually

> 🎤 **Transition:** "Those are the two structural changes — simpler JIRA, CMDB-rooted Git. Before I show the kit in action, quick context on where it came from."

---

## How We Got Here — SpecKit to SDD

> 🎤 **Say (~2 min):** "Some of you may have used SpecKit — the GitHub-based AI skill set that got us started. The pod-starter-kit is the evolution of that. Same idea, institutionalised and integrated into Dell's toolchain — CMDB, JIRA, GitLab, Confluence, Snyk. If your team is still on SpecKit, there's a migration path. It's two steps and it's automated."

### The migration in two steps

**Milestone 1 — Run the workspace migrator (PowerShell)**

```powershell
.\sdd-migrate.ps1 -LegacyWorkspace "C:\path\to\old-spec-kit" `
                  -NewWorkspace "C:\path\to\new-pod-workspace"
```

What it does automatically:
- Calls `sdd-install` to scaffold the new structure
- Copies your existing feature specs into `ai\specs\` and governance rules into `ai\harness\rules\`
- Re-clones your source repos fresh (auto-discovered from the legacy remote URLs — no list to provide)
- Deploys skills to Windsurf, Devin, Claude Code, and Cursor
- Handles skill name collisions with a `rules-` prefix and logs them to `ai\knowledge\CHANGELOG.md`

> 🎤 **Say:** "Zero parameters for repo discovery — it reads the `remote.origin.url` from the legacy workspace and clones everything fresh. Your historical specs, governance rules, and in-flight feature branches all carry over. Application code stays pristine — no documentation files mixed in."

**Milestone 2 — Synthesise the knowledge base (Windsurf)**

Open the new workspace in Windsurf, then in the AI panel:

```
/migrate-app-knowledge
```

When prompted, confirm with:
```
proceed with create-app-knowledge
```

What it does:
- Stages your migrated rules and legacy specs into a temporary `ai\raw\migration-context\` folder
- Generates the 9 core knowledge specs in `ai\knowledge\` by cross-referencing your rules against the codebase
- Cleans up the staging folder and leaves `ai\raw\` empty and ready for new docs

> 🎤 **Say:** "After this, you're fully on the new platform. Any new docs or ADRs you want to add go into `ai\raw\` and you run `/update-knowledge` — same as a greenfield setup."

### What's preserved, what changes

| | SpecKit | pod-starter-kit (SDD) |
|---|---------|----------------------|
| Governance / CONSTITUTION | ✅ Migrated to `ai\harness\` | Same location, same format |
| Custom IDE prompts / rules | ✅ Migrated with anti-clobber | Deployed to all 4 IDEs automatically |
| In-flight feature specs | ✅ Blind-copied to `ai\specs\` | Continue delivery from where you left off |
| Source repos | Re-cloned fresh | CMDB-rooted URLs |
| JIRA integration | Manual | Automated via PAT + MCP |
| Git structure | Deep namespace | Flat `{CMDB-ID}/{POD-SLUG}` |
| Confluence publishing | Not included | Mandatory via `/wrap-up` |

> 🎤 **Transition:** "Now let me show you how the kit works from scratch — the install, the setup, and then a full feature delivery."

---

## Before the Demo — Pre-flight Checklist

Run these ahead of time so there's no waiting during the live session.

**Machine requirements:**
- [ ] Python 3.10+ on PATH — `python --version`
- [ ] Git on PATH — `git --version`
- [ ] `uv` installed — `uv --version` (install: `winget install astral-sh.uv` or via `curl`)
- [ ] SSH key registered on GitLab (or HTTPS PAT ready)
- [ ] Windsurf installed and open
- [ ] Devin CLI installed (optional — `devin --version`)

**Accounts / tokens:**
- [ ] JIRA PAT ready (Settings → Personal Access Tokens)
- [ ] GitLab PAT with `api` scope
- [ ] Confluence PAT (optional — for wrap-up)
- [ ] Real POD slug confirmed in the [AI Native SDLC Taxonomy Tool](https://ai-native.devops360-p3.kob.dell.com/SDD/Pods)

**Pre-set-up (do the day before):**
- [ ] Run `sdd-install --workspace ~\sdd-dummy` with `dummy-pod` — confirm wizard flow end-to-end
- [ ] Run `sdd-install --workspace ~\ssd-real` with your real POD slug — confirm repos clone and `pod-info.md` is populated with real data
- [ ] Add sample docs to `~\ssd-real\ai\raw\` and run `/create-pod-knowledge` so `ai\knowledge\` is already populated for Part 2
- [ ] Have a real JIRA Spec ticket ready for the developer demo (or use `EXAMPLE-101` from the example workspace)

---

## Demo Cheat Sheet

```
── STRUCTURAL CONTEXT (3 min) ────────────────────────────────────────────────
  JIRA: Theme > Portfolio Epic > Capability > Epic > Story/Task/Defect > Sub-task
        → Program → Feature → Spec  (/sdlc targets Spec)
  Git:  flat CMDB-ID root: gitlab.dell.com/{CMDB-ID}/{pod-slug}/repo.git
        code = asset → must trace to CMDB for audit/compliance

── PART 1a: dummy-pod (live wizard, ~5 min) · 0:05–0:10 ─────────────────────
  uv tool install sdd-install-kit --from git+ssh://...  --reinstall
  sdd-install --workspace ~\sdd-dummy
    POD slug → dummy-pod   (skips Taxonomy API, no repos cloned, push=No)
    IDE      → Windsurf + Devin
    PATs     → skip
  Show: ai\pod-info.md (placeholder), .windsurf\workflows\ (skills installed)

── PART 1b: real POD (pre-set-up, ~7 min) · 0:10–0:17 ───────────────────────
  Switch to ~\ssd-real
  Show: ai\pod-info.md (real CMDB-rooted Git URL, JIRA project, members)
  Show: cloned source repos in workspace root
  /create-pod-knowledge   (Windsurf) or   devin run create-pod-knowledge
  Show: ai\knowledge\ (POD.md + 8 specs), AGENTS.md (project table, tech stack)

── PART 2: Developer (~15 min) · 0:17–0:30 ──────────────────────────────────
  Open JIRA Spec ticket in browser
  /sdlc PODT-9         (Windsurf) or   devin run sdlc --args PODT-9
    ├── create-specs → specs.md        [CHECKPOINT 1: POD Lead reviews FRs, ACs, scope]
    ├── create-plan  → plan.md         [CHECKPOINT 2: review files, TDD order, traceability]
    ├── execute      → code + MRs      [CHECKPOINT 3: reviewer adds GitLab comments]
    │   execute again → fixes comments
    └── wrap-up      → JIRA Complete + Confluence published

── PERIODIC (POD Lead, post-sprint) ──────────────────────────────────────────
  /update-knowledge       (Windsurf) or   devin run update-knowledge
```

---

## Part 1a — POD Lead Story · dummy-pod (Live Wizard) · 0:05–0:10

> 🎤 **Opening (30 sec):** "Before the first developer can run `/sdlc`, the POD Lead does a one-time setup. Two commands and a short wizard — that's it. I'll run it live right now using `dummy-pod`, which skips the Taxonomy API so you can see every prompt without me needing to expose real credentials. Then I'll flip to a workspace I already set up against our actual POD so you can see the difference."

---

### Step 1 · Install the CLI

Open **PowerShell** (or WSL Bash — both work identically):

```powershell
# PowerShell — Windows native
uv tool install sdd-install-kit `
  --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git `
  --reinstall
```

```bash
# WSL / Git Bash — same command, POSIX quoting
uv tool install sdd-install-kit \
  --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git \
  --reinstall
```

> 🎤 **Say:** "One command, works from PowerShell or WSL — whichever your developers prefer. It installs the `sdd-install` CLI globally via `uv`. This is a one-time install per machine; after that it's just `sdd-install` every time you want to set up a new workspace."

> ⚠️ **If SSH fails:** "If you see a permission denied, your SSH key isn't registered on GitLab yet. Fallback: swap `git+ssh://` for `git+https://` and use a PAT."

---

### Step 2a · Run the setup wizard — dummy-pod

```powershell
sdd-install --workspace ~\sdd-dummy
```

> 🎤 **Say:** "Now the wizard. In real use you'd just run `sdd-install` and accept the default — which puts the workspace in your home directory. I'm passing a different path explicitly so the demo stays in a clean spot."

**Walk through each prompt live:**

| Prompt | Enter | Say |
|--------|-------|-----|
| POD slug | `dummy-pod` | "In real use you'd type your actual POD slug — something like `cloud-licensing-solution`. I'm using `dummy-pod` so it skips the Taxonomy API call entirely. Safe for demos, good for onboarding new developers before their POD is registered." |
| Workspace root | `~\sdd-dummy` | "Defaults to `~\sdd-workspace` on Windows — your home directory, so the workspace persists across reboots and temp-dir cleanups. I'm passing a different path explicitly so the demo runs in a clean spot." |
| Clone Git repos? | No | "For a real POD this clones your actual source projects from GitLab right here. `dummy-pod` skips it." |
| Install Windsurf? | Yes | "This writes the 7 skills as workflow files into `.windsurf\workflows\`. If Windsurf is open, the skills appear immediately in the workflow panel." |
| Install Devin? | Yes | "Same skills, different format, deployed to `.devin\skills\`." |
| Install Claude Code? | Optional | "Opt-in. Writes into `.claude\commands\`. I'll leave this for the Q&A." |
| JIRA PAT | Skip | "In real use you paste your JIRA PAT here. It goes into `local.config` at the workspace root — gitignored, never committed, never leaves the machine." |
| GitLab PAT | Skip | "Same — stored locally, used by the skills to push branches and create MRs." |
| Confluence PAT | Skip | "Optional. Only needed if you want `/wrap-up` to auto-publish Confluence docs." |

> 🎤 **After wizard completes:** "Done. That took about 30 seconds. Let me open the workspace and show what was created."

Open `~\sdd-dummy\ai\pod-info.md`:

```
POD Namespace: demo/dummy-pod-group/dummy-pod
Domain: demo
POD Group: dummy-pod-group
POD Name: dummy-pod
Git Parent URL: https://gitlab.dell.com/999999/dummy-pod

# === Essential POD Information ===
JIRA Project: POD Training (PODT)
JIRA Project Link: https://jira.dell.com/projects/PODT
```

> 🎤 **Say:** "Placeholder values — the file has the right shape but no real data. Notice the Git Parent URL: even in dummy mode it follows the flat CMDB-rooted format. Push defaults to No, so if a developer accidentally runs `/execute` in dummy mode, nothing goes to GitLab. This is the safe sandbox."

Then show `.windsurf\workflows\` — the 7 skill files are already there.

> 🎤 **Say:** "The skills are already installed. A developer who pulls this workspace into Windsurf gets the full workflow panel immediately — no individual setup."

> ⚠️ **If asked "why not just put skills in Windsurf globally?"** "The skills are workspace-scoped on purpose. Different PODs may customise them — the user-editable copies live in `ai\harness\skills\` and are version-controlled. Workspace scope means every developer on the team gets the same version."

---

### Step 2b · Switch to real POD workspace

> 🎤 **Say:** "Now let me show you what this looks like when you enter a real POD slug. I ran the same wizard yesterday with our actual POD — same prompts, same flow — and here's what came out."

```powershell
# Switch to the pre-set-up real workspace
cd ~\ssd-real
```

Open `~\ssd-real\ai\pod-info.md` and read the key fields aloud — attendees can't see a side-by-side comparison on a webinar, so call out the contrast verbally:

```
POD Namespace: infrastructure/ase/dlf/cloud-licensing-solution
Domain: Infrastructure Solutions
POD Group: Digital Licensing & Fulfillment
POD Name: Connected Licensing Integrated Platform
Git Parent URL: https://gitlab.dell.com/APP-001/clip
Captured At: 2026-05-11T10:00:00Z
Captured By: Ponaka, Kamalakar

# === Essential POD Information ===
POD ID: 142
POD Status: Active
JIRA Project: SCLP - Connected Licensing Integrated Platform (SCLP)
JIRA Project Link: https://jira.dell.com/projects/SCLP
POD Members: john.doe@dell.com, jane.smith@dell.com, bob.wilson@dell.com
POD Lead: john.doe@dell.com
Guild: Infrastructure Solutions Guild
```

> 🎤 **Say:** "One slug, one API call — and the kit knows your JIRA project, your GitLab group rooted at the CMDB ID, who's on the team, who the POD lead is. Every AI skill that runs in this workspace reads this file first. It doesn't need to be told where to push, which project to open in JIRA, or who to notify. It already knows."

> 🎤 **Say:** "Look at the Git Parent URL line — `gitlab.dell.com/APP-001/clip`. That's the flat CMDB-rooted URL we talked about, and it came directly from the Taxonomy API. No manual URL construction."

Show the workspace tree:

```
~\ssd-real\
├── local.config           ← PATs (gitignored, per-developer)
├── AGENTS.md              ← AI workspace context
├── LEARNINGS.md           ← Developer memory (not team-shared)
├── ai\                    ← Separate Git repo — the brain
│   ├── pod-info.md        ← Real POD identity from Taxonomy API
│   ├── harness\
│   │   ├── CONSTITUTION.md  ← Governance rules (POD lead edits this)
│   │   ├── AGENTS.md        ← Workspace context master
│   │   └── skills\          ← User-editable skill copies
│   ├── raw\               ← Human domain docs
│   ├── knowledge\         ← AI-generated specs (populated next)
│   └── specs\             ← Per-feature artifacts
├── clip-app\              ← Cloned from GitLab automatically
├── clip-integrations\
├── dlfportal\
├── .windsurf\workflows\   ← Skills installed here
└── .devin\skills\         ← Same skills, Devin format
```

> 🎤 **Say:** "The source repos are already cloned. A new developer joins the POD — they clone this workspace, add their personal PATs to `local.config`, and they're ready. No individual setup, no repeated wizard. The POD Lead runs `sdd-install` once and the whole team benefits."

---

## Part 1b — POD Lead Story · Real POD (Knowledge Base) · 0:10–0:17

> Continuing in `~\ssd-real`.

### Step 3 · Add domain docs to `ai\raw\`

> 🎤 **Say:** "Before the AI can help deliver features, it needs to understand your domain. You drop your existing documentation into `ai\raw\` — any format, any shape. ADRs, Confluence exports, Swagger files, design docs, onboarding guides, architecture diagrams. The AI reads all of it."

For the demo, show the pre-loaded docs already in `~\ssd-real\ai\raw\`:

```
ai\raw\DL_GUIDE.md          ← Domain concepts, entitlement types
ai\raw\DL_DATA_MODEL.md     ← Business entity definitions
ai\raw\DL_FLOWS.md          ← Registration flow traces
ai\raw\DELEGATED-GUIDE.MD   ← On-premise DLS architecture
```

> 🎤 **Say:** "These four files are the entire domain knowledge for a cloud licensing platform — product models, entitlements, registration flows, on-premise delegated server. I didn't clean them up or reformat them for the AI. I just dropped them in. That's all it takes."

> 🎤 **Audience engagement:** "What kinds of docs does your team have? Architecture decision records? Figma exports? Old requirements docs? All of that is valid input here."

---

### Step 4 · Generate the knowledge base

Open **Windsurf** at `~\ssd-real`. In the Windsurf AI panel run:

```
/create-pod-knowledge
```

Or in **Devin CLI**:

```bash
devin run create-pod-knowledge
```

> 🎤 **Say:** "This is a one-time step per project — the POD Lead runs it, not every developer. It takes 5 to 10 minutes. What it's doing: reading everything in `ai\raw\`, walking the codebase of every cloned project, and synthesising 8 structured specs. For the demo I already ran this — let me show you the output."

> ⚠️ **If running live:** Let it run, narrate the terminal output. "It's walking `clip-app` right now — 13 Maven modules, it's reading the route definitions, the handler chain, the data model. It's doing in 5 minutes what a new developer would take a week to absorb."

Open `ai\knowledge\` and walk through:

```
ai\knowledge\
├── POD.md              ← Open this first — 10 min executive read
├── functional-spec.md
├── technical-spec.md
├── data-model-spec.md
├── api-spec.md
├── integration-spec.md
├── security-spec.md
├── deployment-spec.md
├── nfr-spec.md
├── flows\              ← Mermaid diagrams per business flow
└── data\              ← Sample JSON payloads
```

> 🎤 **Open POD.md and read the first paragraph out loud.** "This is a 10-minute read that tells you — and the AI — exactly what this platform does, what its core entities are, what the primary flows are, and how the pieces fit together. Every skill that runs after this reads this file before it writes a single line."

Open `AGENTS.md` at the workspace root — scroll to the project table and tech stack section.

> 🎤 **Say:** "AGENTS.md is the AI's context file for the workspace. It lists every project, every tech stack, the Git branching convention, the build commands, the commit message format. When `/execute` creates a branch, it knows to follow `develop-{JIRA-ID}`. When it commits, it knows the format is `JIRA#PODT-9; description`. It got all of this from the codebase — not from config, not from docs."

> 🎤 **Transition:** "Setup is done. The POD Lead commits the `ai\` repo and shares the workspace. Every developer on the team now has this context available from day one. Let me switch to the developer perspective."

---

## Part 2 — Developer Story (Feature Delivery) · 0:17–0:30

> 🎤 **Opening (30 sec):** "I'm now a developer. I have a JIRA Spec ticket assigned to me. My job is to run one command and come back three times to approve. That's it. Let me show you what happens in between."

---

### Step 5 · The JIRA Spec ticket

Open the JIRA ticket in a browser tab. Point out:

- Issue type: **Spec** (the new bottom level of the hierarchy)
- Parent: the **Feature** it belongs to
- Description: the business requirement in plain language
- No implementation details — just what needs to happen, not how

> 🎤 **Say:** "This is a Spec issue. The Feature Lead created it under a Feature and decomposed the scope; the POD Lead reviewed and refined it. As a developer, I don't write specs, plans, or documentation — I hand this ticket ID to the AI and review what it produces."

---

### Step 6 · Run the full SDLC workflow

In the Windsurf AI panel:

```
/sdlc PODT-9
```

> 🎤 **Say:** "One command. The `/sdlc` orchestrator chains all four skills — create-specs, create-plan, execute, wrap-up — with three checkpoints where it stops and waits for me. Between checkpoints it runs autonomously."

> ⚠️ **If running live:** Let `create-specs` run and narrate. "It's fetching the JIRA ticket now. It's also reading the parent Feature for broader context. Now it's cross-referencing the knowledge base — the functional spec, the API spec, the data model. It knows the existing patterns, so it won't propose an approach that contradicts the architecture."

---

### Checkpoint 1 — Review the spec

The AI stops and presents `ai\specs\PODT-9\specs.md`.

Open it and walk through the key sections:

- **Functional Requirements** (FR-01, FR-02 …) — what the system must do
- **Acceptance Criteria** — user-focused, tech-agnostic, measurable
- **Out-of-scope** — explicit boundaries
- **Open questions** — any ambiguities the AI couldn't resolve from the ticket + knowledge base

> 🎤 **Say:** "Before showing this to me, the AI ran a three-iteration self-answering loop. It asked itself questions, tried to answer them from the JIRA ticket, the knowledge base, and the codebase, and only escalated the top five it genuinely couldn't resolve. Typically by the time I see this, the spec is 90% there and I'm making minor adjustments."

> 🎤 **Say:** "Scroll down to the Acceptance Criteria section — notice these are tech-agnostic. No database names, no framework terms, no infra metrics. The AI enforces this — if it wrote 'response stored in MongoDB', it would catch that in its own quality check and rewrite it. Acceptance criteria are about user outcomes, not implementation choices."

Show the example at `dell-sdd\example-workspace\ai\specs\EXAMPLE-101\specs.md` if not running live.

> 🎤 **Demonstrate approval:** "I've read it, it looks right. I type 'Looks good, continue' and the AI moves to planning."

> ⚠️ **If audience asks "what if the spec is wrong?"** "Edit `specs.md` directly — it's just a markdown file. Tell the AI to continue after your edits. Everything downstream respects what's in the spec, not the original JIRA ticket."

---

### Checkpoint 2 — Review the implementation plan

```
/create-plan PODT-9
```

Open `ai\specs\PODT-9\plan.md`. Walk through:

- **File-level changes** — exact files to create or modify, not vague module names
- **TDD order** — tests listed before the implementation they cover
- **Traceability matrix** — FR-01 → `clip-app/clip-entitlement/...Handler.java` → `EntitlementHandlerTest.java`
- **CONSTITUTION check** — any flags against the team's architectural rules

> 🎤 **Say:** "The plan is traceable all the way through. Every functional requirement maps to a specific file change. Every acceptance criterion maps to a specific test case. If those links don't hold, the AI won't show me the plan — it blocks and fixes them first."

> 🎤 **Say:** "Look at the TDD order section — tests come first. The AI writes failing tests before it writes a single line of implementation. This isn't optional — it's baked into how `/execute` works."

> 🎤 **Say:** "Further down you'll see the CONSTITUTION check. The POD Lead can write a CONSTITUTION.md — the architectural rulebook. Module boundaries, technology choices, quality gates, patterns the team has agreed on. The plan is validated against it. Hard violations block. Soft mismatches are logged as warnings. This is how the team's architectural decisions stay consistent across every AI-delivered feature."

Show the example at `dell-sdd\example-workspace\ai\specs\EXAMPLE-101\plan.md`.

> 🎤 **Demonstrate approval:** "Plan looks good. I say 'execute' and step away."

---

### Step 7 · Execute — fully autonomous

```
/execute PODT-9
```

Walk through what happens with no user input:

| Phase | What the AI does | Say |
|-------|-----------------|-----|
| Pre-flight | Scans for unresolved questions — blocks if any | "Hard gate — if anything is ambiguous, it stops here, not mid-implementation." |
| Prep | Creates `develop-PODT-9` branch across all impacted repos + `ai\` | "One branch per impacted project. The `ai\` repo gets a feature branch too — specs and plans are version-controlled alongside the code." |
| JIRA | Attaches specs to the ticket, transitions to "In Development" | "JIRA stays current without anyone touching it manually." |
| TDD | Writes tests (red) → implements (green) → refactors | "It runs the tests, watches them fail, implements until they pass, then refactors. The build output is in the terminal." |
| Build | `mvn clean install` / `npm run build` per project | "Full build for every impacted project, not just the changed module." |
| Self-review | Validates implementation against spec and plan | "Before pushing, it checks its own work against the spec. If something doesn't line up, it fixes it." |
| Push + MRs | Commits, pushes, opens GitLab MRs | "One MR per impacted source project, plus one for the `ai\` repo." |
| change-summary | Writes `ai\specs\PODT-9\change-summary.md` | "MR links, traceability matrix, task checklist — all in one place." |

> 🎤 **While it runs:** "Between checkpoint 2 and 3, there's nothing for me to do. I can review another ticket, take a meeting, have lunch. The AI is implementing, building, testing, and pushing."

Open the GitLab MR in the browser when it appears.

> 🎤 **Say:** "There's the MR — already open, already targeting `develop`, already linked to the JIRA ticket in the title. The description has the change summary, the traceability matrix, and the task checklist. The reviewer has everything they need without asking the developer for context."

---

### Checkpoint 3 — Human code review

> 🎤 **Say:** "This is the only checkpoint that involves another human. A teammate reviews the MR in GitLab and adds inline comments. When that's done, I re-run execute."

```
/execute PODT-9
```

> 🎤 **Say:** "On re-entry, `/execute` detects there are unresolved MR comments. It fetches each one, analyses it, implements the fix or replies with a justification for why the change isn't needed, builds, and pushes. The MR thread is updated automatically. The reviewer just needs to hit Approve."

> ⚠️ **If asked "does the AI just blindly apply every comment?"** "No — it analyses each comment in the context of the spec and plan. If a reviewer asks for a change that would violate an acceptance criterion or break the traceability matrix, the AI replies explaining the conflict rather than making the change."

---

### Step 8 · Wrap up after merge

After the reviewer merges the MR:

```
/wrap-up PODT-9
```

> 🎤 **Say:** "After the MR merges, `/wrap-up` handles everything you'd normally forget. It verifies the MR is actually merged, deletes the feature branches, posts a coding summary as a JIRA comment, adds the `AI-Delivered` label, transitions the issue to Complete, and publishes Confluence documentation — which is mandatory under the AI Native SDLC taxonomy. No manual doc writing."

> 🎤 **Pause.** "Let that land for a second. From JIRA ticket to merged code to Confluence docs, with three human review points. That's the entire feature lifecycle."

---

### Step 9 (POD Lead) · Periodic knowledge update

> 🎤 **Say:** "One more thing — the knowledge base gets smarter over time. After a sprint, the POD Lead runs:"

```
/update-knowledge
```

> 🎤 **Say:** "This integrates every delivered Spec back into `ai\knowledge\`. The next time a developer runs `/sdlc`, the AI already knows about everything that shipped last sprint. Patterns that worked, data model changes that were made, API endpoints that were added. The knowledge compounds sprint over sprint."

---

## Devin CLI — Same Skills, Different Surface

> 🎤 **Say:** "Everything I just showed you in Windsurf works identically with the Devin CLI. Same skill logic, different surface."

```bash
devin run sdlc --args "PODT-9"

# Or individual steps
devin run create-specs --args "PODT-9"
devin run create-plan  --args "PODT-9"
devin run execute      --args "PODT-9"
devin run wrap-up      --args "PODT-9"
```

> 🎤 **Say:** "Teams can mix. Some developers prefer the Windsurf workflow panel; others prefer the terminal. The POD Starter Kit installs both surfaces from the same setup. There's no configuration difference — the skills are the same files."

---

## Closing

> 🎤 **Closing (60 sec):** "Let me summarise what you saw. One `sdd-install` command scaffolds a fully wired workspace — source repos cloned, IDE skills installed, JIRA and GitLab wired up via CMDB ID. One `create-pod-knowledge` run gives the AI a complete understanding of your domain and codebase. And from there, every developer on the team runs a single command per feature, reviews three things, and ships. The AI handles specs, planning, implementation, testing, Git operations, JIRA updates, and documentation. You stay in the loop at the decisions that matter — scope, architecture, code quality."

> 🎤 **Hand off:** "That's the full flow. I can see some questions already in the chat — let me work through those now. If you think of something after the session, the recording will be shared and there's a link in the chat to the migration Confluence page and the POD Taxonomy tool. For ongoing support, email the team at **ai.native.sdlc.support@dell.com**."

---

## Common Questions

**Q: What's the difference between `dummy-pod` and a real POD slug?**  
`dummy-pod` skips the Taxonomy API, creates placeholder `pod-info.md`, doesn't clone repos, and defaults push to No. Use it for learning, demos without credentials, or experimentation before a POD is registered. A real slug retrieves your actual CMDB ID, JIRA project, Git URL, and team members, clones your repos, and sets push defaults to Yes.

**Q: Do developers need to run `sdd-install` too?**  
No. Only the POD Lead runs setup. The workspace including the `ai\` repo and IDE integrations is shared via Git. Developers clone the workspace, add their personal PATs to `local.config`, and they're ready.

**Q: Can I edit the skills?**  
Yes — user-editable copies live in `ai\harness\skills\`. Changes there are version-controlled in the `ai\` repo and shared with the team. Re-run `build.py` to push changes into the IDE integration files.

**Q: What if the AI produces a wrong spec?**  
Checkpoint 1 is for this. Edit `specs.md` directly — it's a markdown file — and tell the AI to continue. Everything downstream respects the edited spec, not the original JIRA ticket.

**Q: What does CONSTITUTION.md do?**  
The POD Lead writes the architectural rulebook — tech choices, module boundaries, quality gates, coding patterns the team has agreed on. `/create-plan` validates every plan against it. Hard violations block plan generation. Soft mismatches are logged as warnings.

**Q: Is Windsurf required?**  
No. Devin CLI is the other primary surface. Cursor and Claude Code are opt-in. The skills are plain Markdown — any IDE with AI workflow support can use them.

**Q: We're still on SpecKit — how do we migrate?**  
Two steps: run `sdd-migrate.ps1 -LegacyWorkspace <old> -NewWorkspace <new>` to migrate the workspace structure (specs, governance, rules all carry over automatically), then open the new workspace in Windsurf and run `/migrate-app-knowledge` to regenerate the knowledge base. Full details at the [Migration Strategy Confluence page](https://confluence.dell.com/spaces/CSB/pages/1316519938/Mirgation+Strategy+Spec-Kit+to+pod-starter-kit).

**Q: What happens to existing workspaces when GitLab migrates to the CMDB-ID structure?**  
Update `pod-info.md` Git Parent URL to the new flat format and re-point your repo remotes. The easiest path is re-running `sdd-install` against the migrated workspace — it will write the correct URL from the Taxonomy API.

**Q: What level of JIRA issue does `/sdlc` target?**  
A **Spec** — the new bottom level of the hierarchy (Program → Feature → Spec). The kit also reads the parent Feature issue for broader context when generating `specs.md`. Don't run `/sdlc` against a Feature or Program — the granularity is wrong and the spec will be too broad to implement cleanly.

---

## Support

**Support DL:** ai.native.sdlc.support@dell.com
