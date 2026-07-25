# ── 1. Handle Arguments (No param block to avoid binding errors) ─────────────
# Usage: hook_caller.ps1 <HookType>
$HookType = if ($args[0]) { $args[0] } else { "unknown" }
$ErrorActionPreference = "Stop"

# ── 2. Robust Stdin Reading ──────────────────────────────────────────────────
# This captures the JSON payload Windsurf sends via the pipeline
$InputRaw = $input | Out-String
if ([string]::IsNullOrWhiteSpace($InputRaw)) { 
    $InputRaw = "{}" 
}

# ── 3. Setup Paths & Config ──────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$GatewayUrl = $null
$Timeout = 3
$ConfigFile = Join-Path $ScriptDir "hook_config.json"

if (Test-Path $ConfigFile) {
    try {
        $config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
        if ($config.gateway_url) { $GatewayUrl = $config.gateway_url }
        if ($config.timeout_seconds) { $Timeout = [int]$config.timeout_seconds }
    } catch { }
}

if (-not $GatewayUrl) {
    [Console]::Error.WriteLine("Security gateway is not configured")
    exit 0
}

# ── 4. Quick Server Health Check ─────────────────────────────────────────────
try {
    $null = Invoke-WebRequest -Uri "$GatewayUrl/health" -Method Get `
        -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
}
catch {
    [Console]::Error.WriteLine("Security gateway server is down")
    exit 0 
}

# ── 5. Metadata Gathering ─────────────────────────────────────────────────────
$UserId = whoami
# try {
#     $gitEmail = & git config user.email 2>$null
#     if ($gitEmail) { $UserId = $gitEmail.Trim() }
# } catch { }

$HostName = if ($env:COMPUTERNAME) { $env:COMPUTERNAME } else { try { (& hostname).Trim() } catch { "unknown" } }

# ── 6. POST to Gateway ────────────────────────────────────────────────────────
$headers = @{
    "Content-Type" = "application/json"
    "X-Hook-Type"  = $HookType
    "X-User-Id"    = $UserId
    "X-Hostname"   = $HostName
}

try {
    $response = Invoke-WebRequest `
        -Uri "$GatewayUrl/hook/$HookType" `
        -Method Post `
        -Headers $headers `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($InputRaw)) `
        -TimeoutSec $Timeout `
        -UseBasicParsing `
        -ErrorAction Stop

    $result = $response.Content | ConvertFrom-Json
    $action = if ($result.action) { $result.action } else { "block" }
    $message = if ($result.message) { $result.message } else { "" }

    switch ($action) {
        "allow" { exit 0 }
        "alert" {
            if ($message) { Write-Output "ALERT: $message" }
            exit 0
        }
        "block" {
            $msg = if ($message) { $message } else { "Blocked by security gateway" }
            [Console]::Error.WriteLine($msg)
            exit 2
        }
        default {
            [Console]::Error.WriteLine("Unknown action: $action")
            exit 2
        }
    }
}
catch {
    [Console]::Error.WriteLine("Security gateway error: $_")
    exit 0 
}
