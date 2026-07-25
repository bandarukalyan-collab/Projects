#!/usr/bin/env python3
"""
Skill Build System — Single Source -> Multi-Platform Output

Maintains a single canonical source of truth for skills in skills/
and generates platform-specific outputs for Devin, Windsurf, and Claude Code.

Canonical format (skills/{name}.md):
  # {name}
  > One-line description
  ---
  ## Purpose
  ... (full step-by-step instructions)

Generated outputs:
  .devin/skills/{name}/SKILL.md                     — Devin skill format
  .windsurf/workflows/{name}.md                     — Standalone Windsurf workflow
  .claude/commands/{name}.md                        — Claude Code command (plain md)

Usage:
  python build.py consolidate   Extract canonical skills from .devin/skills/
  python build.py build         Generate all platform outputs from skills/
  python build.py verify        Check that generated outputs are up-to-date
"""

import argparse
import re
import sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
SKILLS_DIR = SCRIPT_DIR / "skills"

# Generated output directories (all under dell-sdd/)
DEVIN_OUT      = SCRIPT_DIR / ".devin" / "skills"
WINDSURF_OUT   = SCRIPT_DIR / ".windsurf" / "workflows"
# CURSOR_OUT     = SCRIPT_DIR / ".cursor" / "rules"  # Removed: not widely available in Dell
CLAUDE_OUT     = SCRIPT_DIR / ".claude"

# ── Skill Registry ──────────────────────────────────────────────────────
# Canonical skill names (kebab-case). Order matters for display.

SKILL_NAMES = [
    "sdlc",
    "create-pod-knowledge",
    "create-specs",
    "create-plan",
    "execute",
    "wrap-up",
    "update-knowledge",
]

# ── Helpers ──────────────────────────────────────────────────────────────

def to_kebab(name: str) -> str:
    """Ensure name is kebab-case (identity for already-kebab names)."""
    return name.replace("_", "-")


def extract_description(content: str) -> str:
    """Extract the first blockquote line (> ...) as the description."""
    match = re.search(r"^>\s*(.+)$", content, re.MULTILINE)
    return match.group(1).strip() if match else ""


