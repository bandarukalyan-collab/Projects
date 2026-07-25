# create-specs

> Generate a comprehensive specs.md for a JIRA issue by fetching its content and cross-referencing the project codebase and existing specs.

---

## Purpose

This workflow takes a JIRA issue ID, pulls the full issue details from JIRA (summary, description, acceptance criteria, etc.), analyses the codebase against existing POD knowledge, and produces a self-contained `specs.md` under `ai/specs/{ISSUE_ID}/`. The generated spec serves as the single source of truth for implementing the feature.

---

## Prerequisites

- `local.config` at the workspace root contains `JIRA_PAT` and `JIRA_BASE_URL` for JIRA REST API authentication.
- POD knowledge exist under `ai/knowledge/` (functional-spec.md, technical-spec.md, data-model-spec.md, api-spec.md, flows/).
- The workspace codebase is checked out and up to date.

---

## Workflow Steps

### Step 1 — Obtain JIRA Issue ID

If the JIRA issue ID (e.g., `PROJECT-1234`) was **not** provided as input, prompt the user for it before proceeding. The issue ID is required for all subsequent steps.

### Step 2 — Fetch JIRA Issue

**Primary Method: Use MCP Tool**

Fetch the issue using the JIRA MCP tool:

```
mcp2_jira_get_issue
  issue_key: {ISSUE_ID}
  fields: summary,description,issuetype,priority,labels,components
```

**Extract the following fields from the MCP response:**

| Field | Response Path | Notes |
|---|---|---|
| Summary | `summary` | Issue title |
| Description | `description` | Full body text (may contain wiki/markdown) |
| Acceptance Criteria | *Not available via MCP* | Use curl fallback for custom fields |
| Issue Type | `issue_type.name` | Story, Bug, Task, Epic, etc. |
| Priority | `priority.name` | Critical, Major, Minor, etc. |
| Labels | `labels[]` | Array of label strings |
| Components | `components[].name` | Array of component names |

**Curl Fallback Method**

Use curl when:
- MCP tool fails (authentication issues, network errors)
- You need custom fields not available via MCP (e.g., Acceptance Criteria)
- MCP server is unavailable

```bash
# Get configuration
AC_CUSTOM_FIELD=$(grep AC_CUSTOM_FIELD "$WORKSPACE_ROOT/local.config" | cut -d= -f2)
AC_CUSTOM_FIELD=${AC_CUSTOM_FIELD:-customfield_10208}

JIRA_PAT=$(grep JIRA_PAT "$WORKSPACE_ROOT/local.config" | cut -d= -f2)
JIRA_BASE_URL=$(grep JIRA_BASE_URL "$WORKSPACE_ROOT/local.config" | cut -d= -f2)

# Fetch all fields including custom fields
curl -s \
  --header "Authorization: Bearer $JIRA_PAT" \
  "${JIRA_BASE_URL}/rest/api/2/issue/{ISSUE_ID}?fields=summary,description,issuetype,priority,labels,components,${AC_CUSTOM_FIELD}"
```

**Field Mapping for Curl Response:**

| Field | Response Path | Notes |
|---|---|---|
| Summary | `fields.summary` | Issue title |
| Description | `fields.description` | Full body text |
| Acceptance Criteria | `fields.${AC_CUSTOM_FIELD}` | Custom field value |
| Issue Type | `fields.issuetype.name` | Story, Bug, Task, Epic, etc. |
| Priority | `fields.priority.name` | Critical, Major, Minor, etc. |
| Labels | `fields.labels[]` | Array of label strings |
| Components | `fields.components[].name` | Array of component names |

**Error handling:** 
- If MCP fails, log the error and proceed with curl fallback
- If curl fails, check PAT token and base URL configuration
- Always attempt MCP first as it handles authentication automatically

**Check for design references:** Scan the JIRA description and acceptance criteria for Figma URLs (e.g., `figma.com/design/...`, `figma.com/file/...`, `figma.com/proto/...`) or references to design mockups/wireframes. Also check JIRA attachments (`fields.attachment[]`) for exported design files (PNG, PDF, SVG). If Figma links are found, fetch and read them to extract UI context — component names, screen layouts, navigation flows, interaction patterns. If the links are not publicly accessible, note them as design references in the feature spec and ask the user to provide exported images. For UI-centric features, design context is critical for accurate acceptance criteria and implementation scope.

