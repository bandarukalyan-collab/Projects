"""
SDD Install Kit — CLI entry point

Installed via:
  uv tool install sdd-install-kit --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git --reinstall

Usage:
  sdd-install
  sdd-install --workspace /path/to/workspace
  sdd-install --uninstall
"""

import argparse
import subprocess
import sys
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

# Ensure UTF-8 output on Windows (fixes em-dash and other Unicode in --help / banners)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


# ── Constants ─────────────────────────────────────────────────────────────

PACKAGE_DIR    = Path(__file__).resolve().parent
# Installed package: harness is bundled at sdd_install_kit/harness/setup.py
# Source checkout:   harness lives at dell-sdd/setup.py (two levels up)
_HARNESS_BUNDLED = PACKAGE_DIR / "harness" / "setup.py"
_HARNESS_SOURCE  = PACKAGE_DIR.parent / "dell-sdd" / "setup.py"
HARNESS_SCRIPT   = _HARNESS_BUNDLED if _HARNESS_BUNDLED.exists() else _HARNESS_SOURCE

# hooks_installer can be in two locations:
# 1. When installed as package: PACKAGE_DIR / "hooks_installer"
# 2. When running from source: PACKAGE_DIR.parent / "hooks_installer"
_HOOKS_INSTALLED = PACKAGE_DIR / "hooks_installer" / "install_hooks.bat"
_HOOKS_SOURCE = PACKAGE_DIR.parent / "hooks_installer" / "install_hooks.bat"
HOOKS_INSTALLER = _HOOKS_INSTALLED if _HOOKS_INSTALLED.exists() else _HOOKS_SOURCE

try:
    VERSION = version("sdd-install-kit")
except PackageNotFoundError:
    VERSION = "dev"

# ── Terminal UI ───────────────────────────────────────────────────────────

class C:
    """ANSI colour codes (disabled when output is not a tty)."""
    _on = sys.stdout.isatty()
    BOLD   = "\033[1m"  if _on else ""
    DIM    = "\033[2m"  if _on else ""
    GREEN  = "\033[92m" if _on else ""
    YELLOW = "\033[93m" if _on else ""
    CYAN   = "\033[96m" if _on else ""
    RED    = "\033[91m" if _on else ""
    RESET  = "\033[0m"  if _on else ""


def banner(text: str):
    w = 72
    print(f"\n{C.CYAN}{'=' * w}")
    print(f"  {text}")
    print(f"{'=' * w}{C.RESET}\n")


def section(text: str):
    w = 72
    print(f"\n{C.BOLD}{C.CYAN}{'-' * w}")
    print(f"  {text}")
    print(f"{'-' * w}{C.RESET}\n")


def info(text: str = ""):
    print(f"  {text}")


def success(text: str):
    print(f"  {C.GREEN}+ {text}{C.RESET}")


def warn(text: str):
    print(f"  {C.YELLOW}! {text}{C.RESET}")


def error(text: str):
    print(f"  {C.RED}X {text}{C.RESET}")


def ask(prompt: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    result = input(f"  {prompt}{suffix}: ").strip()
    return result if result else default


def ask_yn(prompt: str, default: bool = True) -> bool:
    suffix = "[Y/n]" if default else "[y/N]"
    result = input(f"  {prompt} {suffix}: ").strip().lower()
    if not result:
        return default
    return result in ("y", "yes")


def install_hooks():
    """Run the hooks installer to deploy security hooks.

    The install_hooks.bat is a polyglot script that works on both
    Windows (as .bat) and Unix (via bash). It copies hook files to
    ~/.codeium/windsurf/ and configures the security gateway integration.
    """
    section("Installing Security Hooks")

    if not HOOKS_INSTALLER.exists():
        error(f"Hooks installer not found: {HOOKS_INSTALLER}")
        warn("Skipping hooks installation.")
        warn("The hooks_installer directory may not be included in the package.")
        info()
        return

    info()

    import platform
    system = platform.system().lower()

    try:
        if system == "windows":
            subprocess.run(["cmd", "/c", str(HOOKS_INSTALLER)], check=True)
        else:
            subprocess.run(["bash", str(HOOKS_INSTALLER)], check=True)

        success("Security hooks installed successfully")
        info()
        info("Hooks deployed to: ~/.codeium/windsurf/")
        info("Restart Windsurf for hooks to take effect")
    except subprocess.CalledProcessError as e:
        error(f"Failed to run hooks installer: {e}")
        warn("You may need to run hooks_installer/install_hooks.bat manually")
    except FileNotFoundError:
        error(f"Hooks installer not found: {HOOKS_INSTALLER}")
        warn("Skipping hooks installation.")
    info()

# ── Full Harness ──────────────────────────────────────────────────────────

def full_harness(workspace: str | None = None):
    """Delegate to the bundled harness setup script.

    If `workspace` is given, forward it as `--workspace <path>` so the
    harness skips its interactive workspace prompt — useful for scripting
    and for smoke-tests that supply a throwaway directory.
    """
    section("Full Dell SDLC Harness Setup")

    if not HARNESS_SCRIPT.exists():
        error(f"Harness setup script not found: {HARNESS_SCRIPT}")
        error("Try reinstalling: uv tool install sdd-install-kit --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git --reinstall")
        sys.exit(1)

    info(f"Launching harness setup...")
    info(f"{C.DIM}This is an interactive setup wizard. Follow the prompts.{C.RESET}")
    info()

    cmd = [sys.executable, "-u", "-Xutf8", str(HARNESS_SCRIPT)]
    if workspace:
        cmd += ["--workspace", workspace]

    try:
        # subprocess.call inherits stdin/stdout/stderr by default
        returncode = subprocess.call(cmd)
        
        # Install Windsurf security hooks after successful harness setup
        if returncode == 0:
            info()
            install_hooks()
        
        sys.exit(returncode)
    except KeyboardInterrupt:
        info()
        warn("Setup interrupted. You can re-run at any time:")
        info(f"  {C.BOLD}sdd-install{C.RESET}")
        sys.exit(1)
    except Exception as exc:
        error(f"Failed to launch harness setup: {exc}")
        info("Try reinstalling:")
        info(f"  {C.BOLD}uv tool install sdd-install-kit --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git --reinstall{C.RESET}")
        sys.exit(1)

# ── Main ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="SDD Install Kit — Full Dell SDLC Harness installer.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--workspace", "-w",
        help="Workspace root directory (skips the interactive workspace prompt)",
    )
    parser.add_argument(
        "--version", "-v",
        action="version",
        version=f"sdd-install {VERSION}",
    )
    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="Show uninstall instructions",
    )
    args = parser.parse_args()

    if args.uninstall:
        banner(f"SDD Install Kit  v{VERSION}  |  Uninstall")
        info("MCP configs, security hooks, credentials, and Snyk directives are per-user")
        info("and are not removed automatically.")
        info()
        info("To uninstall the CLI, run:")
        info(f"  {C.BOLD}uv tool uninstall sdd-install-kit{C.RESET}")
        info()
        sys.exit(0)

    banner(f"SDD Install Kit  v{VERSION}  |  Dell AI-Native SDLC")
    info("Spec-Driven Development installer for Dell development teams.")
    info()
    info(f"Python : {sys.version.split()[0]}")
    info()

    full_harness(workspace=args.workspace)


if __name__ == "__main__":
    main()
