"""Email generation and sending functions"""

import smtplib
from email.mime.text import MIMEText
from email.utils import formatdate
from datetime import datetime
import os

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EMAIL_TEMPLATE = os.path.join(SCRIPT_DIR, "email_template.html")


def generate_html_email(changes, current_data, news_items=None):
    """Generate HTML email content"""
    # Load template
    with open(EMAIL_TEMPLATE, 'r', encoding='utf-8') as f:
        template = f.read()
    
    date_str = datetime.now().strftime('%Y-%m-%d')
    
    # Build a set of changed item names and fields
    changed_items = {}
    for change in changes:
        name = change['name']
        if name not in changed_items:
            changed_items[name] = []
        changed_items[name].append(change['field'])
    
    # Generate changes section (empty now, but keeping placeholder for compatibility)
    changes_section = ""
    
    # Values to filter out (placeholders from failed scrapes)
    ignore_values = ["Unknown", "Not publicly listed", "Depends on selected model", "Varies by model", "N/A"]
    
    # Generate platforms table rows with highlighting
    platforms_rows = ""
    for platform in current_data["platforms"]:
        # Skip platforms with placeholder values in critical fields
        latest_model = platform.get("latest_model", "")
        if latest_model.strip() in ignore_values:
            continue
        
        row_class = 'changed-row' if platform['name'] in changed_items else ''
        name_cell = f'<td class="changed-cell">{platform["name"]}</td>' if platform['name'] in changed_items else f'<td>{platform["name"]}</td>'
        
        platforms_rows += f"""
        <tr class="{row_class}">
            {name_cell}
            <td>{platform['type']}</td>
            <td>{platform['latest_model']}</td>
            <td>{platform['best_for']}</td>
            <td>{platform['context_window']}</td>
            <td>{platform['notes']}</td>
        </tr>
        """
    
    # Generate coding tools table rows with highlighting
    coding_tools_rows = ""
    for tool in current_data["coding_tools"]:
        # Skip tools with placeholder values in critical fields
        latest_model = tool.get("latest_model", "")
        if latest_model.strip() in ignore_values:
            continue
        
        row_class = 'changed-row' if tool['name'] in changed_items else ''
        name_cell = f'<td class="changed-cell">{tool["name"]}</td>' if tool['name'] in changed_items else f'<td>{tool["name"]}</td>'
        
        coding_tools_rows += f"""
        <tr class="{row_class}">
            {name_cell}
            <td>{tool['type']}</td>
            <td>{tool['latest_model']}</td>
            <td>{tool['best_for']}</td>
            <td>{tool['context_window']}</td>
            <td>{tool['notes']}</td>
        </tr>
        """
    
    # Generate AI news section
    news_section = ""
    if news_items and len(news_items) > 0:
        news_section = '<div class="section"><h2>Today\'s AI News</h2><ul style="list-style: none; padding: 0;">'
        for news in news_items[:10]:
            category_display = f' <span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">{news["category"]}</span>' if news.get("category") else ""
            if news["url"]:
                news_section += f'<li style="margin-bottom: 12px; padding: 10px; background: #ffffff; border-radius: 4px;"><a href="{news["url"]}" style="color: #d97706; text-decoration: none; font-weight: 500;">{news["headline"]}</a>{category_display}</li>'
            else:
                news_section += f'<li style="margin-bottom: 12px; padding: 10px; background: #ffffff; border-radius: 4px;">{news["headline"]}{category_display}</li>'
        news_section += '</ul></div>'
    else:
        news_section = '<div class="section"><h2>Today\'s AI News</h2><p>No AI news available at this time.</p></div>'
    
    # Replace placeholders
    html_content = template.replace("{date}", date_str)
    html_content = html_content.replace("{platforms_table}", platforms_rows)
    html_content = html_content.replace("{coding_tools_table}", coding_tools_rows)
    html_content = html_content.replace("{news_section}", news_section)
    
    return html_content


def send_email_outlook(html_content, config, changes):
    """Send HTML email using Outlook COM Object (for Dell mail)"""
    try:
        import win32com.client
        
        outlook = win32com.client.Dispatch("Outlook.Application")
        mail = outlook.CreateItem(0)  # 0 = MailItem
        
        mail.To = config.get("recipient_email", "")
        if config.get("cc_email"):
            mail.CC = config["cc_email"]
        
        # Dynamic subject based on changes
        date_str = datetime.now().strftime('%Y-%m-%d')
        
        subject = f"AI News - AI Model Tracker - {date_str}"
        
        mail.Subject = subject
        mail.HTMLBody = html_content
        
        mail.Send()
        print("Email sent successfully via Outlook")
        return True
    except ImportError:
        print("Error: pywin32 not installed. Run: pip install pywin32")
        return False
    except Exception as e:
        print(f"Error sending email via Outlook: {e}")
        return False


def send_email_smtp(html_content, config, changes):
    """Send HTML email using SMTP"""
    if not config["sender_email"] or not config["sender_password"]:
        print("Sender email or password not configured")
        return False
    
    try:
        msg = MIMEText(html_content, 'html')
        msg['From'] = config["sender_email"]
        msg['To'] = config["recipient_email"]
        
        # Dynamic subject based on changes
        date_str = datetime.now().strftime('%Y-%m-%d')
        
        msg['Subject'] = f"AI News - AI Model Tracker - {date_str}"
        
        server = smtplib.SMTP(config["smtp_server"], config["smtp_port"])
        server.starttls()
        server.login(config["sender_email"], config["sender_password"])
        server.send_message(msg)
        server.quit()
        
        print("Email sent successfully via SMTP")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_email(html_content, config, changes):
    """Send HTML email using configured method"""
    if not config["email_enabled"]:
        print("Email not enabled in config")
        return False
    
    # Use Outlook if configured, otherwise use SMTP
    if config.get("use_outlook", False):
        return send_email_outlook(html_content, config, changes)
    else:
        return send_email_smtp(html_content, config, changes)