### Step 3 — Load Existing POD Knowledge

Read the following POD specification files to build context for the feature:

| File | Purpose |
|---|---|
| `ai/knowledge/functional-spec.md` | High-level functional requirements and business rules |
| `ai/knowledge/technical-spec.md` | Architecture, technology stack, design patterns |
| `ai/knowledge/data-model-spec.md` | Database schemas, entity relationships, field definitions |
| `ai/knowledge/api-spec.md` | REST/gRPC endpoints, request/response contracts |
| `ai/knowledge/flows/*.md` | Detailed process flows (registration, provisioning, etc.) |

If any file is missing, note its absence but continue with the files that are available.

### Step 4 — Analyse Codebase for Context

Cross-reference the JIRA issue description and acceptance criteria against the POD knowledge and source code to identify:

1. **Impacted modules/services** — which projects or modules are affected (consult `AGENTS.md` for project names and module structure).
2. **Impacted endpoints** — REST or gRPC endpoints that will need changes, referencing `api-spec.md`.
3. **Impacted data models** — database tables, entities, or DTOs that are affected, referencing `data-model-spec.md`.
4. **Impacted configuration files** — application properties, feature flags, environment config.
5. **Existing tests** — test classes or test suites that cover the impacted areas and will need updates.
6. **Related flows** — process flows from `ai/knowledge/flows/` that are relevant to the feature.
7. **UI/UX impacts** — if the feature involves UI changes, identify impacted components, pages, routes, and design patterns. Cross-reference any Figma designs found in the JIRA issue or `ai/raw/` with the existing frontend code structure.

Search the codebase using grep/find to locate concrete file paths, class names, and method signatures for each impacted area. Record specific references (file path, class name, line range) rather than vague descriptions.

#### Step 4B — Detect Dell Digital Design (DDS) Tooling

If this feature involves UI changes (detected in Step 4 bullet 7, or the JIRA issue is labelled `ui`/`frontend`/`design`, or acceptance criteria mention screens, components, forms, modals, etc.), check whether the workspace has the DDS AI docs installed.

Scan (workspace root and each project directory):

- `.windsurf/rules/dds-*.md` — framework rule files
- `.windsurf/skills/dds-*/SKILL.md` — DDS documentation skills
- `package.json` devDependencies for any entry starting with `@x-dds-tools/`

If DDS tooling is detected, record:

- `ui_framework` — `angular` | `react` | `vanilla` (from `dds-<framework>.md` or package name)
- `ui_component_specs_installed` — true if `@x-dds-tools/component-specs` is present

Then **load the DDS documentation into context** before continuing:

1. Read the DDS framework rule file — it contains mandatory coding standards.
2. Read `.windsurf/skills/dds-docs/SKILL.md` (or the equivalent framework-specific skill file) — it indexes the component docs, foundations, and patterns available to you.
3. For every UI component mentioned in the JIRA description, acceptance criteria, or Figma designs, locate the matching `components-<component>--docs.md` file and read its documented API, variants, and usage examples.
4. Load the **foundations** documentation (`foundations-*--docs.md`) specifically for:
   - **Typography** — heading/body/caption variants and size steps
   - **Spacing** — margin, padding, and gap scale
   - **Sizing** — component size variants and responsive breakpoints
   - **Color tokens** — semantic tokens for primary/secondary/status states

These DDS inputs are first-class evidence when writing FRs (§4.5), Impacted Areas (§4.8), and NFRs (§4.7) for any UI-touching feature. Record the component names and foundation topics you loaded in Section 4.8 so the plan step can rely on them without re-discovery.

If DDS tooling is **not** detected but the feature is UI-heavy, add an Open Question (§4.9) flagging that the pod has no DDS tooling installed and suggest running the setup wizard with the UI option enabled.

### Step 4A — Recursive Clarification (Self-Answering Loop)

Before generating the spec, perform an iterative clarification pass over all gathered information. The goal is to resolve as many ambiguities as possible **autonomously** by cross-referencing JIRA content, POD knowledge, and codebase evidence — surfacing only genuinely unresolvable questions to the user.

#### Iteration Process

Repeat the following cycle up to **3 iterations** (or until no new questions emerge):

1. **Identify questions** — Review the JIRA description, acceptance criteria, and your codebase analysis findings. List every ambiguity, gap, contradiction, or assumption.

