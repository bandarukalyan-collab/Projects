# update-knowledge

> Batch-integrate delivered features **and raw domain docs** into knowledge specs — reviews all unprocessed JIRA IDs and all new/changed files under `ai/raw/`, and updates the shared knowledge base periodically.

---

## Purpose

Two streams feed the shared `ai/knowledge/` specs:

1. **Delivered features** — each feature's `execute` step generates a `change-summary.md`; the `wrap-up` step handles branch cleanup, Confluence publishing, and JIRA closure. The shared `ai/knowledge/` specs are **not** updated per-feature to avoid merge conflicts when multiple developers work on different feature branches concurrently.
2. **Raw domain docs** — human-authored documents under `ai/raw/` (architecture decisions, vendor specs, onboarding notes, regulatory requirements, meeting minutes, etc.) that capture domain knowledge outside the feature-delivery workflow. These are added or revised continuously by humans.

This skill is designed to be run **periodically by the tech lead** (or a designated team member) on the `develop` branch to fold both streams into the knowledge base in a single coherent update.

---

## Prerequisites

- Current branch is `develop` (not a feature branch)
- At least one of the following is true:
  - One or more delivered features with `change-summary.md` in `ai/specs/{ISSUE_ID}/`
  - One or more new or modified files under `ai/raw/` since the last integration run
- POD Knowledge base at `ai/knowledge/` exists
- `local.config` at workspace root (for JIRA API access if needed to fetch additional context)

---

## Workflow Steps

### Step 1 — Verify Branch

Confirm the current branch is `develop`:

```bash
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "WARNING: update-knowledge should be run on the develop branch (current: $CURRENT_BRANCH)"
    # Ask user to confirm before proceeding
fi
```

---

### Step 2 — Discover Unprocessed Inputs

Two independent scans run in parallel. Either or both may produce results.

#### 2A — Unprocessed feature specs

Scan all feature directories under `ai/specs/`:

```bash
for dir in ai/specs/*/; do
    ISSUE_ID=$(basename "$dir")
    CHANGE_SUMMARY="$dir/change-summary.md"
    MARKER="$dir/.knowledge-integrated"

    if [ -f "$CHANGE_SUMMARY" ] && [ ! -f "$MARKER" ]; then
        echo "UNPROCESSED FEATURE: $ISSUE_ID"
    fi
done
```

Build a list of unprocessed feature IDs.

#### 2B — New or changed raw docs

Track raw-doc integration state in a single log file: `ai/knowledge/.raw-integrated.log`.

Each line records one processed file:
```
<relative-path-from-ai/>    <sha256-hash>    <iso-timestamp>
```

For every file currently under `ai/raw/` (recursive, any extension: `.md`, `.txt`, `.pdf`, `.docx`, etc.):

```bash
for file in $(find ai/raw -type f ! -name '.gitkeep'); do
    REL=${file#ai/}                 # e.g. raw/architecture/decision-042.md
    CURRENT_HASH=$(sha256sum "$file" | awk '{print $1}')
    LAST_HASH=$(grep -E "^${REL}[[:space:]]" ai/knowledge/.raw-integrated.log 2>/dev/null | awk '{print $2}')

    if [ -z "$LAST_HASH" ]; then
        echo "NEW RAW DOC:     $REL"
    elif [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
        echo "CHANGED RAW DOC: $REL (was $LAST_HASH, now $CURRENT_HASH)"
    fi
done
```

Build a list of new/changed raw docs with their current hashes (needed later for Step 7B).

#### 2C — Exit early if nothing to process

If **both** lists are empty, report "All features and raw docs are already integrated" and exit.

---

### Step 3 — Load Input Artifacts

#### 3A — Feature artifacts

For each unprocessed feature (in chronological order based on `change-summary.md` modification dates):

1. Read `ai/specs/{ISSUE_ID}/specs.md` — extract functional requirements, acceptance criteria, impacted areas
2. Read `ai/specs/{ISSUE_ID}/plan.md` — extract files modified, design decisions, API changes
3. Read `ai/specs/{ISSUE_ID}/change-summary.md` — extract per-project changes, modules affected, functional summary, traceability matrix

Build a consolidated summary of **functional changes** for each feature:
- New/modified API endpoints
- New/modified data model fields, collections, indexes
- New/modified business rules and use cases
- Architecture or infrastructure changes
- New/modified process flows

#### 3B — Raw doc content

For each new/changed raw doc (from Step 2B), read the file and classify its content. A single doc may contribute to multiple specs:

