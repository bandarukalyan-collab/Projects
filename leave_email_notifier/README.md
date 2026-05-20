# Leave Email Notifier

A Python script that checks an Excel tracker for team leaves and generates email notifications.

## Features

- Reads team leave data from Excel tracker
- Generates daily leave notifications
- Supports both text and HTML email formats
- Configurable target date
- Output to file or stdout

## Files

- `daily_leave_email.py` - Main script to generate leave notifications
- `mail_dump.py` - Email utilities
- `send_leave_email_fixed.ps1` - PowerShell script for sending emails

## Installation

Install required dependencies:
```bash
pip install pandas openpyxl
```

## Configuration

Update the Excel tracker path in `daily_leave_email.py`:
```python
TRACKER_PATH = Path(r"C:/path/to/your/tracker.xlsx")
```

## Usage

### Generate today's leave notification (text format):
```bash
python daily_leave_email.py
```

### Generate for a specific date:
```bash
python daily_leave_email.py --date 2025-05-20
```

### Generate HTML format:
```bash
python daily_leave_email.py --format html
```

### Save to file:
```bash
python daily_leave_email.py --output leave_notification.txt
```

### Send email via PowerShell:
```powershell
.\send_leave_email_fixed.ps1
```

## Excel Tracker Format

The Excel file should have:
- Monthly sheets (e.g., "APR-2025", "MAY-2025")
- First row containing dates
- First column containing names
- Leave codes in cells (non-leave codes: "WO", empty)

## Notes

- The script uses a hardcoded path to the Excel tracker - update it for your environment
- Leave codes are case-insensitive
- Supports local timezone handling