2. **Attempt self-resolution** — For each question, search for answers in:
   - The JIRA description and acceptance criteria (re-read carefully for implicit answers)
   - POD knowledge (`functional-spec.md`, `technical-spec.md`, `data-model-spec.md`, `api-spec.md`)
   - Existing codebase patterns (grep for similar features, read related service methods)
   - Related flow diagrams in `ai/knowledge/flows/`
   - Linked JIRA issues (if `issuelinks` were fetched)

3. **Classify each question** into one of three categories:

   | Category | Definition | Action |
   |---|---|---|
   | **Resolved** | Answer found with evidence (code reference, spec section, JIRA text) | Record the answer and its source. Incorporate into the feature spec as a confirmed requirement or assumption-with-evidence. |
   | **Assumed** | No definitive answer, but a safe default exists based on existing patterns | Record the assumption and reasoning. Mark it in the feature spec's Assumptions section with `[AUTO-RESOLVED]` prefix. |
   | **Open** | Cannot be resolved without human input — multiple valid interpretations exist, or the answer has business implications | Keep as an Open Question in section 4.9. |

4. **Check for new questions** — Did resolving one question reveal new ambiguities? If yes, add them to the list and continue to the next iteration.

#### Convergence Criteria

Stop iterating when:
- No new questions emerged in the last iteration, OR
- All remaining questions are classified as **Open** (genuinely need human input), OR
- 3 iterations have been completed

#### Max Open Questions Cap

After the loop completes, if **more than 5 open questions** remain (genuinely unresolvable by evidence):

1. **Rank all open questions by implementation impact** — prioritise questions where an incorrect assumption would cause rework, data loss, or broken contracts.
2. **Keep the top 5** as Open Questions in section 4.9.
3. **Auto-resolve the remaining questions** using the safest default based on existing patterns, and move them to the Auto-Resolved Assumptions list with an `[AUTO-RESOLVED: OVERFLOW]` prefix and a clear rationale.
4. Log a note in the summary: `{N} lower-priority questions auto-resolved due to the 5-question cap — review the assumptions carefully.`

This cap prevents the user from being overwhelmed with too many questions at review time. The auto-resolved overflow items are clearly marked so the user can override them.

#### Output

After the loop completes, you should have:
- A list of **resolved items** (with evidence) to incorporate into the spec
- A list of **auto-resolved assumptions** (with reasoning) for section 4.9
- A list of **genuinely open questions** (max 5, ranked by impact) for section 4.9

Incorporate all resolved items into the appropriate spec sections (FRs, scope, impacted areas). Mark auto-resolved assumptions clearly so the user can override them during review.

---

### Step 5 — Generate the Feature Spec

Create the output file at:

```
ai/specs/{ISSUE_ID}/specs.md
```

The generated spec **must** contain the following sections in order:

---

#### Section 4.1 — Header

```markdown
# Feature Spec: {ISSUE_ID}

| Field       | Value                              |
|-------------|------------------------------------|
| Issue ID    | {ISSUE_ID}                         |
| Issue Type  | {issuetype.name}                   |
| Priority    | {priority.name}                    |
| Labels      | {comma-separated labels}           |
| Components  | {comma-separated components}       |
| Generated   | {YYYY-MM-DD}                       |
```

---

#### Section 4.2 — Overview

A 2-5 sentence business-level summary of what this feature does and why it matters. Written in plain language for stakeholders. Derived from the JIRA summary and description.

```markdown
## Overview

{2-5 sentence business summary derived from JIRA summary and description. Explain what the feature does, who it impacts, and the business value.}
```

---

#### Section 4.3 — Background & Context

Combine context from:
- The JIRA description (full text)
- Cross-references to existing POD knowledge (cite specific sections)

```markdown
## Background & Context

### JIRA Description

{Full description from JIRA, cleaned up for readability}

### POD Spec References

- **Functional Spec** § {section}: {brief note on relevance}
- **Technical Spec** § {section}: {brief note on relevance}
- **Data Model Spec** § {section}: {brief note on relevance}
- **API Spec** § {section}: {brief note on relevance}
- **Flow**: `flows/{flow-name}.md` — {brief note on relevance}
```

---

#### Section 4.4 — Scope

Two clearly separated bullet lists:

```markdown
## Scope

### In Scope

- {Specific deliverable or behaviour that IS part of this feature}
- {Another in-scope item}

### Out of Scope

- {Specific item that is explicitly NOT part of this feature}
- {Another out-of-scope item}
```

