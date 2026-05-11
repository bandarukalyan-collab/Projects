#!/usr/bin/env python3
"""
AI Model Tracker - Scheduler
Simple scheduler that runs from terminal
"""

import os
import sys
import time
import subprocess
from datetime import datetime, timedelta

def run_tracker():
    """Run AI model tracker"""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Running AI Model Tracker...")
    
    try:
        # Run the AI tracker script
        script_path = r"ai_tracker.py"
        
        result = subprocess.run(
            ["python", script_path],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            print("AI Model Tracker completed successfully!")
            print(result.stdout)
            return True
        else:
            print(f"AI Model Tracker failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error running AI Model Tracker: {e}")
        return False

def run_weekday_scheduler():
    """Run weekday scheduler (Mon-Fri at 11 AM)"""
    target_hour = 11  # 11 AM
    target_days = [0, 1, 2, 3, 4]  # Monday=0, Tuesday=1, ..., Friday=4
    
    print("=== AI Model Tracker - Scheduler ===")
    print(f"Running Mon-Fri at {target_hour}:00 AM")
    print("Press Ctrl+C to stop")
    print()
    
    while True:
        try:
            now = datetime.now()
            
            # Check if it's a weekday and time to run
            if now.weekday() in target_days and now.hour == target_hour and now.minute < 5:
                print(f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Running weekday AI Model Tracker check...")
                run_tracker()
                print("Daily check completed. Waiting until next scheduled run...")
                
                # Wait until next day
                time.sleep(3600 * 24)
            else:
                # Calculate time until next check
                next_check = now.replace(hour=target_hour, minute=0, second=0, microsecond=0)
                
                # If today is not a weekday or time has passed, move to next weekday
                while next_check.weekday() not in target_days or next_check <= now:
                    next_check += timedelta(days=1)
                
                time_until_check = (next_check - now).total_seconds()
                hours = int(time_until_check // 3600)
                minutes = int((time_until_check % 3600) // 60)
                
                print(f"Next check in {hours}h {minutes}m at {next_check.strftime('%Y-%m-%d %H:%M')} ({next_check.strftime('%A')})")
                time.sleep(min(3600, time_until_check))
                
        except KeyboardInterrupt:
            print("\nScheduler stopped by user")
            break
        except Exception as e:
            print(f"Scheduler error: {e}")
            time.sleep(300)

def run_immediate_check():
    """Run immediate AI model tracker check"""
    print("=== AI Model Tracker - Immediate Check ===")
    print()
    
    success = run_tracker()
    
    if success:
        print("\nAI Model Tracker completed successfully!")
    else:
        print("\nFailed to run AI Model Tracker. Check logs for details.")

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        run_immediate_check()
    else:
        run_weekday_scheduler()

if __name__ == "__main__":
    main()
