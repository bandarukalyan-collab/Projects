# sdlc

> End-to-end SDLC orchestrator — takes an issue ID and autonomously drives a feature from analysis through implementation, code review, and closure.

---

## Purpose

This is the **master orchestrator** skill. Given a single issue ID, it executes the complete Software Development Lifecycle autonomously:

1. Analyses the project and feature requirements
2. Creates detailed specs and implementation plans
3. Implements the code changes following TDD
4. Pushes code and creates Merge Requests
5. Addresses MR review comments
6. Closes the feature and updates the issue tracker

The entire flow runs as a single continuous agent session with only **3 user checkpoints** where human input is required. Between checkpoints, the agent operates fully autonomously.

> **Note:** If `create-pod-knowledge` must run (Step 1), that skill has its own user prompts (documentation sources, project scope, spec selection). These are a **one-time setup cost**, not recurring checkpoints. Similarly, if the feature spec contains unresolved open questions, the `create-plan` skill's Open Questions Gate (Step 2B) will pause for answers before generating the plan — this interaction falls within Checkpoint 2's review scope.

---

## User Checkpoints

| # | When | What the user does | What happens next |
|---|------|-------------------|-------------------|
| **1** | After feature spec is generated | Review `specs.md`, answer open questions (section 4.9), iterate until requirements are clear | Agent proceeds to create implementation plan |
| **2** | After implementation plan is generated | Review `plan.md`, iterate until the plan is perfect — discuss design decisions, file choices, test strategy | Agent proceeds to prep branches, implement, push, and create MRs |
| **3** | After MRs are created and human reviewer adds comments to the MR diffs | Add review comments on the actual code diffs in Git hosting MR/PR UI for final optimization | Agent fixes accepted comments, replies to rejected ones, pushes updates |

Between these checkpoints, everything runs autonomously — issue tracker updates, Git operations, builds, tests, commits, pushes, MR creation, and cleanup.

---

## Prerequisites

- `local.config` at workspace root with `JIRA_PAT`, `JIRA_BASE_URL`, and `GIT_PAT`
- The issue exists in the issue tracker with summary, description, and acceptance criteria
- POD knowledge exist at `ai/knowledge/` (if not, the orchestrator runs `create-pod-knowledge` first)
- The project's build tools and Git are available on the system PATH
- Network access to the JIRA instance (`JIRA_BASE_URL` in `local.config`) and Git remote

---

## State Detection & Mid-Flow Entry

The `/sdlc` orchestrator is **re-entrant** — it can be invoked at any point in the lifecycle and will intelligently pick up from where the feature left off. Before executing the linear flow, the orchestrator probes the workspace to determine the current state.

### State Detection Logic

On invocation, run these checks in order:

```
1. Check if ai/specs/{ISSUE_ID}/ exists
   └─ NO  → State: FRESH — start from Step 1

2. Check if specs.md exists
   └─ NO  → State: FRESH — start from Step 1

3. Check if plan.md exists
   └─ NO  → State: SPEC_READY — start from Step 4 (create plan)

4. Check for open MRs (source_branch=develop-{ISSUE_ID}, state=opened)
   └─ YES → Check for unresolved review comments
            ├─ YES → State: MR_REVIEW — start from Step 6 (fix comments)
            └─ NO  → State: MR_OPEN — go to Step 7 (wait for merge)

5. Check for merged MRs (source_branch=develop-{ISSUE_ID}, state=merged)
   └─ YES → Check if wrap-up was completed (Confluence page exists or JIRA status is Complete/Done)
            ├─ YES → State: COMPLETE — report already done
            └─ NO  → State: MR_MERGED — start from Step 8 (wrap up)

6. Check for feature branches (develop-{ISSUE_ID} exists locally)
   └─ YES → State: IMPL_READY — start from Step 5 (execute)
   └─ NO  → State: PLAN_READY — start from Step 5 (execute, will create branches)
```

### Entry Point Summary