| Content type | Target knowledge spec |
|--------------|-----------------------|
| POD purpose, business capabilities, business entities, primary business flows, business counterparts (executive-level, **business language only**) | `POD.md` |
| Architecture decisions, system design, component responsibilities | `technical-spec.md` |
| Data entities, schemas, ER diagrams, field definitions | `data-model-spec.md` |
| API contracts, endpoint definitions, integration protocols | `api-spec.md` |
| Business rules, use cases, user journeys, feature descriptions | `functional-spec.md` |
| Process/sequence flows (happy path, error path, batch) | `flows/*.md` |
| Non-functional requirements (SLAs, throughput, latency) | `nfr-spec.md` |
| Security, auth, data classification, compliance | `security-spec.md` |
| Deployment topology, environments, infra | `deployment-spec.md` |
| Internal integrations (between POD projects) and external interfaces | `integration-spec.md` |

Raw docs that don't map to any spec (e.g. pure meeting minutes with no durable decisions) are noted in the Step 10 report under "Raw docs skipped".

---

### Step 4 — Update Knowledge Specs

For each affected spec file, apply **targeted edits** (do NOT regenerate entire files). **Each edit may draw from both streams** — a feature change and a raw doc can both update the same section.

#### 4.0: `ai/knowledge/POD.md` (executive POD summary — business audience)

`POD.md` is the 10–15 minute read written for **business users** (product managers, domain experts, stakeholders, executives). Update it when either stream introduces changes at the **POD capability level**:

- A delivered feature adds, removes, or materially reshapes a **business capability** or **business flow** described in the POD summary.
- A delivered feature introduces a new **business entity** (domain-level — not just a DB field).
- A raw doc records a change in **POD scope, sub-domain ownership, external business counterparts, or primary business flows**.

**Strict language rules when editing POD.md** (same as `/create-pod-knowledge` Step 15):
- Business language only. No technology names, frameworks, protocols, databases, cloud providers, container platforms, or infrastructure terms.
- No project/repository names, class names, method names, file paths, DTO names, or API endpoint URLs.
- Mermaid diagrams use business-level nodes (actors, capabilities, outcomes) — never classes, services, or technology components.
- Pull wording from `ai/raw/` domain docs and the functional spec — **not** from `technical-spec.md`, `api-spec.md`, `integration-spec.md`, `deployment-spec.md`, or `nfr-spec.md` (those will pollute the business framing).

Apply targeted edits only — `POD.md` is a synthesis, not a detail sheet:
1. Read the current `POD.md`.
2. Update the affected section(s): Purpose, Sub-domain & Scope, Business Capabilities, Business Entities, Business Flows, Business Interactions, Key Business Rules, or Glossary.
3. Keep the file within its target length (400–800 lines). If an update pushes it over budget, trim detail and push the detail into the appropriate detailed spec in §4.1–4.9.
4. Cross-reference the detail spec (e.g. `See functional-spec.md §3.4 for the full use case`) rather than duplicating content.
5. **Sanity-check before saving** — scan the edited sections for technical keywords (`REST`, `gRPC`, `Kafka`, `queue`, `database`, `SQL`, `Java`, `Spring`, `Docker`, `Kubernetes`, `AWS`, project or repo names, class names, endpoint URLs). If any appear outside the §9 "Further Reading" table, rewrite in business language or delete.
6. If no POD-level business change occurred, **skip this step silently** — most feature-only updates will not touch `POD.md`.

> `POD.md` is updated **first** so that §4.1–§4.9 edits can cite the refreshed executive framing, and so that any new business capability named in `POD.md` is guaranteed to appear in the detailed specs below.

#### 4.1: `ai/knowledge/api-spec.md`

If any feature introduced new or modified API endpoints, **or** any raw doc defined API contracts:
1. Read the current api-spec.md
2. Find the section(s) for the affected endpoint(s)
3. Add new endpoints or update existing ones — cite the source (JIRA ID and/or raw doc path)
4. Preserve the existing document structure

#### 4.2: `ai/knowledge/data-model-spec.md`

If any feature changed the data model, **or** any raw doc introduced/revised entity definitions:
1. Read the current data-model-spec.md
2. Add new collections/fields or update existing ones
3. Update index definitions if changed

#### 4.3: `ai/knowledge/functional-spec.md`

If any feature introduced new business rules or modified existing ones, **or** any raw doc captured new use cases:
1. Read the current functional-spec.md
2. Add new use cases or update existing feature descriptions
3. Update business rule references

#### 4.4: `ai/knowledge/technical-spec.md`

If any feature changed the architecture, **or** any raw doc recorded an architecture decision:
1. Read the current technical-spec.md
2. Update module descriptions, dependency diagrams, or infrastructure notes

#### 4.5: `ai/knowledge/flows/*.md`

If any feature introduced or modified process flows, **or** any raw doc described a flow:
1. Read existing flow diagrams
2. Update Mermaid diagrams to reflect new or changed flows
3. Create new flow files if a completely new process was introduced

#### 4.6: Other knowledge specs (raw-doc driven)

Raw docs may also update `nfr-spec.md`, `security-spec.md`, `deployment-spec.md`, and `integration-spec.md`. Apply the same targeted-edit pattern: read current content, merge new facts, preserve structure.

