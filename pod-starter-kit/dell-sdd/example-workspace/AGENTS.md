# AGENTS.md — Example POD Workspace Context

> This file provides workspace context for AI coding agents. It is auto-generated
> by the `create-pod-knowledge` skill and should be kept up to date as the codebase evolves.
>
> **This is a template example.** Replace the content below with your POD's actual
> projects, tech stack, domain concepts, and conventions after running `/create-pod-knowledge`.

---

## 1. Workspace Overview

**Application**: Greeting Service — a simple multi-project demo comprising a Java REST API, a Node.js web server, and a C# CLI tool.

**Owner**: Example POD, Example Domain.

**Workspace structure**: This is a **multi-project workspace** — the workspace root is NOT itself a Git repository. Each subdirectory is an independent Git project with its own remote. The `ai/` directory is a dedicated Git repository serving as the AI knowledge base.

---

## 2. Projects

| # | Project | Path | Language | Framework | Build Tool | Description |
|---|---------|------|----------|-----------|------------|-------------|
| 1 | **hello-world-java** | `hello-world-java/` | Java 17 | — | Maven | Core greeting API — REST service returning greeting messages. |
| 2 | **hello-world-nodejs** | `hello-world-nodejs/` | JavaScript | Node.js | npm | Greeting web server — lightweight HTTP frontend. |
| 3 | **hello-world-csharp** | `hello-world-csharp/` | C# | .NET 8.0 | dotnet | Greeting CLI tool — command-line client for the greeting API. |
| 4 | **ai** | `ai/` | — | — | — | AI knowledge base — specs, plans, change summaries, domain docs. See §9. |

---

## 3. Technology Stack

| Layer | Technology | Version | Used By |
|-------|-----------|---------|---------|
| Language | Java | 17 | hello-world-java |
| Language | JavaScript | ES2022 | hello-world-nodejs |
| Language | C# | 12 | hello-world-csharp |
| Runtime | Node.js | 20+ | hello-world-nodejs |
| Runtime | .NET | 8.0 | hello-world-csharp |
| Build | Apache Maven | 3.9+ | hello-world-java |
| Build | npm | 10+ | hello-world-nodejs |
| Build | dotnet CLI | 8.0+ | hello-world-csharp |
| CI/CD | GitLab CI | — | All projects |

---

## 4. Architecture & Key Patterns

- **Multi-Project Workspace**: Each service is an independent Git repo, loosely coupled.
- **Simple REST**: hello-world-java exposes a greeting endpoint.
- **Console App**: hello-world-csharp demonstrates a standalone CLI.
- **Minimal Dependencies**: Each project is intentionally small to serve as a clear template.

### Cross-Project Dependencies

```
hello-world-nodejs (web frontend) ──HTTP──> hello-world-java (API)
hello-world-csharp (CLI tool)     ──HTTP──> hello-world-java (API)
```

---

## 5. Build & Test

| # | Project | Command | Working Dir | Notes |
|---|---------|---------|-------------|-------|
| 1 | hello-world-java | `mvn clean package` | `hello-world-java/` | Produces executable JAR |
| 2 | hello-world-nodejs | `npm install && npm start` | `hello-world-nodejs/` | Runs on default port |
| 3 | hello-world-csharp | `dotnet build` | `hello-world-csharp/` | .NET 8.0 required |

---

## 6. Git & Branching Conventions

- **Remote host**: `gitlab.dell.com`
- **Remote URL pattern**: `git@gitlab.dell.com:{CMDB_ID}/{POD_SLUG}/{project}.git`
- **Primary branch**: `main`
- **Feature branch pattern**: `develop-{JIRA_ISSUE_ID}` (e.g., `develop-EXAMPLE-101`)
- **Commit message format**: `JIRA#{ISSUE_ID}; {description}`
- **MR target**: Feature branches merge into `main`
- **MR title format**: `JIRA#{ISSUE_ID}; {description}`

---

## 7. AI Skills (SDLC Workflows)

| # | Skill | Command | Description |
|---|-------|---------|-------------|
| 1 | **sdlc** | `/sdlc <JIRA-ID>` | End-to-end SDLC orchestrator — drives a feature from analysis through implementation, review, and closure. |
| 2 | **create-pod-knowledge** | `/create-pod-knowledge` | Generate POD specification documents by analyzing the workspace codebase. Produces AGENTS.md and LEARNINGS.md. |
| 3 | **create-specs** | `/create-specs <JIRA-ID>` | Generate a feature spec (`specs.md`) from a JIRA issue. |
| 4 | **create-plan** | `/create-plan <JIRA-ID>` | Generate an implementation plan (`plan.md`) from an existing feature spec. |
| 5 | **execute** | `/execute <JIRA-ID>` | Implement the feature, push code, create MRs, and fix review comments. |
| 6 | **wrap-up** | `/wrap-up <JIRA-ID>` | Post-merge cleanup — delete branches, publish Confluence docs, close JIRA. |
| 7 | **update-knowledge** | `/update-knowledge` | Batch-integrate delivered features into knowledge specs. |

