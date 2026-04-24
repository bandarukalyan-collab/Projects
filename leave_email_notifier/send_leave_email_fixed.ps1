param(
    [string]$Date = $(Get-Date -Format 'yyyy-MM-dd'),
    [string]$To = 'Eswararao.Gadipudi@dell.com; Kiran.Kumar.Manchala@dell.com; Kalyan.Bandaru@dell.com',
    [string]$Cc = 'Rakesh.Dilly@dell.com',
    [string]$SubjectPrefix = "Today's Leave Snapshot"
)

$ErrorActionPreference = 'Stop'
$python = "c:/Windsurf-Test/.venv/Scripts/python.exe"
$script = "c:/Windsurf-Test/leave_email_notifier/daily_leave_email.py"
$log = "c:/Windsurf-Test/leave_email_notifier/logs/send_leave_email.log"

# Ensure logs directory exists
if (!(Test-Path "c:/Windsurf-Test/leave_email_notifier/logs")) {
    New-Item -ItemType Directory -Path "c:/Windsurf-Test/leave_email_notifier/logs" -Force
}

function Log([string]$message) {
    $timestamp = (Get-Date).ToString('s')
    Add-Content -Path $log -Value "[$timestamp] $message"
}

Log "START run for $Date"
Log "Recipients: $To"; if ($Cc) { Log "CC: $Cc" }

# Generate HTML body to a temp file
$tmp = New-TemporaryFile
try {
    & $python $script --date $Date --format html --output $tmp.FullName 2>&1 | ForEach-Object { Log "python: $_" }
    $html = Get-Content $tmp.FullName -Raw
} catch {
    Log "ERROR during python generation: $($_.Exception.Message)"
    throw
} finally {
    if (Test-Path $tmp.FullName) { Remove-Item $tmp -Force }
}

$subject = "$SubjectPrefix - $((Get-Date $Date).ToString('dd MMM yyyy'))"

try {
    Log "Preparing email with subject '$subject'"
    $outlook = New-Object -ComObject Outlook.Application
    $mail = $outlook.CreateItem(0)
    $mail.To = $To
    if ($Cc) { $mail.CC = $Cc }
    $mail.Subject = $subject
    $mail.HTMLBody = $html
    $mail.Send()
    Log "Sent successfully"
} catch {
    Log "ERROR: $($_.Exception.Message)"
    throw
} finally {
    Log "END run"
}
