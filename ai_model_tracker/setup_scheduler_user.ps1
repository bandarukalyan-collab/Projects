# AI Model Tracker - Scheduler Setup (Current User)
# This script creates a Windows Scheduled Task for daily AI model tracking (Mon-Fri at 11 AM)
# Runs under current user account (no admin privileges required)

Write-Host "=== AI Model Tracker - Scheduler Setup (Current User) ===" -ForegroundColor Green
Write-Host ""

# Remove existing task if it exists
Write-Host "Removing any existing scheduled task..." -ForegroundColor Blue
Get-ScheduledTask -TaskName "AI Model Tracker" -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false

# Create new scheduled task
Write-Host "Creating scheduled task for daily monitoring..." -ForegroundColor Blue

$action = New-ScheduledTaskAction -Execute "python.exe" -Argument "c:\Windsurf-Test\ai_model_tracker\main.py"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 11:00AM
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal -TaskName "AI Model Tracker" -Description "Automated AI model tracking and alerting (Mon-Fri at 11 AM)" -Force

Write-Host "Scheduled task created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Task Details:" -ForegroundColor Yellow
Write-Host "- Name: AI Model Tracker"
Write-Host "- Schedule: Monday-Friday at 11:00 AM"
Write-Host "- Action: Run AI model tracker"
Write-Host "- User: $env:USERNAME (requires user to be logged in)"
Write-Host ""

Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your AI Model Tracker will now run automatically Monday-Friday at 11:00 AM" -ForegroundColor Cyan
Write-Host "Note: This task requires you to be logged in to run" -ForegroundColor Yellow
Write-Host ""
Write-Host "To modify schedule:" -ForegroundColor Yellow
Write-Host "1. Open Task Scheduler"
Write-Host "2. Find 'AI Model Tracker' task"
Write-Host "3. Right-click and select Properties"
Write-Host "4. Go to Triggers tab to modify time/days"
Write-Host ""
Write-Host "To run manually:" -ForegroundColor Yellow
Write-Host "1. Run: python c:\Windsurf-Test\ai_model_tracker\ai_tracker.py"
Write-Host "2. Or from Task Scheduler: Right-click task and select Run"
Write-Host ""