### Typical Feature Lifecycle

```
JIRA Issue (Proposed)
  |
  +- /create-specs --> ai/specs/{ID}/specs.md
  |
  +- /create-plan --> ai/specs/{ID}/plan.md
  |
  +- /execute --> Code + Tests + MR + change-summary.md
  |
  +- /wrap-up --> Branch cleanup + Confluence + JIRA Complete
  |
  +- /update-knowledge --> Update ai/knowledge/ specs
```

---

## 8. Domain Quick Reference

| Concept | Definition |
|---------|-----------|
| **Greeting** | A message returned by the API, optionally personalized with a name. |
| **Locale** | Language/region code (e.g., `en-US`, `fr-FR`) controlling the greeting language. |
| **Template** | A greeting format string (e.g., `"Hello, {name}!"`) stored per locale. |

---

## 9. Knowledge Base — LLM Wiki

The `ai/` repository is a structured knowledge base that serves as the AI's long-term memory.

### Wiki Structure

| Directory | Purpose | When to Read |
|-----------|---------|-------------|
| `ai/raw/` | Human-authored domain documentation | For business context and domain understanding |
| `ai/knowledge/` | AI-generated specs (functional, technical, data model) | Before any code change |
| `ai/specs/{ISSUE_ID}/` | Per-feature specs, plans, change summaries | Before implementing related features |

### Quick Reference — Which Spec to Consult

| Task | Read First |
|------|-----------|
| Adding an API endpoint | `technical-spec.md` |
| Adding a data field | `data-model-spec.md` |
| Understanding business rules | `functional-spec.md` + `ai/raw/DOMAIN_GUIDE.md` |
| Implementing a JIRA feature | `ai/specs/{ISSUE_ID}/specs.md` + `plan.md` |
| Understanding a past change | `ai/specs/{ISSUE_ID}/change-summary.md` |

---

## 10. Per-Feature Spec Conventions

Each JIRA issue has a directory under `ai/specs/{ISSUE_ID}/` containing:

| File | Purpose | Generated By |
|------|---------|-------------|
| `specs.md` | Feature specification — FRs, ACs, scope, impacted areas | `/create-specs` |
| `plan.md` | Implementation plan — TDD steps, file changes, traceability | `/create-plan` |
| `change-summary.md` | Post-implementation summary — files modified, test results, MR links | `/execute` |

---

## 11. LEARNINGS.md — Secondary Memory

Maintain a `LEARNINGS.md` file as a persistent secondary memory store for AI agents. This file lives at the **workspace root** (alongside `AGENTS.md`).

### Update Rules

- **After every significant interaction**, append new learnings to the appropriate section.
- Create sections as needed (e.g., "Codebase Patterns", "Gotchas & Pitfalls", "User Preferences").
- Do **not** overwrite or compact existing content — only append new entries.

### What to Record

| Category | Examples |
|----------|---------|
| **Codebase patterns** | "Java project uses Maven JAR plugin for packaging" |
| **Gotchas** | "Node.js project has no test script configured yet" |
| **User preferences** | "User prefers TDD approach" |
| **Feature learnings** | "Greeting endpoint returns 400 if locale is not supported" |
| **Build/deploy** | "Must run `mvn package` from project root, not parent" |

---

## 12. Security & Safety

- **Never** commit secrets, tokens, API keys, or credentials to any repository.
- `local.config` at the workspace root contains PATs for JIRA, GitLab, and Confluence — **never read or display these values**.
- Before performing destructive operations, always confirm with the user.

---

## 13. Configuration Reference

**Credentials file**: `local.config` (workspace root) — contains:
- `JIRA_PAT` — JIRA API authentication
- `GIT_PAT` — GitLab API authentication
- `CONFLUENCE_PAT` — Confluence API authentication
- `JIRA_BASE_URL` — JIRA instance base URL
- `CONFLUENCE_BASE_URL` — Confluence instance base URL

**JIRA project**: `EXAMPLE` (issue prefix: `EXAMPLE-XXX`)

**GitLab group**: `{CMDB_ID}/{POD_SLUG}/`