> **For `integration-spec.md`:** preserve its two top-level groups — **Internal Integrations** (interactions between git repos *inside* the POD workspace) and **External Interfaces** (anything crossing the POD workspace boundary, inbound or outbound). When classifying a new integration, apply this rule: if both endpoints are owned by this POD (i.e. both repos are listed in `AGENTS.md` project summaries), it is Internal; otherwise it is External.

> **Source attribution.** Whenever a raw doc drives an edit, include a trailing source reference in the affected section, e.g.
> `_Source: ai/raw/architecture/decision-042.md (integrated YYYY-MM-DD)_`
> This preserves the provenance chain from human input → knowledge spec.

---

### Step 5 — Update AGENTS.md

If any delivered feature or raw doc introduced changes that affect the workspace context document (`AGENTS.md` at the workspace root), update it:
- **New API endpoints** → Add to the relevant API/endpoint tables
- **New configuration options** → Add to the configuration section
- **New modules or projects** → Add to the workspace layout and project summaries
- **Changed build/test commands** → Update the build & test section
- **New domain concepts** → Add to the domain quick reference

Read the current `AGENTS.md`, identify sections that need updating, and apply targeted edits. Do NOT rewrite the entire file.

If no AGENTS.md changes are needed, skip this step silently.

---

### Step 6 — Update LEARNINGS.md

For each processed feature, append a new entry to `LEARNINGS.md` at the workspace root:

```markdown
## {ISSUE_ID} — {Feature Title} ({date})

- **What was implemented**: {1-2 sentence summary}
- **Key patterns used**: {any new patterns, libraries, or approaches introduced}
- **Gotchas discovered**: {any surprising behaviors, edge cases, or workarounds found during implementation}
- **Testing notes**: {any notable test strategies or test infrastructure changes}
```

If a raw doc captured a durable learning (e.g. a tricky integration gotcha, a performance finding), also append it as:

```markdown
## RAW-{short-slug} — {Doc title} ({date})

- **Source**: `ai/raw/{path}`
- **Learning**: {concise takeaway}
```

If no meaningful learnings emerged, skip silently.

---

### Step 7 — Mark Inputs as Integrated

#### 7A — Feature markers

For each processed feature, create a per-directory marker file:

```bash
for ISSUE_ID in $PROCESSED_FEATURE_IDS; do
    echo "integrated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "ai/specs/${ISSUE_ID}/.knowledge-integrated"
    echo "features: ${PROCESSED_FEATURE_IDS}" >> "ai/specs/${ISSUE_ID}/.knowledge-integrated"
done
```

#### 7B — Raw doc log

For each processed raw doc, upsert its entry in `ai/knowledge/.raw-integrated.log`:

```bash
mkdir -p ai/knowledge
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

for entry in $PROCESSED_RAW_DOCS; do
    REL=${entry%%::*}             # raw/architecture/decision-042.md
    HASH=${entry##*::}            # sha256 hash captured in Step 2B

    # Remove any existing line for this path, then append the fresh one
    grep -v -E "^${REL}[[:space:]]" ai/knowledge/.raw-integrated.log > ai/knowledge/.raw-integrated.log.tmp 2>/dev/null || true
    mv ai/knowledge/.raw-integrated.log.tmp ai/knowledge/.raw-integrated.log 2>/dev/null || true
    printf "%s\t%s\t%s\n" "$REL" "$HASH" "$TIMESTAMP" >> ai/knowledge/.raw-integrated.log
done
```

The log is append-mostly and deterministic — re-running is idempotent because hashes for unchanged files match the stored ones.

---

### Step 8 — Append Knowledge CHANGELOG Entry (MANDATORY)

**Output file:** `ai/knowledge/CHANGELOG.md`

This step is **mandatory** — always append an entry whenever this skill modifies `ai/knowledge/`, `AGENTS.md`, or `LEARNINGS.md`. Do not skip it even on tiny updates; every run must leave a trail.

Append an audit entry describing this run. The changelog is shared with `/create-pod-knowledge` and is **deliberately excluded** from AGENTS.md and from feature-spec lifecycle skills (`create-specs`, `create-plan`, `execute`, `wrap-up`) — it exists purely for provenance.

**8.1 — Ensure the changelog file exists**

If `ai/knowledge/CHANGELOG.md` does not exist, create it with the header defined in `/create-pod-knowledge` Step 16.1.

**8.2 — Resolve author identity**

```bash
AUTHOR_NAME=$(git config user.name 2>/dev/null || whoami)
AUTHOR_EMAIL=$(git config user.email 2>/dev/null || echo "unknown@local")
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

**8.3 — Prepend a new entry**

Insert the following block immediately after the `---` divider at the top of the changelog (newest-on-top ordering):

```markdown
## {TIMESTAMP} — update-knowledge

