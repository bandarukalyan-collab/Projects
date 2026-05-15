"""State management functions"""

import json
import os
from datetime import datetime

STATE_FILE = "ai_models_state.json"
CONFIG_FILE = "config.json"


def load_config():
    """Load email configuration"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"email_enabled": False, "smtp_server": "smtp.gmail.com",
            "smtp_port": 587, "sender_email": "", "sender_password": "",
            "recipient_email": ""}


def load_state():
    """Load previous state"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"last_check": None, "platforms": [], "coding_tools": []}


def save_state(current_data):
    """Save current state to file"""
    try:
        with open(STATE_FILE, 'w') as f:
            json.dump(current_data, f, indent=2)
        print("State saved. Run complete.")
    except Exception as e:
        print(f"Error saving state: {e}")


def log_changes(changes):
    """Log changes to a historical file"""
    if not changes:
        return
    
    log_file = "change_history.json"
    try:
        # Load existing history
        history = []
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                history = json.load(f)
        
        # Add new changes with timestamp
        for change in changes:
            history.append({
                "timestamp": datetime.now().isoformat(),
                "name": change["name"],
                "field": change["field"],
                "old_value": change.get("old_value", "N/A"),
                "new_value": change.get("new_value", "N/A")
            })
        
        # Keep only last 100 changes
        history = history[-100:]
        
        # Save history
        with open(log_file, 'w') as f:
            json.dump(history, f, indent=2)
        
        print(f"  Logged {len(changes)} changes to {log_file}")
    except Exception as e:
        print(f"  Error logging changes: {e}")


def detect_changes(old_state, new_data):
    """Detect changes between old and new state"""
    changes = []
    
    # Values to ignore as changes (placeholders from failed scrapes)
    ignore_values = ["Unknown", "Not publicly listed", "Depends on selected model", "Varies by model", "N/A"]
    
    # Check platform changes
    old_platforms = {p["name"]: p for p in old_state.get("platforms", [])}
    for new_platform in new_data["platforms"]:
        name = new_platform["name"]
        if name in old_platforms:
            old_platform = old_platforms[name]
            for key in ["latest_model", "context_window", "best_for", "max_output", "notes"]:
                old_val = old_platform.get(key)
                new_val = new_platform.get(key)
                if old_val != new_val:
                    # Ignore changes where new value is a placeholder
                    if new_val in ignore_values:
                        continue
                    changes.append({
                        "type": "platform",
                        "name": name,
                        "field": key,
                        "old": old_val,
                        "new": new_val
                    })
        else:
            # Only add as new if it has real data (not placeholders)
            if new_platform.get("latest_model") not in ignore_values:
                changes.append({
                    "type": "platform",
                    "name": name,
                    "field": "new",
                    "old": "N/A",
                    "new": "Added"
                })
    
    # Check coding tools changes
    old_tools = {t["name"]: t for t in old_state.get("coding_tools", [])}
    for new_tool in new_data["coding_tools"]:
        name = new_tool["name"]
        if name in old_tools:
            old_tool = old_tools[name]
            for key in ["latest_model", "context_window", "best_for", "max_output", "notes"]:
                old_val = old_tool.get(key)
                new_val = new_tool.get(key)
                if old_val != new_val:
                    # Ignore changes where new value is a placeholder
                    if new_val in ignore_values:
                        continue
                    changes.append({
                        "type": "coding_tool",
                        "name": name,
                        "field": key,
                        "old": old_val,
                        "new": new_val
                    })
        else:
            # Only add as new if it has real data (not placeholders)
            if new_tool.get("latest_model") not in ignore_values:
                changes.append({
                    "type": "coding_tool",
                    "name": name,
                    "field": "new",
                    "old": "N/A",
                    "new": "Added"
                })
    
    return changes
