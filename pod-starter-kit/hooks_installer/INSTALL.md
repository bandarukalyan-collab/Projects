# Windsurf Hooks — Deployment Guide

## Overview

These hooks integrate Windsurf Cascade with the Security Gateway (FastAPI).
They intercept AI actions (prompts, commands, MCP calls) and scan them via Prisma AIRS.

**Zero external dependencies required:**
- **Windows** → PowerShell 5.1+ (built into Windows 10/11)
- **macOS / Linux** → bash + curl (pre-installed on all distributions)

---

## Files

| File | Purpose |
|------|---------|
| `install_hooks.bat` | **Polyglot installer** for all platforms (Windows/macOS/Linux/WSL) |
| `hooks.windows.json` | `hooks.json` template for **Windows** |
| `hooks.unix.json` | `hooks.json` template for **macOS / Linux** |
| `hooks/hook_caller.ps1` | Hook script for **Windows** (PowerShell) |
| `hooks/hook_caller.sh` | Hook script for **macOS / Linux** (bash + curl) |
| `hooks/hook_config.json` | Configurable settings (gateway URL, timeout) |

---

## Deployment Steps

### 1. Run the automated installer

Run the polyglot installer from the `hooks_installer/` directory:

```bash
# All platforms (Windows/macOS/Linux/WSL)
# Windows: double-click or run in cmd
hooks_installer\install_hooks.bat

# Unix/Linux/macOS: run with bash
bash hooks_installer/install_hooks.bat

# Or make it executable and run directly
chmod +x hooks_installer/install_hooks.bat
./hooks_installer/install_hooks.bat
```

The installer will:
- Auto-detect your platform (Windows/macOS/Linux/WSL)
- Create the global Windsurf hooks directory if it doesn't exist
- Copy the correct `hooks.json` variant for your platform
- Deploy the hook caller scripts (both .ps1 and .sh for cross-platform compatibility)
- Deploy the configuration file
- Set executable permissions on Unix systems

### 2. Configure the gateway URL

Edit `hooks/hook_config.json` and set the correct gateway URL:

```json
{
  "gateway_url": "https://hooks-windsurf.hiddenlayer-poc-r2-np.kob.dell.com",
  "timeout_seconds": 3
}
```

### 3. Set files as read-only (recommended)

```bash
# macOS / Linux
chmod 444 ~/.codeium/windsurf/hooks.json
chmod 555 ~/.codeium/windsurf/hooks/hook_caller.sh
chmod 444 ~/.codeium/windsurf/hooks/hook_config.json

# Windows (PowerShell — run as admin)
$base = "$env:USERPROFILE\.codeium\windsurf"
Set-ItemProperty "$base\hooks.json"              -Name IsReadOnly -Value $true
Set-ItemProperty "$base\hooks\hook_caller.ps1"   -Name IsReadOnly -Value $true
Set-ItemProperty "$base\hooks\hook_config.json"  -Name IsReadOnly -Value $true
```

### 4. Restart Windsurf

Close and reopen Windsurf for the hooks to take effect.

---

## Final Directory Layout

```
~/.codeium/windsurf/
├── hooks.json              ← Windows
├── hooks.unix.json         ← Unix
└── hooks/
    ├── hook_caller.sh      ← macOS/Linux only
    ├── hook_caller.ps1     ← Windows only
    └── hook_config.json    ← Gateway URL + timeout
```

---

## How It Works

1. Windsurf triggers a hook event (e.g., user types a prompt)
2. Windsurf pipes the event JSON to stdin and runs the hook command
3. The hook script:
   - Reads the JSON from stdin
   - Resolves user identity (`git config user.email`) and hostname
   - Sends the JSON to the FastAPI gateway via `POST /hook/{hook_type}`
   - User metadata is passed as HTTP headers (`X-User-Id`, `X-Hostname`)
4. The gateway scans content via Prisma AIRS and returns allow/block/alert
5. The script exits with the appropriate code:
   - `0` = allow
   - `1` = alert (shown to user, does not block)
   - `2` = block (action is prevented)

---

## Troubleshooting

**Hook not firing:**
- Verify `hooks.json`/`hooks.unix.json` is in the correct global directory
- Check that the script path in `hooks.json`/`hooks.unix.json` is correct and accessible
- Restart Windsurf after any changes

**"Security gateway server is down":**
- Ensure the FastAPI gateway is running at the URL in `hook_config.json`
- Test manually: `curl https://hooks-windsurf.hiddenlayer-poc-r2-np.kob.dell.com/health`

**Permission denied (macOS/Linux):**
- Run `chmod +x ~/.codeium/windsurf/hooks/hook_caller.sh`

**PowerShell execution policy (Windows):**
- The hooks.json command includes `-ExecutionPolicy Bypass` to handle this
- If still blocked, run as admin: `Set-ExecutionPolicy RemoteSigned -Scope LocalMachine`
