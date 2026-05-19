param(
  [string]$ProjectPath = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

$nodePath = (Get-Command node).Source
$projectPath = (Resolve-Path -LiteralPath $ProjectPath).Path

function Register-BotTask {
  param(
    [string]$TaskName,
    [string]$Script,
    [string]$Time,
    [string[]]$Days
  )

  $action = New-ScheduledTaskAction -Execute $nodePath -Argument "`"$projectPath\$Script`"" -WorkingDirectory $projectPath
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Days -At $Time
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  Write-Host "Registered $TaskName at $Time on $($Days -join ', ')"
}

Register-BotTask -TaskName "AI WhatsApp Learning Bot - Questions" -Script "src\jobs\sendDailyQuestions.js" -Time "20:00" -Days @("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")
Register-BotTask -TaskName "AI WhatsApp Learning Bot - Answers" -Script "src\jobs\sendDailyAnswers.js" -Time "09:00" -Days @("Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
Register-BotTask -TaskName "AI WhatsApp Learning Bot - Weekly Recap" -Script "src\jobs\sendWeeklyRecap.js" -Time "10:00" -Days @("Saturday")

