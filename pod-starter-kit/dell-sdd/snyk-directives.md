# Dell Snyk Directives (Starter)

These are the **agentic security directives** applied globally on every Dell
developer's machine by `sdd-install`. They instruct AI coding assistants
(Windsurf, Claude Code, Devin) to invoke the Snyk MCP server at specific
moments during the SDLC.

> **Ownership:** This file is the canonical source. Edits land via MR
> against the `sdd-install-kit` repo. On the next `sdd-install --option
> full` the new directives propagate to every developer who runs it.
>
> **Starter content:** These directives are a minimum baseline derived
> from the [Snyk Studio Directives documentation](https://docs.snyk.io/integrations/snyk-studio-agentic-integrations/directives).
> Dell security should extend or replace them as org policy evolves.

---

## Guardrail 1 — SAST scan at code inception

When you generate or modify **first-party code** (source files inside a
repo we own, excluding tests, configuration, and generated code), call the
Snyk MCP server's `snyk_code_scan` tool on the file(s) you changed.

- If `snyk_code_scan` reports findings, iterate on the code until no
  issues remain at **High** or **Critical** severity.
- Report the scan outcome inline in your response to the developer —
  never silently swallow findings.
- Do NOT skip the scan because "it's a small change" or "it's in a
  prototype." The guardrail applies to every edit.

## Guardrail 2 — Dependency health check at selection

Before adding a new third-party dependency (new line in `package.json`,
`pom.xml`, `requirements.txt`, `go.mod`, `Cargo.toml`, or equivalent),
call the Snyk MCP server's `snyk_package_health_check` tool for the
proposed package and version.

- Warn the developer if the package has known vulnerabilities, is
  unmaintained, has low community engagement, or is a suspicious
  typosquat / name-similar to a popular package.
- Prefer alternatives flagged as healthy over flagged packages.
- If the developer insists on a flagged package, note the justification
  in the code review / MR description.

## Guardrail 3 — Multi-product scan at MR creation

Before creating a Merge Request (e.g. in the `/execute` or `/sdlc`
skills), run all three product scans against the changed files:

- `snyk_code_scan` — SAST
- `snyk_sca_scan` — open-source dependency vulnerabilities
- `snyk_iac_scan` — IaC misconfigurations (for any changed Dockerfile,
  Kubernetes manifest, Terraform, CloudFormation, etc.)

Block the MR if any scan reports unresolved High or Critical findings.
Include the scan summary in the MR description.

## Guardrail 4 — Resolve before merge

Never merge an MR with unresolved High or Critical Snyk findings. If a
finding is flagged as a **false positive** or **accepted risk**, the
developer must explicitly note it in the MR description with reasoning
before the MR can be merged.

---

## Command — `/snyk-fix`

For end-to-end vulnerability remediation, invoke the Snyk-provided
`/snyk-fix` command directive. It walks the agent through:

1. Fetching current findings via `snyk_code_scan` / `snyk_sca_scan`
2. Prioritising by severity
3. Proposing fixes
4. Re-scanning after each fix to confirm resolution

Use this when working through an existing backlog of vulnerabilities,
not for new-code prevention (that's what Guardrail 1 covers).

---

## Authoring notes

- Directives are plain Markdown. Keep each rule a short paragraph —
  long rules get truncated by some MCP clients' context windows.
- Prefer **imperative sentences** ("Always run…") over conditional
  ("You may want to run…") — the former is enforced, the latter is
  advisory.
- If a new Snyk MCP tool ships, update this file to reference it. Old
  rules naming removed tools will silently stop firing.