| Detected State | Artifacts Present | Entry Point | What Happens |
|---|---|---|---|
| **FRESH** | Nothing (or no specs.md) | Step 1 | Full flow from the beginning |
| **SPEC_READY** | `specs.md` exists, no plan | Step 4 | Skip to create plan → Checkpoint 2 → execute |
| **PLAN_READY** | Both spec + plan exist, no MRs, no branches | Step 5 | Skip to execute (creates branches, implements, pushes, creates MRs) |
| **IMPL_READY** | Both spec + plan + feature branches exist, no MRs | Step 5 | Resume execute (will detect existing branches and continue) |
| **MR_REVIEW** | Open MRs with unresolved review comments | Step 6 | Fix MR comments via `/execute` re-entry |
| **MR_OPEN** | Open MRs, no unresolved comments | Step 7 | Inform user: MRs are clean, waiting for merge |
| **MR_MERGED** | Merged MRs, wrap-up not yet done | Step 8 | Run wrap-up (branch cleanup, JIRA close, Confluence) |
| **COMPLETE** | Merged MRs + wrap-up completed (JIRA status Complete/Done) | — | Report: feature already complete |

### State Announcement

On detecting the current state, announce it clearly before proceeding:

```
=== SDLC State Detection for {ISSUE_ID} ===

Current state: {STATE_NAME}
  - specs.md:        {EXISTS / MISSING}
  - plan.md:  {EXISTS / MISSING}
  - Feature branches:        {EXIST in N projects / NONE}
  - Open MRs:                {N open / NONE}
  - Unresolved comments:     {N comments / NONE}
  - Merged MRs:              {N merged / NONE}
  - Wrap-up completed:       {YES / NO}

→ Entering at: Step {N} — {step description}
```

If the detected state is not FRESH, ask the user to confirm before proceeding:

```
The feature appears to be at the {STATE_NAME} stage.
I'll continue from Step {N} ({step description}).

Reply "yes" to continue, or "restart" to begin from Step 1.
```

This ensures the user is never surprised by which phase they enter.

---

## Orchestration Flow

```
Input: Issue ID (e.g. PROJECT-1234)

Phase 1: ANALYSIS (autonomous)
  |
  +--> Step 1: Verify POD knowledge exist
  +--> Step 2: Fetch issue details
  +--> Step 3: Generate feature spec
  |
  === CHECKPOINT 1: User reviews feature spec ===
  |
Phase 2: PLANNING (autonomous)
  |
  +--> Step 4: Generate implementation plan
  |
  === CHECKPOINT 2: User reviews implementation plan ===
  |
Phase 3: EXECUTION (autonomous)
  |
  +--> Step 5: Execute implementation (TDD + push + create MRs)
  |
  === CHECKPOINT 3: Human reviewer adds MR comments ===
  |
Phase 4: REVIEW & CLOSE (autonomous)
  |
  +--> Step 6: Fix MR review comments (re-entry via /execute)
  +--> Step 7: Wait for MR merge approval
  +--> Step 8: Close & clean up
  |
  Done.
```

---

## Workflow Steps

### Step 1 — Verify POD Knowledge

Check if `ai/knowledge/` exists and contains the core spec files:
- `functional-spec.md`
- `technical-spec.md`
- `data-model-spec.md`
- `api-spec.md`

Also check that `AGENTS.md` exists at the workspace root. This file is generated by `create-pod-knowledge` and is critical for downstream skills — `create-plan` uses it for project context, build commands, and architecture patterns; `execute` uses it for test commands, commit format, and coding constraints.

If any knowledge spec or `AGENTS.md` is missing, run `/create-pod-knowledge` first. This is a one-time setup step.

If all files exist, load them into context for use throughout the flow.

---

### Step 2 — Fetch Issue Details & Validate

Load credentials from `local.config` at the workspace root:
```bash
GIT_PAT=$(grep GIT_PAT "$WORKSPACE_ROOT/local.config" | cut -d= -f2)
```

**Primary Method: Use MCP Tool**

Fetch the issue to validate it exists and has sufficient content:

```
mcp2_jira_get_issue
  issue_key: {ISSUE_ID}
  fields: summary,description,issuetype,priority,status,labels,components
```

**Curl Fallback Method**

Use curl when MCP fails or you need custom fields not available via MCP:

```bash
# Get configuration
AC_CUSTOM_FIELD=$(grep AC_CUSTOM_FIELD "$WORKSPACE_ROOT/local.config" | cut -d= -f2)
AC_CUSTOM_FIELD=${AC_CUSTOM_FIELD:-customfield_10208}
JIRA_PAT=$(grep JIRA_PAT "$WORKSPACE_ROOT/local.config" | cut -d= -f2)
JIRA_BASE_URL=$(grep JIRA_BASE_URL "$WORKSPACE_ROOT/local.config" | cut -d= -f2)

# Fetch all fields including custom fields
curl -s -H "Authorization: Bearer $JIRA_PAT" \
  "${JIRA_BASE_URL}/rest/api/2/issue/{ISSUE_ID}?fields=summary,description,issuetype,priority,status,labels,components,${AC_CUSTOM_FIELD}"
```

**Field Mapping for Curl Response:**
- Standard fields: `fields.summary`, `fields.description`, etc.
- Acceptance Criteria: `fields.${AC_CUSTOM_FIELD}`

**Validation:**
- Issue exists (not 404)
- Has a description (not empty)
- Has acceptance criteria (from custom field or description contains testable requirements)

If the issue lacks sufficient detail, report what's missing and ask the user to update the issue before continuing. The MCP tool handles authentication automatically.

Log the current issue status for tracking throughout the flow.

---

### Step 3 — Generate Feature Spec

Execute the `/create-specs` skill:

1. Use the issue data fetched in Step 2 (no need to re-fetch)
2. Load POD knowledge from `ai/knowledge/`
3. Analyse the codebase for context
4. **Recursive clarification** (Step 4A in the skill) — autonomously resolve ambiguities by cross-referencing JIRA, specs, and code; classify remaining questions as auto-resolved assumptions or genuinely open
5. Generate `ai/specs/{ISSUE_ID}/specs.md`

After generation, present the feature spec to the user with a clear summary:

```
=== CHECKPOINT 1: Feature Spec Review ===

Feature spec generated: ai/specs/{ISSUE_ID}/specs.md

Summary:
- {N} Functional Requirements (FR-01 through FR-{N})
- {N} Acceptance Criteria
- Impacted areas: {list of modules/files}
- Clarification: {N} questions auto-resolved, {N} assumptions made

Open Questions (need your input):
- Q1: {question text}
- Q2: {question text}

Auto-Resolved Assumptions (review for correctness):
- A1: {assumption} — Evidence: {source}

Please review the feature spec and:
1. Answer the open questions above
2. Review auto-resolved assumptions — override any that are incorrect
3. Confirm the requirements are correct and complete
4. Flag anything that needs changes

Reply when ready to proceed to implementation planning.
```

**WAIT for user response.** Iterate on the feature spec based on feedback:
- If the user answers open questions, update section 4.9
- If the user requests changes, regenerate affected sections
- If the user adds requirements, add new FR entries
- Continue until the user confirms the spec is ready

---

### Step 4 — Generate Implementation Plan

Execute the `/create-plan` skill:

1. Read the approved feature spec
2. Load project context (AGENTS.md, POD knowledge)
3. Deep-dive codebase analysis (trace entry points, analyse logic, DTOs, cross-cutting concerns, test infrastructure)
4. **Cross-artifact validation** (Step 6B in the skill) — verify plan-to-spec consistency: FR coverage, AC coverage, scope alignment, traceability matrix
5. Generate `ai/specs/{ISSUE_ID}/plan.md` (includes traceability matrix)

Present the plan to the user:

```
=== CHECKPOINT 2: Implementation Plan Review ===

Implementation plan generated: ai/specs/{ISSUE_ID}/plan.md

Summary:
- Files to modify: {N}
- Files NOT to modify: {list}
- Unit tests to write: {N}
- E2E tests to write: {N}

Open Questions (resolve before coding):
- {list any discrepancies found}

Key Design Decisions:
- {summarize major decisions}

Please review the implementation plan and:
1. Resolve any open questions
2. Confirm the file changes are correct
3. Confirm the test strategy
4. Flag any design decisions you want to change

Reply when ready to proceed to implementation.
```

**WAIT for user response.** Iterate on the plan:
- If the user questions a design decision, discuss alternatives and update
- If the user wants different files modified, adjust the plan
- If the user wants more/fewer tests, adjust
- Continue until the user says the plan is perfect

---

### Step 5 — Execute Implementation + Push + MRs (autonomous)

Execute the `execute` skill. This single skill handles everything from workspace prep through MR creation:

