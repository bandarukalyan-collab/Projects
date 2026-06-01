param(
  [string]$PhoneNumber = "919849605044",
  [string[]]$ChatName = @("Keep Learning.."),
  [switch]$NoSend
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$trackerDir = $scriptDir
$whatsappDir = "c:\Study Materials\Projects\daily-ai-model-whatsapp-update"

Write-Host "Running AI Model Tracker..."
Set-Location -LiteralPath $trackerDir
python main.py

if (-not (Test-Path "email_preview.html")) {
    Write-Host "Error: email_preview.html not found"
    exit 1
}

$htmlContent = Get-Content "email_preview.html" -Raw -Encoding UTF8

# Extract actual data from ai_model_tracker output
# Read the state file to get model data
$stateFile = "ai_models_state.json"
if (Test-Path $stateFile) {
    $state = Get-Content $stateFile -Raw | ConvertFrom-Json
    $platforms = $state.platforms
    
    # Format models list
    $modelsText = "Models`n"
    foreach ($platform in $platforms) {
        $modelsText += "- $($platform.name): $($platform.models -join ' / ')`n"
    }
} else {
    $modelsText = "Models`n- Unable to load model data"
}

# Extract news from ai_model_tracker output
# Read change history for news
$historyFile = "change_history.json"
if (Test-Path $historyFile) {
    $history = Get-Content $historyFile -Raw | ConvertFrom-Json
    $newsText = "`nTop News`n"
    if ($history.news -and $history.news.Count -gt 0) {
        for ($i = 0; $i -lt [Math]::Min(3, $history.news.Count); $i++) {
            $newsText += "$($i + 1). $($history.news[$i].title)`n"
        }
    } else {
        $newsText += "- No news items available"
    }
} else {
    $newsText = "`nTop News`n- Unable to load news data"
}

# Create message with actual data
$message = @"
AI Update - $(Get-Date -Format "MMMM d, yyyy")

$modelsText
$newsText
"@

$messageBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($message))
$senderScript = Join-Path $whatsappDir "send-ai-whatsapp-update.js"
$targets = @()

if ($ChatName.Count -gt 0) {
  foreach ($name in $ChatName) {
    if ($name.Trim()) {
      $targets += @{ Type = "chat"; Value = $name.Trim() }
    }
  }
} else {
  $targets += @{ Type = "phone"; Value = $PhoneNumber }
}

foreach ($target in $targets) {
  Write-Host "Sending to $($target.Type): $($target.Value)"
  $nodeArgs = @($senderScript, "--messageBase64", $messageBase64)

  if ($target.Type -eq "chat") {
    $nodeArgs += @("--chatName", $target.Value)
  } else {
    $nodeArgs += @("--phone", $target.Value)
  }

  if ($NoSend) {
    $nodeArgs += "--no-send"
  }

  Set-Location -LiteralPath $whatsappDir
  & node @nodeArgs
  $nodeExitCode = $LASTEXITCODE

  if ($nodeExitCode -ne 0) {
    Write-Host "WhatsApp send failed with exit code $nodeExitCode."
    exit $nodeExitCode
  }
}

Write-Host "WhatsApp update sent successfully."
