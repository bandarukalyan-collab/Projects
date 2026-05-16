param(
  [string]$PhoneNumber = "919849605044",
  [string[]]$ChatName = @(),
  [string]$ChatNames = "",
  [switch]$NoSend
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logPath = Join-Path $scriptDir "send-ai-whatsapp-update.log"
Set-Location -LiteralPath $scriptDir

function Write-Log {
  param([string]$Text)
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $logPath -Value "[$stamp] $Text" -Encoding UTF8
}

Write-Log "Starting WhatsApp update."

$today = Get-Date -Format "MMMM d, yyyy"
$message = @"
AI Update - $today

Models
- ChatGPT: GPT-5.5
- Claude: Opus 4.7 / Sonnet 4.6
- Gemini: Gemini 3.1 Pro
- DeepSeek: V4 Pro
- Grok: Grok 4.3
- Meta AI: Llama 4
- Qwen: Qwen3.6

Top News
1. YouTube expands AI deepfake detection
2. ArXiv bans AI-slop papers
3. Claude Code alternative Goose is free
"@

$messageBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($message))
$senderScript = Join-Path $scriptDir "send-ai-whatsapp-update.js"
$targets = @()
if ($ChatNames) {
  foreach ($name in ($ChatNames -split "\|")) {
    if ($name.Trim()) {
      $targets += @{ Type = "chat"; Value = $name.Trim() }
    }
  }
} elseif ($ChatName.Count -gt 0) {
  foreach ($name in $ChatName) {
    if ($name.Trim()) {
      $targets += @{ Type = "chat"; Value = $name.Trim() }
    }
  }
} else {
  $targets += @{ Type = "phone"; Value = $PhoneNumber }
}

foreach ($target in $targets) {
  Write-Log "Sending to $($target.Type): $($target.Value)"
  $nodeArgs = @($senderScript, "--messageBase64", $messageBase64)

  if ($target.Type -eq "chat") {
    $nodeArgs += @("--chatName", $target.Value)
  } else {
    $nodeArgs += @("--phone", $target.Value)
  }

  if ($NoSend) {
    $nodeArgs += "--no-send"
  }

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & node @nodeArgs 2>&1 | ForEach-Object { Write-Log $_ }
  $nodeExitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference

  if ($nodeExitCode -ne 0) {
    Write-Log "Node sender failed with exit code $nodeExitCode."
    exit $nodeExitCode
  }
}

Write-Log "Finished WhatsApp update."