def extract_section(content: str, heading: str) -> str | None:
    """Extract content under a ## heading, up to the next ## or end of file."""
    pattern = rf"^##\s+{re.escape(heading)}\s*\n(.*?)(?=\n##\s|\Z)"
    match = re.search(pattern, content, re.MULTILINE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


def extract_first_paragraph(text: str) -> str:
    """Return the first non-empty paragraph from text."""
    paragraphs = re.split(r"\n\s*\n", text.strip())
    for p in paragraphs:
        p = p.strip()
        if p and not p.startswith("---"):
            return p
    return text.strip()


# ── Terminal output ──────────────────────────────────────────────────────

_BOLD  = "\033[1m"  if sys.stdout.isatty() else ""
_GREEN = "\033[92m" if sys.stdout.isatty() else ""
_YELLOW = "\033[93m" if sys.stdout.isatty() else ""
_RED   = "\033[91m" if sys.stdout.isatty() else ""
_RESET = "\033[0m"  if sys.stdout.isatty() else ""

def ok(msg):   print(f"  {_GREEN}OK{_RESET}    {msg}")
def skip(msg): print(f"  {_YELLOW}SKIP{_RESET}  {msg}")
def fail(msg): print(f"  {_RED}FAIL{_RESET}  {msg}")
def info(msg): print(f"  {_BOLD}INFO{_RESET}  {msg}")


# ══════════════════════════════════════════════════════════════════════════
#  CONSOLIDATE — Extract canonical skills from .devin/skills/ into skills/
# ══════════════════════════════════════════════════════════════════════════

def consolidate_skills():
    """Extract canonical skills from .devin/skills/ into skills/."""
    SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    count = 0

    for name in SKILL_NAMES:
        src = DEVIN_OUT / name / "SKILL.md"
        dst = SKILLS_DIR / f"{name}.md"

        if not src.exists():
            skip(f"{name} — source not found: {src}")
            continue

        content = src.read_text(encoding="utf-8")

        # Strip Devin-specific title prefix: "# Skill: name" -> "# name"
        content = content.replace(f"# Skill: {name}", f"# {name}", 1)

        dst.write_text(content, encoding="utf-8")
        ok(f"{name}  ({src.stat().st_size:,} bytes)")
        count += 1

    print(f"\n  Consolidated {count}/{len(SKILL_NAMES)} skills into skills/")
    if count < len(SKILL_NAMES):
        print(f"  Missing skills should be created manually in {SKILLS_DIR}/")


def cmd_consolidate():
    """Extract canonical skills from .devin/skills/ into skills/.

    Takes the Devin SKILL.md files (which have our latest edits) and
    strips the platform-specific "# Skill: " prefix to produce a
    platform-agnostic canonical file.
    """
    consolidate_skills()


# ══════════════════════════════════════════════════════════════════════════
#  BUILD — Generate all platform outputs from canonical skills/
# ══════════════════════════════════════════════════════════════════════════

def gen_devin(name: str, content: str):
    """Generate Devin skill: add '# Skill: ' prefix, write to .devin/skills/{name}/SKILL.md."""
    out = content.replace(f"# {name}\n", f"# Skill: {name}\n", 1)
    dst = DEVIN_OUT / name / "SKILL.md"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(out, encoding="utf-8")


def gen_windsurf(name: str, desc: str, content: str):
    """Generate standalone Windsurf workflow: add YAML frontmatter + '# Workflow: ' prefix."""
    out = content.replace(f"# {name}\n", f"# Workflow: {name}\n", 1)
    frontmatter = f"---\ndescription: {desc}\n---\n\n"
    out = frontmatter + out
    dst = WINDSURF_OUT / f"{name}.md"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(out, encoding="utf-8")


# Removed: Cursor is not widely available in Dell
# def gen_cursor_rule(name: str, desc: str, content: str):
#     """Generate Cursor rule: .cursor/rules/{name}.mdc with frontmatter."""
#     out = content.replace(f"# {name}\n", f"# {name}\n", 1)
#     frontmatter = f"---\ndescription: {desc}\nalwaysApply: false\n---\n\n"
#     out = frontmatter + out
#     dst = CURSOR_OUT / f"{name}.mdc"
#     dst.parent.mkdir(parents=True, exist_ok=True)
#     dst.write_text(out, encoding="utf-8")


def gen_claude_command(name: str, desc: str, content: str):
    """Generate Claude Code command: .claude/commands/{name}.md (plain markdown)."""
    # Claude Code commands are plain markdown — no frontmatter needed
    dst = CLAUDE_OUT / "commands" / f"{name}.md"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(content, encoding="utf-8")


def cmd_build():
    """Generate all platform-specific outputs from canonical skills/."""
    if not SKILLS_DIR.exists():
        fail(f"Canonical skills directory not found: {SKILLS_DIR}")
        print("  Run 'python build.py consolidate' first.")
        sys.exit(1)

    count = 0
    for name in SKILL_NAMES:
        src = SKILLS_DIR / f"{name}.md"
        if not src.exists():
            skip(f"{name} — canonical source not found")
            continue

        content = src.read_text(encoding="utf-8")
        desc = extract_description(content)

        gen_devin(name, content)
        gen_windsurf(name, desc, content)
        # gen_cursor_rule(name, desc, content)  # Removed: not widely available in Dell
        gen_claude_command(name, desc, content)

        ok(f"{name} -> devin + windsurf + claude")
        count += 1

    print(f"\nGenerated outputs for {count}/{len(SKILL_NAMES)} skills")
    print(f"  Devin:                 {DEVIN_OUT}")
    print(f"  Windsurf (standalone): {WINDSURF_OUT}")
    print(f"  Claude Code commands:  {CLAUDE_OUT / 'commands'}")


# ══════════════════════════════════════════════════════════════════════════
#  VERIFY — Check that generated outputs exist and are up-to-date
# ══════════════════════════════════════════════════════════════════════════

def cmd_verify():
    """Check that all expected outputs exist and match the canonical source."""
    issues = []

    for name in SKILL_NAMES:
        canonical = SKILLS_DIR / f"{name}.md"
        if not canonical.exists():
            issues.append(f"{name}: canonical source missing ({canonical})")
            continue

        canon_mtime = canonical.stat().st_mtime

        targets = [
            ("Devin",    DEVIN_OUT / name / "SKILL.md"),
            ("Windsurf", WINDSURF_OUT / f"{name}.md"),
            # ("Cursor",   CURSOR_OUT / f"{name}.mdc"),  # Removed: not widely available in Dell
            ("Claude",   CLAUDE_OUT / "commands" / f"{name}.md"),
        ]

        for label, target in targets:
            if not target.exists():
                issues.append(f"{name}: {label} output missing ({target.name})")
            elif target.stat().st_mtime < canon_mtime:
                issues.append(f"{name}: {label} output is stale ({target.name})")

    if issues:
        print(f"{_RED}Verification FAILED — {len(issues)} issue(s):{_RESET}\n")
        for issue in issues:
            fail(issue)
        print(f"\nRun 'python build.py build' to regenerate outputs.")
        return False
    else:
        ok(f"All {len(SKILL_NAMES)} skills verified — outputs present and up-to-date")
        return True


# ══════════════════════════════════════════════════════════════════════════
#  STATUS — Show current state of all skill locations
# ══════════════════════════════════════════════════════════════════════════

def cmd_status():
    """Show the current state of each skill across all locations."""
    print(f"{'Skill':<25} {'Source':>10} {'Devin':>10} {'Windsurf':>10} {'Claude':>10}")
    print("-" * 70)

    for name in SKILL_NAMES:
        canonical = SKILLS_DIR / f"{name}.md"
        devin     = DEVIN_OUT / name / "SKILL.md"
        windsurf  = WINDSURF_OUT / f"{name}.md"
        # cursor    = CURSOR_OUT / f"{name}.mdc"  # Removed: not widely available in Dell
        claude    = CLAUDE_OUT / "commands" / f"{name}.md"

        def sz(p):
            if not p.exists():
                return f"{_RED}MISSING{_RESET}"
            kb = p.stat().st_size / 1024
            return f"{kb:.1f} KB"

        print(f"{name:<25} {sz(canonical):>18} {sz(devin):>18} {sz(windsurf):>18} {sz(claude):>18}")


# ══════════════════════════════════════════════════════════════════════════
#  CLI
# ══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Skill Build System — Single Source -> Multi-Platform Output",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  consolidate   Extract canonical skills from .devin/skills/ into skills/
  build         Generate all platform outputs from skills/
  verify        Check that generated outputs are up-to-date
  status        Show current state of each skill across all locations
        """,
    )
    parser.add_argument("command", choices=["consolidate", "build", "verify", "status"])
    args = parser.parse_args()

    banner = f"""
{'='*60}
  Skill Build System — {args.command}
{'='*60}
"""
    print(banner)

    if args.command == "consolidate":
        cmd_consolidate()
    elif args.command == "build":
        cmd_build()
    elif args.command == "verify":
        cmd_verify()
    elif args.command == "status":
        cmd_status()


if __name__ == "__main__":
    main()
