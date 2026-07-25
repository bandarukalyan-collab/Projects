# POD Starter Kit — Project Context

## What this project is

`pod-starter-kit` is the **AI-native SDLC harness** for Dell teams, also called **SDD (Spec-Driven Development)**. It lets AI agents autonomously deliver features from a JIRA Spec issue to merged code with three human review checkpoints.

It evolved from **GitHub SpecKit** and is now the Dell standard, integrated with CMDB, JIRA, GitLab, Confluence, and Snyk.

## Key contacts
- **Owner / POD Lead:** Kamalakar Ponaka
- **Repo:** `https://gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit`
- **Support DL:** ai.native.sdlc.support@dell.com

## Repo structure
```
dell-sdd/
  skills/           ← canonical skill source (Markdown)
  docs/             ← documentation, including DEMO-GUIDE.md
  docs/webinar/     ← Training Tuesday webinar deck (POD-Starter-Kit-Webinar.pptx)
  example-workspace/← reference workspace artifacts
  build.py          ← compiles skills → Windsurf / Devin / Claude Code
  setup.py          ← sdd-install wizard
sdd_install_kit/    ← Python package (entry point: sdd-install CLI)
hooks_installer/    ← Windsurf safety hooks
```

## Workspace structure (created by sdd-install)
```
sdd-workspace/                   ← Local directory (GitLab repo: ai-workspace.git)
├── .git/
├── .gitmodules                  ← Tracks source project submodules
├── .windsurf/                   ← Windsurf skills (installed by sdd-install)
├── .devin/                      ← Devin skills (installed by sdd-install)
├── local.config                 ← PATs (gitignored)
├── AGENTS.md                    ← Mirror of ai/harness/AGENTS.md
├── LEARNINGS.md                 ← Developer-local copy
├── ai/                          ← Folder for POD knowledge (part of ai-workspace repo)
│   ├── pod-info.md
│   ├── harness/
│   │   ├── CONSTITUTION.md
│   │   ├── AGENTS.md
│   │   ├── LEARNINGS.md
│   │   └── skills/
│   ├── raw/
│   ├── knowledge/
│   └── specs/
├── project-alpha/               ← Git submodule (source code)
├── project-beta/                ← Git submodule (source code)
└── project-gamma/               ← Git submodule (source code)
```

**Note:** Local directory is `sdd-workspace`, GitLab repository is `ai-workspace.git`

## Demo guide
The 30-minute demo guide for POD Leads and AI Native Developers lives at:
**`dell-sdd/docs/DEMO-GUIDE.md`**

It covers:
1. Structural changes context (JIRA 6→3, Git CMDB-ID restructure)
2. SpecKit → Dell AI SDD harness migration (2-step: `sdd-migrate.ps1` + `/migrate-app-knowledge`)
3. Part 1a (0:05–0:10): live dummy-pod wizard
4. Part 1b (0:10–0:17): real POD workspace contrast
5. Part 2 (0:17–0:30): developer feature delivery (JIRA Spec → 3 checkpoints → wrap-up)
6. Speaker notes, timing cues, Q&A throughout

**Demo Spec ID:** `PODT-9` (POD Training JIRA project — https://jira.dell.com/projects/PODT/issues/PODT-9)

## Structural decisions (important for all future work)

### JIRA hierarchy: 3 levels (was 6)
```
Program → Feature → Spec
```
`/sdlc` targets a **Spec** issue.
- **Feature Lead** — creates Features in JIRA and decomposes them into Specs (high-level scope and acceptance criteria)
- **POD Lead** — refines and reviews each Spec before developer handoff; owns `CONSTITUTION.md`, `AGENTS.md`, and runs `sdd-install`
- **Developer** — runs `/sdlc <SPEC-ID>` and reviews at 3 checkpoints

The kit fetches the Spec issue + its parent Feature for context when generating `specs.md`.

### Git structure: flat CMDB-ID root with ai-workspace repo
```
gitlab.dell.com/{CMDB-ID}/{POD-SLUG}/ai-workspace.git
```
- Domain, POD group, and POD names change with reorgs — every URL change breaks include services and config servers
- CMDB IDs have proper Application Lifecycle Management in ServiceNow; all audit and compliance activities are tied to them
- `sdd-install` reads `appId` from the Taxonomy API and writes the flat URL to `pod-info.md` automatically — developers never type a CMDB ID
- The `ai-workspace` repository contains:
  - `ai/` folder with POD knowledge, governance, and specs
  - Source project submodules at the same level as `ai/`
  - Platform-specific skill installations (`.windsurf/`, `.devin/`, etc.)

### Migration from SpecKit
- **Milestone 1:** `.\sdd-migrate.ps1 -LegacyWorkspace <old> -NewWorkspace <new>` — preserves specs, governance, rules; re-clones repos fresh
- **Milestone 2:** `/migrate-app-knowledge` in Windsurf → confirm `proceed with create-app-knowledge`
- Confluence doc: https://confluence.dell.com/spaces/CSB/pages/1316519938/Mirgation+Strategy+Spec-Kit+to+pod-starter-kit

### dummy-pod (demo/training mode)
- POD slug: `dummy-pod` — skips Taxonomy API, no repos cloned, push defaults to No
- JIRA project: `PODT` (POD Training), CMDB ID: `999999`
- Git Parent URL: `https://gitlab.dell.com/999999/dummy-pod`
- Default workspace: `~\sdd-dummy`

## 7 skills
| Command | Purpose |
|---------|---------|
| `/sdlc <SPEC-ID>` | End-to-end orchestrator (chains all 4 below) |
| `/create-pod-knowledge` | One-time: generates `ai/knowledge/` from `ai/raw/` + codebase |
| `/create-specs <SPEC-ID>` | Generates `specs.md` from JIRA issue + knowledge base |
| `/create-plan <SPEC-ID>` | Generates `plan.md` (TDD order, traceability, CONSTITUTION check) |
| `/execute <SPEC-ID>` | TDD implementation, push, MR creation, review comment fixes |
| `/wrap-up <SPEC-ID>` | Verify merged, update JIRA, publish Confluence docs |
| `/update-knowledge` | POD Lead: integrate delivered specs + new raw docs into knowledge base |

## Two demo workspace paths (Windows)
- `~\sdd-dummy` — dummy-pod workspace (no real credentials)
- `~\ssd-real` — real POD workspace (pre-set-up for demo)

## Platform targets
- **Windsurf** (primary) — `.windsurf/workflows/` — command: `/<skill>` (e.g. `/sdlc`, `/wrap-up`)
- **Devin** (primary) — `.devin/skills/` — command: `devin run <skill>`
- **Claude Code** (opt-in) — `.claude/commands/`

## CONSTITUTION.md highlights
- 11 core principles — Principle 11: agents must not invent or assume knowledge; gaps must be surfaced as clarifying questions
- 13 quality gates — all blocking before MR merge
- 3 human review checkpoints: (1) POD Lead reviews `specs.md`, (2) Developer reviews `plan.md`, (3) Team member reviews GitLab MR
