param(
  [string]$ProjectPath = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

$nodePath = (Get-Command node).Source
$projectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
$runnerPath = Join-Path $projectPath "scripts\runScheduledJob.ps1"

function Register-BotTask {
  param(
    [string]$TaskName,
    [string]$JobName,
    [string]$Script,
    [string]$Time,
    [string[]]$Days
  )

  $action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runnerPath`" -JobName `"$JobName`" -ScriptPath `"$Script`"" `
    -WorkingDirectory $projectPath
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Days -At $Time
  $settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  Write-Host "Registered $TaskName at $Time on $($Days -join ', ')"
}

Register-BotTask -TaskName "AI WhatsApp Learning Bot - Questions" -JobName "questions" -Script "src\jobs\sendDailyQuestions.js" -Time "20:00" -Days @("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")
Register-BotTask -TaskName "AI WhatsApp Learning Bot - Answers" -JobName "answers" -Script "src\jobs\sendDailyAnswers.js" -Time "09:00" -Days @("Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
Register-BotTask -TaskName "AI WhatsApp Learning Bot - Weekly Recap" -JobName "weekly-recap" -Script "src\jobs\sendWeeklyRecap.js" -Time "10:00" -Days @("Saturday")