Derive scope from the JIRA description, acceptance criteria, and analysis of what the issue does and does not cover.

---

#### Section 4.5 — Functional Requirements

A numbered requirements table with traceability back to source:

```markdown
## Functional Requirements

| ID    | Requirement                                                      | Source                  |
|-------|------------------------------------------------------------------|-------------------------|
| FR-01 | {Concise requirement statement}                                  | JIRA description        |
| FR-02 | {Concise requirement statement}                                  | Acceptance criteria     |
| FR-03 | {Concise requirement statement}                                  | functional-spec.md § X  |
```

Each requirement should be:
- Atomic (one testable behaviour per row)
- Written as a "shall" statement where possible
- Traceable to a specific source (JIRA field, linked issue, or POD spec section)

---

#### Section 4.6 — Acceptance Criteria

Reproduce the acceptance criteria **verbatim** from the configured acceptance criteria field. If the criteria are in Gherkin format (`Given / When / Then`), preserve that format exactly:

```markdown
## Acceptance Criteria

> Copied verbatim from JIRA {ISSUE_ID} — acceptance criteria field

{Paste the raw acceptance criteria here, preserving Gherkin format if present}
```

If the custom field is empty or missing, note that explicitly:

```markdown
## Acceptance Criteria

> No acceptance criteria defined in JIRA {ISSUE_ID} (acceptance criteria field is empty).
```

---

#### Section 4.7 — Non-Functional Requirements & Success Criteria

Identify any non-functional requirements implied by the feature:

```markdown
## Non-Functional Requirements

| Category       | Requirement                                                        |
|----------------|--------------------------------------------------------------------|
| Performance    | {e.g., API response time < 200ms for the new endpoint}             |
| Security       | {e.g., Endpoint must enforce RBAC per existing auth patterns}      |
| Scalability    | {e.g., Must handle N concurrent requests}                          |
| Observability  | {e.g., Add metrics/logging for new operations}                     |
| Compatibility  | {e.g., Backward-compatible with existing API consumers}            |
```

Derive these from the technical spec, the nature of the change, and any explicit mentions in the JIRA issue.

**Success Criteria Guidelines:**

Every success criterion and measurable requirement MUST follow these rules:

| Rule | Good Example | Bad Example | Why |
|---|---|---|---|
| **User-focused** | "User completes checkout in under 3 minutes" | "API response under 200ms" | Measures user outcome, not implementation detail |
| **Technology-agnostic** | "System processes 100 concurrent registrations" | "MongoDB query returns in <50ms" | No database, framework, or protocol names |
| **Measurable & verifiable** | "Error rate below 0.1% over 24h" | "System should be fast" | Must have a number or concrete pass/fail condition |
| **Business-oriented** | "Registration available 99.9% of the time" | "Pod restarts fewer than 2 per day" | Stakeholders understand the impact |

If a requirement contains technology-specific language (database names, framework details, infrastructure terms), rewrite it in terms of the **observable user or business outcome** instead. Technical implementation targets belong in the implementation plan, not the feature spec.

---

#### Section 4.8 — Impacted Areas

A table mapping every impacted area to concrete code references:

```markdown
## Impacted Areas

| Area                  | File / Class / Endpoint                        | Nature of Change        | POD Spec Reference         |
|-----------------------|------------------------------------------------|-------------------------|--------------------------------|
| REST API              | `src/main/path/to/XxxController`               | New endpoint / Modified | api-spec.md § {section}        |
| Service Layer         | `src/main/path/to/XxxService`                  | New method              | functional-spec.md § {section} |
| Data Model            | `src/main/path/to/XxxEntity`                   | New field               | data-model-spec.md § {section} |
| Database Migration    | `db/migration/V{N}__description.sql`           | New migration           | data-model-spec.md § {section} |
| Configuration         | Configuration files (e.g. application.yml, .env, config.json) | New property            | technical-spec.md § {section}  |
| Unit Tests            | `src/test/path/to/XxxServiceTest`              | New / updated tests     | —                              |
| Integration Tests     | `src/test/path/to/XxxIntegrationTest`          | New / updated tests     | —                              |
```

Populate this table with **actual file paths and class names** found during the codebase analysis in Step 4. Do not use placeholder names if real references were found.

---

#### Section 4.9 — Open Questions & Assumptions

