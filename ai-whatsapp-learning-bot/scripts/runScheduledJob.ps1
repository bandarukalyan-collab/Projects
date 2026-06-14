param(
  [Parameter(Mandatory = $true)]
  [string]$JobName,

  [Parameter(Mandatory = $true)]
  [string]$ScriptPath
)

$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $PSScriptRoot
$logsPath = Join-Path $projectPath "logs"
New-Item -ItemType Directory -Force -Path $logsPath | Out-Null

$logPath = Join-Path $logsPath "$JobName.log"
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -LiteralPath $logPath -Value "[$stamp] Starting $JobName" -Encoding UTF8

Push-Location $projectPath
try {
  & node --use-system-ca $ScriptPath 2>&1 | ForEach-Object {
    Add-Content -LiteralPath $logPath -Value $_ -Encoding UTF8
  }

  if ($LASTEXITCODE -ne 0) {
    throw "$JobName failed with exit code $LASTEXITCODE"
  }
} catch {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $logPath -Value "[$stamp] ERROR: $($_.Exception.Message)" -Encoding UTF8
  throw
} finally {
  Pop-Location
}

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -LiteralPath $logPath -Value "[$stamp] Finished $JobName" -Encoding UTF8