**Preparation phase:**
1. Verify `specs.md` and `plan.md` exist locally
2. **Pre-implementation checklist gate** — scan both `specs.md` and `plan.md` for unresolved open questions, unconfirmed assumptions, inline placeholders (`TODO`/`TBD`/`TBC`), empty critical sections, incomplete traceability, and placeholder file paths. If any blocking issues are found, **STOP** and report them to the user before proceeding. This gate prevents rework mid-implementation.
3. Attach both specs to the issue as attachments and post a structured summary comment in JIRA wiki markup
4. Transition issue to "In Development"
5. Auto-detect impacted projects from the implementation plan (always includes the `ai/` repo)
6. For each project (source projects + `ai/`): checkout develop, pull latest, create `develop-{ISSUE_ID}`

**Implementation phase:**
1. Read all files in the plan before writing any code
2. Follow TDD: write unit tests first, then implement, then verify
3. Run module-level unit tests — must pass
4. Write E2E tests if specified in the plan
5. Run E2E tests if applicable
6. **Cross-project verification** — run the full test suite across ALL impacted projects, lint/static analysis, and conditional E2E. This is the pre-push quality gate.
7. Self-review all changes
8. **Post-implementation validation** — re-read the feature spec and verify every FR is implemented, every AC is met with test evidence, scope boundaries are respected, NFRs are satisfied, and the Definition of Done checklist passes
9. Commit with `JIRA#{ISSUE_ID}; {description}` format (format defined in `AGENTS.md`)

**Push & MR phase:**
10. Push all impacted projects to origin
11. Create MRs targeting `develop` (NEVER `main`)
12. Generate `change-summary.md` with MR links and traceability matrix
13. Commit and push `ai/` repo changes (change-summary, feature specs, LEARNINGS.md) on the feature branch, create MR for `ai/`, and update `change-summary.md` with the `ai/` MR link
14. Post implementation summary comment to the issue tracker

This is the largest step. Follow the implementation plan exactly. If stuck:
- Compilation errors: retry up to 3 times, then ask user
- Test failures: add logging, diagnose, fix implementation (not tests)
- Scope creep: stop if a change requires modifying "Files NOT to Modify"

Report MR URLs and inform the user:

```
=== MRs Created — Ready for Review ===

| # | Project | MR | URL |
|---|---------|-----|-----|
| 1 | {project-name} | !{iid} | {url} |
| N | ai | !{iid} | {url} |

Please review the code diffs in GitLab and add your review comments.

=== CHECKPOINT 3: Waiting for MR Review Comments ===

When you've finished adding review comments to the MR(s), reply here and I'll
address them — implementing accepted suggestions and replying to any I disagree with.
```

**WAIT for user response.** The user should:
1. Open the MR URL(s) in GitLab
2. Review the actual code diffs
3. Add inline comments on specific lines or general comments
4. Come back and tell the agent to proceed

---

### Step 6 — Fix MR Review Comments (autonomous)

Re-run the `execute` skill with the same issue ID. It automatically detects existing MRs with unresolved comments and enters the **MR Review Fix Phase**:

1. Detect open MRs across workspace projects
2. Fetch all unresolved MR discussions from GitLab
3. Filter to actionable comments (ignore bots, system notes, resolved threads)
4. Analyse each comment against the code, specs, and feature requirements
5. For each comment, decide: Accept / Reject / Escalate
6. Update implementation plan if needed
7. Make code changes for accepted comments
8. Build with full unit tests — must pass
9. Commit and push with `JIRA#{ISSUE_ID}; Fix MR review comments` (format defined in `AGENTS.md`)
10. Reply to each discussion on GitLab (fix confirmation for accepted, reasoning for rejected)
11. Resolve accepted discussions

If there are escalated comments (large architectural changes), flag them for the user but continue with the rest.

Report results. If the reviewer adds more comments after this round, the user can re-run `/execute {ISSUE_ID}` again.

---

### Step 7 — Wait for MR Merge (user-driven)

After MR comments are addressed, the MR needs to be approved and merged by a human reviewer in GitLab. This is outside the agent's control.

Inform the user:

```
=== Waiting for MR Merge ===

All review comments have been addressed. Next steps:
1. Reviewer approves the MR(s) in GitLab
2. Reviewer (or you) merges the MR(s) to develop
3. Once merged, reply here and I'll clean up

MR URLs:
{list MR URLs from change-summary.md}
```

**WAIT for user to confirm MRs are merged.**

---

### Step 8 — Wrap Up (autonomous)

