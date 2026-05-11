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
Daily AI Model Update - $today

Status:
No major changes today.

AI Platforms:
- ChatGPT / OpenAI
  Type: AI Platform
  Model: GPT-5.5 / GPT-5.5 Pro
  Best for: General work, coding, agents
  Context: 1M API / 400K Codex
  Output: 128K
  Notes: OpenAI flagship

- Claude / Anthropic
  Type: AI Platform
  Model: Claude Opus 4.7
  Best for: Deep reasoning, coding, long tasks
  Context: 1M
  Output: 128K
  Notes: Strong for complex work

- Gemini / Google
  Type: AI Platform
  Model: Gemini 3.1 Pro / Gemini 3 Flash
  Best for: Google ecosystem, multimodal, fast answers
  Context: 1M
  Output: 64K
  Notes: Pro = hard tasks, Flash = speed

- DeepSeek
  Type: AI Platform
  Model: DeepSeek-V4-Pro / V4-Flash
  Best for: Coding, reasoning, low-cost AI
  Context: 1M
  Output: 384K
  Notes: Pro = stronger, Flash = faster/cheaper

- Grok / xAI
  Type: AI Platform
  Model: Grok 4.1 / Grok 4.1 Fast
  Best for: Chat, X integration, agent/search tasks
  Context: Up to 2M Fast API
  Output: Not publicly listed
  Notes: Fast version is agent-focused

- Meta AI
  Type: AI Platform
  Model: Muse Spark / Llama 4
  Best for: Meta apps, open-model ecosystem
  Context: Not publicly listed
  Output: Not publicly listed
  Notes: Muse Spark powers Meta AI app

- Perplexity
  Type: AI Search Platform
  Model: Sonar / Sonar Pro
  Best for: Web search with citations
  Context: 128K / 200K
  Output: Depends on model
  Notes: Best for research/search

AI Coding Tools:
- Replit Agent
  Type: AI App Builder
  Model: Agent 4 + Claude Opus 4.7 Power mode
  Best for: Build apps from plain English
  Context: Model-dependent
  Output: Model-dependent
  Notes: Power mode uses Claude Opus 4.7

- Windsurf / Cascade
  Type: AI Coding IDE
  Model: SWE-1.6 / SWE-1.6 Fast, docs show SWE-1.5
  Best for: Agentic coding IDE
  Context: Not public for SWE
  Output: Not public for SWE
  Notes: Trust app selector if it shows SWE-1.6

- Claude Code
  Type: AI Coding Tool
  Model: Claude Opus 4.7 / Sonnet 4.6
  Best for: Terminal/codebase agent work
  Context: 1M
  Output: 128K
  Notes: Anthropic coding agent

- CrewAI
  Type: AI Agent Framework
  Model: Default gpt-4o-mini, configurable
  Best for: Building custom AI agents
  Context: Depends on chosen model
  Output: Depends on chosen model
  Notes: You plug in GPT/Claude/Gemini/etc.

Note:
Coding tools may depend on the selected model.
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
