import pandas as pd
from pathlib import Path
from datetime import datetime, date
import argparse

TRACKER_PATH = Path(r"C:/Users/Kalyan_Bandaru/Dell Technologies/Ops Engineering - Sai Staff/FY27_SaiStaff-LeaveTracker.xlsx")
DEFAULT_TIMEZONE = "local"  # adjust if you want fixed TZ handling

# Codes that indicate “not a leave day”
NON_LEAVE_CODES = {"WO", ""}


def month_sheet_for(dt: date) -> str:
    return dt.strftime("%b-%Y").upper()  # e.g., APR-2025


def load_sheet(dt: date):
    sheet = month_sheet_for(dt)
    xl = pd.ExcelFile(TRACKER_PATH)
    if sheet not in xl.sheet_names:
        raise ValueError(f"Sheet {sheet} not found; available: {xl.sheet_names}")
    return xl.parse(sheet)


def find_today_leaves(df: pd.DataFrame, dt: date):
    # First row contains the dates; data starts from row 1.
    leaves = []
    date_row = df.iloc[0]
    data = df.iloc[1:]
    name_col = df.columns[0]

    for col in df.columns[1:]:
        raw_date = date_row[col]
        col_date = None
        if isinstance(raw_date, (pd.Timestamp, datetime)):
            col_date = raw_date.date()
        else:
            try:
                col_date = pd.to_datetime(raw_date).date()
            except Exception:
                continue
        if col_date != dt:
            continue

        for _, row in data.iterrows():
            name = str(row[name_col]).strip()
            if not name or name.lower() in {"nan", "name"}:
                continue
            val = row[col]
            if pd.isna(val):
                continue
            code = str(val).strip()
            if not code or code.upper() in NON_LEAVE_CODES:
                continue
            leaves.append((name, code))
    return leaves


def format_email(leaves, dt: date):
    if not leaves:
        return f"No team leaves recorded for {dt:%d %b %Y}."
    lines = [f"Team leaves for {dt:%d %b %Y}:", ""]
    for name, code in leaves:
        lines.append(f"- {name} - {code}")
    lines.append("\nPlease update the tracker if anything is missing.")
    return "\n".join(lines)


def format_email_html(leaves, dt: date):
    title = f"Team leave for {dt:%d %b %Y}"
    if not leaves:
        body = "<p style=\"margin:0;color:#475569;\">No team leaves recorded.</p>"
    else:
        items = "".join(
            f"<li style='margin:6px 0;'><span style='font-weight:600;'>{name}</span> - {code}</li>"
            for name, code in leaves
        )
        body = f"<ul style=\"padding-left:18px;margin:8px 0 0 0;color:#0f172a;\">{items}</ul>"

    return f"""
<div style="font-family:'Segoe UI',sans-serif; color:#1f2933; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e5e7eb; max-width:520px;">
  <h2 style="margin:0 0 8px 0; color:#0f172a;">{title}</h2>
  <p style="margin:0 0 12px 0; color:#334155;">Here is the snapshot for planning and coverage.</p>
  {body}
  <p style="margin:16px 0 0 0; color:#475569;">If anything changed, reply with an update.</p>
</div>
"""


def main():
    parser = argparse.ArgumentParser(description="Generate daily leave email body.")
    parser.add_argument("--date", help="Target date YYYY-MM-DD (default: today)")
    parser.add_argument("--format", choices=["text", "html"], default="text", help="Output format")
    parser.add_argument("--output", help="Write output to file instead of stdout")
    args = parser.parse_args()

    target = date.today()
    if args.date:
        target = datetime.strptime(args.date, "%Y-%m-%d").date()

    df = load_sheet(target)
    leaves = find_today_leaves(df, target)
    if args.format == "html":
        email_body = format_email_html(leaves, target)
    else:
        email_body = format_email(leaves, target)

    if args.output:
        Path(args.output).write_text(email_body, encoding="utf-8")
    else:
        print(email_body)


if __name__ == "__main__":
    main()
