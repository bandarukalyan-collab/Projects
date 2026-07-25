#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Windsurf Hook Caller — macOS / Linux
# ─────────────────────────────────────────────────────────────────────────────
# Reads JSON from stdin (Windsurf hook payload), enriches it with user
# metadata via HTTP headers, POSTs to the FastAPI gateway, and exits with
# the appropriate code.
#
# Dependencies: bash, curl (both pre-installed on macOS and Linux)
#
# Exit codes:
#   0 = allow
#   1 = error/alert (shown but does not block)
#   2 = block (Windsurf blocks the action)
#
# Usage in hooks.json:
#   "command": "bash <path>/hook_caller.sh <hook-type>"
#
# Where <hook-type> is one of:
#   user-input | run-command | mcp-request | mcp-response | cascade-response
# ─────────────────────────────────────────────────────────────────────────────

set -uo pipefail

HOOK_TYPE="${1:-unknown}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/hook_config.json"

# ── Read config ──────────────────────────────────────────────────────────────
GATEWAY_URL=""
TIMEOUT=3

if [ -f "$CONFIG_FILE" ]; then
    _gw=$(grep -o '"gateway_url" *: *"[^"]*"' "$CONFIG_FILE" 2>/dev/null | head -1 | sed 's/.*: *"//;s/"$//')
    _to=$(grep -o '"timeout_seconds" *: *[0-9]*' "$CONFIG_FILE" 2>/dev/null | head -1 | sed 's/.*: *//')
    [ -n "${_gw:-}" ] && GATEWAY_URL="$_gw"
    [ -n "${_to:-}" ] && TIMEOUT="$_to"
fi

if [ -z "$GATEWAY_URL" ]; then
    echo "Security gateway is not configured" >&2
    exit 0
fi

# ── Quick server check ──────────────────────────────────────────────────────
if ! curl -sfk --max-time "$TIMEOUT" -o /dev/null "${GATEWAY_URL}/health" 2>/dev/null; then
    echo "Security gateway server is down" >&2
    exit 0
fi

# ── User metadata ────────────────────────────────────────────────────────────
USER_ID=$(whoami 2>/dev/null || echo "unknown")
# _git_email=$(git config user.email 2>/dev/null)
# [ -n "${_git_email:-}" ] && USER_ID="$_git_email"
HOST_NAME=$(hostname 2>/dev/null || echo "unknown")

# ── Read stdin ───────────────────────────────────────────────────────────────
INPUT_RAW=$(cat)
[ -z "$INPUT_RAW" ] && INPUT_RAW="{}"

# ── POST to gateway ─────────────────────────────────────────────────────────
RESPONSE=$(printf '%s' "$INPUT_RAW" | curl -sk -w "\n%{http_code}" \
    --max-time "$TIMEOUT" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-Hook-Type: ${HOOK_TYPE}" \
    -H "X-User-Id: ${USER_ID}" \
    -H "X-Hostname: ${HOST_NAME}" \
    -d @- \
    "${GATEWAY_URL}/hook/${HOOK_TYPE}" 2>/dev/null)

# ── Parse response ───────────────────────────────────────────────────────────
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

# If curl failed entirely (no HTTP code)
if ! [[ "$HTTP_CODE" =~ ^[0-9]+$ ]]; then
    echo "Security gateway error: no response from ${GATEWAY_URL}" >&2
    exit 0
fi

# Non-2xx = fail-open
if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
    echo "Security gateway error: HTTP ${HTTP_CODE}" >&2
    exit 0
fi

# Extract action and message from JSON response (no jq dependency)
ACTION=$(echo "$BODY" | grep -o '"action" *: *"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//')
MESSAGE=$(echo "$BODY" | grep -o '"message" *: *"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//')

case "${ACTION:-block}" in
    allow)
        exit 0
        ;;
    alert)
        [ -n "${MESSAGE:-}" ] && echo "ALERT: $MESSAGE"
        exit 0
        ;;
    block)
        echo "${MESSAGE:-Blocked by security gateway}" >&2
        exit 2
        ;;
    *)
        echo "Unknown action: ${ACTION}" >&2
        exit 2
        ;;
esac