```markdown
## Open Questions & Assumptions

### Open Questions

1. {Question that could not be resolved during recursive clarification — genuinely needs human input}
2. {Another open question}

### Auto-Resolved Assumptions

{These were identified as ambiguities during Step 4A but resolved autonomously using codebase/spec evidence. Review carefully — override any that are incorrect.}

1. [AUTO-RESOLVED] {Assumption statement} — *Evidence: {code reference, spec section, or pattern cited}*
2. [AUTO-RESOLVED] {Another assumption} — *Evidence: {source}*

### Other Assumptions

1. {Assumption made during spec generation, with rationale}
2. {Another assumption}
```

Flag anything ambiguous in the JIRA description, missing acceptance criteria, or gaps between the JIRA issue and the existing POD knowledge. The recursive clarification loop (Step 4A) should have already resolved many ambiguities — only genuinely unresolvable questions should remain as Open Questions.

---

#### Section 4.10 — Definition of Done

```markdown
## Definition of Done

- [ ] All functional requirements (FR-01 through FR-XX) implemented
- [ ] All acceptance criteria passing
- [ ] Unit tests written/updated for impacted areas
- [ ] Integration tests written/updated for impacted areas
- [ ] Non-functional requirements validated
- [ ] Code reviewed and approved
- [ ] No regressions in existing test suites
- [ ] Documentation updated (if applicable)
- [ ] Feature spec reviewed against implementation for completeness
```

---

### Step 5A — Spec Quality Self-Validation

After generating `specs.md`, perform an automated quality validation pass before presenting the spec to the user. This catches common issues that degrade spec usefulness.

#### 5A.1 — Quality Checklist

Run through every check in the table below. For each check, scan the generated spec and record PASS or FAIL:

| # | Check | What to Scan | PASS Criteria | Action if FAIL |
|---|---|---|---|---|
| 1 | **No implementation details leaked** | All sections (especially FRs, ACs, Scope) | No references to specific classes, methods, file paths, database queries, framework APIs, or code-level constructs in requirement statements. Code references belong only in §4.8 (Impacted Areas). | Rewrite the offending requirement in terms of observable behaviour. Move implementation detail to §4.8 or a note. |
| 2 | **All FRs are testable** | §4.5 Functional Requirements | Every FR can be verified by a single test scenario with a clear pass/fail outcome. No vague language ("should handle gracefully", "appropriately manages"). | Rewrite the FR as a concrete, atomic "shall" statement with explicit expected behaviour. |
| 3 | **Success criteria are technology-agnostic** | §4.7 Non-Functional Requirements | No NFR contains database names, framework names, infrastructure terms, or protocol-specific metrics. All criteria are phrased in user/business outcome terms. | Rewrite per the Success Criteria Guidelines in §4.7. |
| 4 | **Scope is clearly bounded** | §4.4 Scope | Both "In Scope" and "Out of Scope" lists are non-empty. No ambiguous items that could be interpreted as either in or out of scope. | Add missing scope items. Clarify ambiguous boundaries. |
| 5 | **All FRs have sources** | §4.5 Functional Requirements | Every FR row has a non-empty Source column tracing back to JIRA, acceptance criteria, or a POD-spec section. | Add the missing source reference. |
| 6 | **Acceptance criteria preserved** | §4.6 Acceptance Criteria | If the JIRA issue has acceptance criteria, they appear verbatim (not paraphrased). | Restore the original text. |
| 7 | **No orphan requirements** | §4.5 vs §4.8 | Every FR maps to at least one entry in the Impacted Areas table. No FR exists without a corresponding impacted area. | Add the missing impacted area or remove the orphan FR. |
| 8 | **Open questions are genuinely open** | §4.9 Open Questions | No question in the Open Questions list can be answered from the JIRA issue, POD knowledge, or codebase (i.e., the recursive clarification loop should have caught it). | Move it to Auto-Resolved Assumptions with evidence. |

#### 5A.2 — Validation Verdict

Produce a brief validation report (internal — not written to the spec file):

```
=== Spec Quality Validation ===

| # | Check                              | Result |
|---|------------------------------------|--------|
| 1 | No implementation details leaked   | PASS   |
| 2 | All FRs are testable               | PASS   |
| 3 | Success criteria tech-agnostic     | FAIL   |
| 4 | Scope clearly bounded              | PASS   |
| 5 | All FRs have sources               | PASS   |
| 6 | Acceptance criteria preserved      | PASS   |
| 7 | No orphan requirements             | PASS   |
| 8 | Open questions genuinely open      | PASS   |

Overall: 7/8 PASS — 1 issue to fix
```

