# LEARNINGS.md — Example POD Secondary Memory

> Persistent secondary memory for AI agents. Append-only — do not overwrite or compact.
>
> **This is a template example.** The entries below show the expected format.
> Real learnings will accumulate here as AI agents work on features in this workspace.

---

## Codebase Patterns

### Initial Setup — Project Conventions
- hello-world-java uses Maven with `maven-jar-plugin` for packaging; main class is `com.example.App`
- hello-world-nodejs is a minimal Node.js app; entry point is `index.js`, start script is `node index.js`
- hello-world-csharp targets .NET 8.0 with top-level statements (no explicit `Main` method)
- All three projects follow a "Hello, World!" pattern — intentionally minimal as starter templates

---

## Gotchas & Pitfalls

### Initial Setup — Common Issues
- On Windows, PowerShell aliases `curl` to `Invoke-WebRequest` — use `curl.exe` for actual HTTP calls
- Java project requires JDK 17+; check with `java --version` before building
- Node.js project has no test script configured — `npm test` will fail until tests are added
- C# project requires .NET 8.0 SDK — `dotnet --version` must show 8.x

---

## User Preferences

### Initial Setup — Defaults
- TDD approach preferred: write failing test first, then implement
- Comprehensive `change-summary.md` expected for every delivered feature
- Minimal code changes: prefer single-line fixes when sufficient

---

## Execution Log

### Setup — Workspace Created
- Workspace initialized with 3 hello-world projects (Java, Node.js, C#)
- AI knowledge base scaffolded in `ai/` directory
- Skills installed for Windsurf and Devin

---

## Feature Learnings

*(Entries will be added here as features are delivered via `/sdlc` or `/execute`.)*
