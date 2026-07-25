:<<"::BATCH_SECTION"
@echo off
REM ═════════════════════════════════════════════════════════════════════════════
REM Windsurf Hooks Installer — Polyglot (Windows Batch + Unix Bash)
REM ═════════════════════════════════════════════════════════════════════════════
REM This script works on both Windows (as .bat) and Unix (as .sh)
REM
REM Usage:
REM   Windows:  install_hooks.bat
REM   Unix:     bash install_hooks.bat  (or chmod +x and run directly)
REM ═════════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "DEST_BASE=%USERPROFILE%\.codeium\windsurf"
set "DEST_HOOKS=%DEST_BASE%\hooks"

echo ============================================
echo  Windsurf Hooks Installer (Windows)
echo ============================================
echo.
echo  Source : %SCRIPT_DIR%
echo  Target : %DEST_BASE%
echo.

REM ── Create directories ─────────────────────────────────────────────────────
if not exist "%DEST_HOOKS%" (
    echo Creating %DEST_HOOKS% ...
    mkdir "%DEST_HOOKS%"
)

REM ── Copy hooks.json (Windows variant) ──────────────────────────────────────
echo Deploying hooks.json (Windows / PowerShell) ...
copy /Y "%SCRIPT_DIR%hooks.windows.json" "%DEST_BASE%\hooks.json" >nul

REM ── Copy hook scripts ──────────────────────────────────────────────────────
echo Deploying hook_caller.ps1 ...
copy /Y "%SCRIPT_DIR%hooks\hook_caller.ps1" "%DEST_HOOKS%\hook_caller.ps1" >nul

echo Deploying hook_caller.sh ...
copy /Y "%SCRIPT_DIR%hooks\hook_caller.sh" "%DEST_HOOKS%\hook_caller.sh" >nul

echo Deploying hook_config.json ...
copy /Y "%SCRIPT_DIR%hooks\hook_config.json" "%DEST_HOOKS%\hook_config.json" >nul

echo.
echo ============================================
echo  Installation complete!
echo ============================================
echo.

goto :eof

::BATCH_SECTION

# ═════════════════════════════════════════════════════════════════════════════
# Unix Bash Section (executed when run with bash)
# ═════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_BASE="$HOME/.codeium/windsurf"
DEST_HOOKS="$DEST_BASE/hooks"

# ── Detect platform ─────────────────────────────────────────────────────────
PLATFORM="unknown"
if grep -qiE 'microsoft|wsl' /proc/version 2>/dev/null; then
    PLATFORM="wsl"
elif [[ "$(uname -s)" == "Darwin" ]]; then
    PLATFORM="macos"
elif [[ "$(uname -s)" == "Linux" ]]; then
    PLATFORM="linux"
fi

echo "============================================"
echo " Windsurf Hooks Installer (${PLATFORM})"
echo "============================================"
echo ""
echo " Source : ${SCRIPT_DIR}"
echo " Target : ${DEST_BASE}"
echo ""

# ── Create directories ──────────────────────────────────────────────────────
mkdir -p "$DEST_HOOKS"

# ── Deploy hooks.json based on platform ──────────────────────────────────────
if [[ "$PLATFORM" == "wsl" || "$PLATFORM" == "linux" || "$PLATFORM" == "macos" ]]; then
    if [[ -f "$SCRIPT_DIR/hooks.unix.json" ]]; then
        echo "Deploying hooks.json (Unix / bash) ..."
        cp -f "$SCRIPT_DIR/hooks.unix.json" "$DEST_BASE/hooks.json"
    else
        echo "ERROR: hooks.unix.json not found in $SCRIPT_DIR" >&2
        exit 1
    fi
else
    echo "ERROR: Unsupported platform: ${PLATFORM}" >&2
    exit 1
fi

# ── Deploy hook scripts ─────────────────────────────────────────────────────
echo "Deploying hook_caller.sh ..."
cp -f "$SCRIPT_DIR/hooks/hook_caller.sh" "$DEST_HOOKS/hook_caller.sh"
chmod +x "$DEST_HOOKS/hook_caller.sh"

echo "Deploying hook_caller.ps1 ..."
cp -f "$SCRIPT_DIR/hooks/hook_caller.ps1" "$DEST_HOOKS/hook_caller.ps1"

echo "Deploying hook_config.json ..."
cp -f "$SCRIPT_DIR/hooks/hook_config.json" "$DEST_HOOKS/hook_config.json"

echo ""
echo "============================================"
echo " Installation complete!"
echo "============================================"
echo ""