- **Author:** {AUTHOR_NAME} <{AUTHOR_EMAIL}>
- **Trigger:** periodic knowledge integration
- **Features processed ({N_FEATURES}):** {PROCESSED_IDS_CSV}
- **Raw docs processed ({N_RAW}):** {comma-separated relative paths, or "none"}
- **Specs touched:**
  - `POD.md` — {summary or "no changes"}
  - `api-spec.md` — {N} endpoints added/modified, or "no changes"
  - `data-model-spec.md` — {N} fields added/modified, or "no changes"
  - `functional-spec.md` — {N} use cases added/modified, or "no changes"
  - `technical-spec.md` — {summary or "no changes"}
  - `flows/*.md` — {N} diagrams added/modified, or "no changes"
  - `nfr-spec.md` / `security-spec.md` / `deployment-spec.md` / `integration-spec.md` — {as applicable}
- **AGENTS.md updated:** {yes / no}
- **LEARNINGS.md entries added:** {N}
- **Skipped:** {features with incomplete artifacts, raw docs with no mapping}

---
```

Only list fields that apply to this run — omit rows where nothing changed to keep the log compact.

---

### Step 9 — Commit Changes

```bash
cd ai
git add -A
git diff --cached --quiet || git commit -m "JIRA#JIRA-0000; Update knowledge for ${N_FEATURES} feature(s) and ${N_RAW} raw doc(s): ${PROCESSED_IDS_CSV}"
```

> `JIRA-0000` is the reserved placeholder ID for operational commits that sit **outside** a single feature-delivery workflow (e.g. batch knowledge updates, scaffold bootstraps). It keeps the commit message format consistent with pre-receive hook expectations.


---

### Step 10 — Report Results

```
=== Knowledge Integration Report ===

Features processed: {N_FEATURES}
  1. {ISSUE_ID-1} — {summary of changes integrated}
  2. {ISSUE_ID-2} — {summary of changes integrated}

Raw docs processed: {N_RAW}
  1. raw/{path-1} — {new|changed} — {summary of content integrated}
  2. raw/{path-2} — {new|changed} — {summary of content integrated}

Specs updated:
  - POD.md: {POD-level changes summary, or "no changes"}
  - api-spec.md: {N} endpoints added/modified
  - data-model-spec.md: {N} fields added/modified
  - functional-spec.md: {N} use cases added/modified
  - technical-spec.md: {changes or "no changes"}
  - flows/: {N} flow diagrams added/modified
  - nfr-spec.md / security-spec.md / deployment-spec.md / integration-spec.md: {as applicable}
  - AGENTS.md: {changes or "no changes"}
  - LEARNINGS.md: {N} entries added

Skipped:
  - Features with incomplete artifacts: {ISSUE_ID-X: missing specs.md}
  - Raw docs with no knowledge-spec mapping: {raw/minutes/2025-04-18.md}

Commit: {hash} — JIRA#JIRA-0000; Update knowledge for {N_FEATURES} feature(s) and {N_RAW} raw doc(s)
```

---

## Important Rules

1. **Run on develop only.** This skill modifies shared knowledge base files. Running on a feature branch defeats the purpose.
2. **Two input streams.** Always scan both `ai/specs/*/` (features) and `ai/raw/**` (human-authored docs). Either stream alone may trigger a run.
3. **`CHANGELOG.md` is mandatory.** Every run must append an entry to `ai/knowledge/CHANGELOG.md` before committing (Step 8). Never skip it — the changelog is the provenance spine of the knowledge base and downstream operators depend on it.
4. **Targeted edits only.** Never regenerate entire spec files — only update sections affected by the delivered features or raw docs.
5. **Preserve structure.** Maintain existing headings, tables, and formatting in all spec files.
6. **Source attribution.** When a raw doc drives a knowledge-spec edit, cite the raw file path inline so provenance is preserved.
7. **Idempotent.** The per-feature `.knowledge-integrated` marker and the `ai/knowledge/.raw-integrated.log` hash log together prevent re-processing. Safe to re-run.
8. **Skip incomplete inputs.** If a feature directory lacks essential artifacts (feature-spec, change-summary), or a raw doc has no knowledge-spec mapping, log a warning in the report and skip it (do not mark as integrated, so it can be revisited).
9. **Chronological order.** Process features oldest-first; process raw docs in lexical path order. Raw docs are applied **after** features so that manually curated corrections override auto-inferred feature content.

---

## When to Run

| Trigger | Frequency |
|---------|-----------|
| After a sprint ends | Once per sprint |
| After multiple features merge | Ad-hoc, as needed |
| After new raw docs are added to `ai/raw/` | Ad-hoc, as needed |
| Before starting a major new feature | To ensure specs are current |
| As part of periodic maintenance | Weekly or bi-weekly |
