# AI Model Tracker - Automatic Scheduler Setup
# This script creates a Windows Scheduled Task for daily AI model tracking (Mon-Fri at 11 AM)

Write-Host "=== AI Model Tracker - Scheduler Setup ===" -ForegroundColor Green
Write-Host ""

# Remove existing task if it exists
Write-Host "Removing any existing scheduled task..." -ForegroundColor Blue
Get-ScheduledTask -TaskName "AI Model Tracker" -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false

# Create new scheduled task
Write-Host "Creating scheduled task for daily monitoring..." -ForegroundColor Blue

$action = New-ScheduledTaskAction -Execute "python.exe" -Argument "c:\Windsurf-Test\ai_model_tracker\ai_tracker.py"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 11:00AM
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount

Register-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal -TaskName "AI Model Tracker" -Description "Automated AI model tracking and alerting (Mon-Fri at 11 AM)" -Force

Write-Host "Scheduled task created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Task Details:" -ForegroundColor Yellow
Write-Host "- Name: AI Model Tracker"
Write-Host "- Schedule: Monday-Friday at 11:00 AM"
Write-Host "- Action: Run AI model tracker"
Write-Host "- User: SYSTEM (runs even when not logged in)"
Write-Host ""

# Test the task immediately
Write-Host "Testing the scheduled task..." -ForegroundColor Blue
Start-ScheduledTask -TaskName "AI Model Tracker"

# Wait a moment and check status
Start-Sleep -Seconds 5
$task = Get-ScheduledTask -TaskName "AI Model Tracker"
if ($task.State -eq "Running") {
    Write-Host "Task is running successfully!" -ForegroundColor Green
} else {
    Write-Host "Task completed or failed to start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your AI Model Tracker will now run automatically Monday-Friday at 11:00 AM" -ForegroundColor Cyan
Write-Host "No manual intervention required!" -ForegroundColor Cyan
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