**If ANY check fails:** fix the issue in `specs.md` immediately, then re-run only the failed checks to confirm the fix. Do NOT present the spec to the user with known quality failures.

**If ALL checks pass:** proceed to Step 5B.

---

### Step 5B — Generate Contract (if applicable)

If the spec defines a new API:

Write the API contract at `ai/contracts/{ISSUE_ID}/contract.md` based on the spec's acceptance criteria and data model. Use the template from `ai/contracts/contract-template.md` as a reference for the structure and format. Update the spec's contract frontmatter field to point to the contract file.



---

### Step 6 — Transition JIRA to "Defining Details"

After writing the feature spec, transition the JIRA issue to **Defining Details** (or the equivalent analysis/requirements status in your workflow) to signal that requirements analysis is underway.

#### 6a. Fetch current issue status

```
mcp2_jira_get_issue
  issue_key: {ISSUE_ID}
  fields: status
```

Check `status.name`. If already "Defining Details", skip the transition.

#### 6b. Get available transitions and execute

```
mcp2_jira_get_transitions
  issue_key: {ISSUE_ID}
```

Find the transition whose `name` matches **"Defining Details"** (case-insensitive). Execute it:

```
mcp2_jira_transition_issue
  issue_key: {ISSUE_ID}
  transition_id: {TRANSITION_ID}
```

#### 6c. Error handling

JIRA transition failure is **non-blocking**. If the MCP tool fails (issue not found, no matching transition exists), log a warning and continue to Step 7. The feature spec generation is the primary deliverable. The MCP tool handles authentication automatically.

---

### Step 7 — Confirm Output

After writing the file, report to the user:

1. **File path**: `ai/specs/{ISSUE_ID}/specs.md`
2. **Summary**: A brief recap of what was generated (issue title, number of functional requirements, number of impacted areas).
3. **Open questions**: List any open questions from Section 4.9 that need human input before implementation begins.
4. **JIRA status**: Whether the transition to "Defining Details" succeeded or was skipped.

```
=== create-specs Summary ===

Issue:       {ISSUE_ID} — {summary}
Output:      ai/specs/{ISSUE_ID}/specs.md
FRs:         {N} functional requirements identified
Impacted:    {N} areas across {N} projects
Clarification: {N} questions auto-resolved, {N} assumptions made
Open Qs:     {N} questions requiring human input (max 5)
Quality:     {N}/8 checks passed
JIRA Status: Transitioned to "Defining Details" (or skipped/failed)

Open Questions:
  1. {question}
  2. {question}

Auto-Resolved Assumptions (review for correctness):
  1. {assumption} — Evidence: {source}
```

---

## Important Rules

1. **Preserve acceptance criteria verbatim.** Do not rephrase, reorder, or summarize the Gherkin criteria from the configured acceptance criteria field.
2. **Use real code references.** After codebase analysis, populate the Impacted Areas table with actual file paths, class names, and endpoints — not placeholders.
3. **Cite sources in functional requirements.** Every FR row must have a traceable Source column pointing back to JIRA or a POD spec section.
4. **Flag ambiguity as open questions.** If the JIRA issue is vague or contradicts the POD knowledge, do not guess — add it to Open Questions.
5. **Do not invent requirements.** Only include functional requirements that are directly supported by the JIRA issue or existing POD knowledge.
6. **Read all POD spec files before generating.** Even if a spec file seems unrelated, skim it for cross-cutting concerns (auth, logging, error handling).
7. **Create the output directory if it does not exist.** Ensure `ai/specs/{ISSUE_ID}/` is created before writing the file.
8. **One spec per issue.** Each JIRA issue gets its own directory under `ai/specs/`.

---

## JIRA API Reference

| Action | Method | Endpoint |
|---|---|---|
| Fetch issue with specific fields | `GET` | `/rest/api/2/issue/{ISSUE_ID}?fields=summary,description,issuetype,priority,labels,components,${AC_CUSTOM_FIELD}` |

**Base URL**: Read `JIRA_BASE_URL` from `local.config` at the workspace root.
**Auth header**: `Authorization: Bearer <JIRA_PAT>`
**PAT location**: `local.config` at workspace root. Read the value of `JIRA_PAT` from it.