Execute the `/wrap-up` skill:

1. Verify all MRs are merged (abort if any are still open)
2. Delete local and remote feature branches
3. Switch all projects back to `develop` and pull latest
4. Post a coding summary comment to the issue tracker (feature complete panel with MRs, files, tests, commits)
5. Add `AI-Delivered` label to the JIRA issue (for tracking/reporting)
6. Transition issue to "Complete"
7. Commit and push `ai/` repo changes (sync workspace config files if modified)
8. Publish Confluence documentation (mandatory)

> **Note:** Knowledge base updates (AGENTS.md, LEARNINGS.md, `ai/knowledge/`) are handled by the `update-knowledge` skill, run periodically by the POD lead on `develop`.

Report final results:

```
=== SDLC Complete for {ISSUE_ID} ===

Feature: {summary}
Status: Complete

Branch cleanup: All feature branches deleted
Issue tracker: Transitioned to Complete
MRs: All merged to develop
Confluence: Published (or: skipped/failed)

Artifacts retained:
- ai/specs/{ISSUE_ID}/specs.md
- ai/specs/{ISSUE_ID}/plan.md
- ai/specs/{ISSUE_ID}/change-summary.md (includes MR links + traceability matrix + task checklist)

Next: Run /update-knowledge periodically to batch-integrate features into ai/knowledge/
```

---

## Important Rules

1. **Only 3 user checkpoints** (in the normal flow). Between checkpoints, operate fully autonomously. Do not ask for confirmation on individual steps. One-time setup prompts from `create-pod-knowledge` and spec-quality gates from `create-plan` are exceptions, not recurring checkpoints.
2. **Always update the issue tracker.** Post comments at key milestones (specs attached, implementation complete, feature complete). Transition status appropriately.
3. **Always update Git.** Commit with `JIRA#{ISSUE_ID}; {description}` format (format defined in `AGENTS.md`). Never force-push. Always target `develop` for MRs.
4. **Build must pass before push.** Never push code that doesn't compile or pass unit tests.
5. **Follow the implementation plan exactly.** Do not modify files listed in "Files NOT to Modify".
6. **TDD is mandatory.** Write tests before implementation.
7. **Preserve code style.** Read surrounding code before editing. Do not add/remove comments unless specified.
8. **Handle errors gracefully.** Issue tracker / Git hosting API failures are non-blocking — report and continue. Build/test failures must be fixed before proceeding.
9. **Generate artifacts.** Ensure `specs.md`, `plan.md`, and `change-summary.md` (with MR links + traceability matrix) are all created in `ai/specs/{ISSUE_ID}/`.
10. **If POD knowledge don't exist**, run `create-pod-knowledge` as step 0 before starting the feature flow.

---

## JIRA Status Transitions

The JIRA status transitions are centrally configured in `dell-sdd/jira-status-config.json` and `dell-sdd/setup.py` (JIRA_STATUS_TRANSITIONS dictionary). This configuration maps each SDLC stage to its corresponding JIRA status name.

| Phase | JIRA Status |
|-------|-------------|
| Start | Proposed |
| After feature spec (Step 3) | Defining Details |
| After implementation plan (Step 4) | Ready for Dev |
| After execute prep phase (Step 5) | In Development |
| After MRs merged & closed (Step 8) | Complete |

---

## Skill References

| Skill | Command | Used in Step |
|-------|---------|-------------|
| `create-pod-knowledge` | `/create-pod-knowledge` | Step 1 (if needed) |
| `create-specs` | `/create-specs <ISSUE_ID>` | Step 3 |
| `create-plan` | `/create-plan <ISSUE_ID>` | Step 4 |
| `execute` | `/execute <ISSUE_ID>` | Steps 5 & 6 (prep + TDD + push + MRs + review fix) |
| `wrap-up` | `/wrap-up <ISSUE_ID>` | Step 8 |
| `update-knowledge` | `/update-knowledge` | Periodic (not per-feature) |

---

## Quick Start

```
User: Run the SDLC workflow for PROJECT-1234

Agent: Starting SDLC orchestration for PROJECT-1234...
       [Step 1] POD knowledge found at ai/knowledge/
       [Step 2] Issue fetched: "Add additionalInfo-only update path"
       [Step 3] Feature spec generated...

       === CHECKPOINT 1: Please review the feature spec ===
       ...
```
