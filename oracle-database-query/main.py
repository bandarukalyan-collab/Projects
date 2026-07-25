"""Oracle multi-database query tool with OS Authentication support"""

from database import OracleDatabase
from config import DatabaseConfig
from datetime import datetime
import pytz
import os
import time
import mss
import ctypes
from ctypes import wintypes
import sys
from PIL import Image


def get_console_window_rect():
    """Get console window position and size"""
    try:
        hwnd = ctypes.windll.kernel32.GetConsoleWindow()
        rect = ctypes.wintypes.RECT()
        ctypes.windll.user32.GetWindowRect(hwnd, ctypes.byref(rect))
        return {
            'left': rect.left,
            'top': rect.top,
            'right': rect.right,
            'bottom': rect.bottom,
            'width': rect.right - rect.left,
            'height': rect.bottom - rect.top
        }
    except Exception:
        return None


def bring_console_to_foreground():
    """Bring console window to foreground on Windows"""
    try:
        ctypes.windll.user32.SetForegroundWindow(ctypes.windll.kernel32.GetConsoleWindow())
    except Exception:
        pass


def take_screenshot(db_name, results=None):
    """Capture screenshot of current screen and save with database name"""
    try:
        # Bring console to foreground before screenshot
        bring_console_to_foreground()

        # Create screenshots directory if it doesn't exist
        screenshot_dir = "screenshots"
        if not os.path.exists(screenshot_dir):
            os.makedirs(screenshot_dir)

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{screenshot_dir}/{db_name}_{timestamp}.png"

        # Small delay to ensure window is in focus
        time.sleep(0.5)

        # Capture screenshot
        with mss.MSS() as sct:
            # Capture primary monitor
            monitor = sct.monitors[0]
            screenshot = sct.grab(monitor)
            mss.tools.to_png(screenshot.rgb, screenshot.size, output=filename)

        print(f"Screenshot saved: {filename}")
        return filename
    except Exception as e:
        print(f"Screenshot capture failed: {str(e)}")
        return None


def save_output_to_file(db_name, results):
    """Save query results to text file for evidence"""
    try:
        # Create screenshots directory if it doesn't exist
        output_dir = "screenshots"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"{output_dir}/{db_name}_{timestamp}.txt"

        # Get current timestamp in IST (local time)
        ist_tz = pytz.timezone('Asia/Kolkata')
        ist_time = datetime.now(ist_tz).strftime("%Y-%m-%d %H:%M:%S")

        # Get current timestamp in CST (Central Time)
        cst_tz = pytz.timezone('America/Chicago')
        cst_time = datetime.now(cst_tz).strftime("%Y-%m-%d %H:%M:%S")

        with open(output_file, 'w') as f:
            f.write("=" * 100 + "\n")
            f.write(f"Database: {db_name} | CST: {cst_time} | IST: {ist_time}\n")
            f.write("=" * 100 + "\n\n")

            if results:
                columns = results['columns']
                rows = results['rows']

                # Write column headers
                header = " | ".join(columns)
                f.write(header + "\n")
                f.write("-" * len(header) + "\n")

                # Write rows
                for row in rows:
                    formatted_row = " | ".join(str(col) if col is not None else "NULL" for col in row)
                    f.write(formatted_row + "\n")

                f.write(f"\nTotal rows returned: {len(rows)}\n")
                f.write("=" * 100 + "\n")

        print(f"Output saved: {output_file}")
        return output_file
    except Exception as e:
        print(f"Output save failed: {str(e)}")
        return None


def print_results(results, db_name=""):
    """Format and print query results"""
    if not results:
        return

    columns = results['columns']
    rows = results['rows']

    # Get current timestamp in IST (local time)
    ist_tz = pytz.timezone('Asia/Kolkata')
    ist_time = datetime.now(ist_tz).strftime("%Y-%m-%d %H:%M:%S")

    # Get current timestamp in CST (Central Time)
    cst_tz = pytz.timezone('America/Chicago')
    cst_time = datetime.now(cst_tz).strftime("%Y-%m-%d %H:%M:%S")

    print("\n" + "=" * 100)
    print(f"Database: {db_name} | CST: {cst_time} | IST: {ist_time}")
    print("=" * 100)

    # Print column headers
    header = " | ".join(columns)
    print(header)
    print("-" * len(header))

    # Print rows
    for row in rows:
        formatted_row = " | ".join(str(col) if col is not None else "NULL" for col in row)
        print(formatted_row)

    print(f"\nTotal rows returned: {len(rows)}")
    print("=" * 100)

    # Flush output to ensure it's rendered
    import sys
    sys.stdout.flush()
    sys.stderr.flush()

    # Add delay to ensure output is fully rendered before screenshot
    time.sleep(1)

    # Take screenshot
    take_screenshot(db_name)


def main():
    """Main function to run Oracle query on single or multiple databases"""

    # Query to execute
    query = """
    SELECT a.instance_name, a.host_name, a.startup_time,
           a.database_status, a.instance_role, a.database_type
    FROM GV$INSTANCE a ORDER BY 1
    """

    # Check if a specific database name is provided as command-line argument
    import sys
    import time
    if len(sys.argv) > 1:
        # Run for specific database only
        db_name = sys.argv[1]
        if db_name not in DatabaseConfig.DATABASES:
            print(f"Database '{db_name}' not found in configuration")
            return

        db_config = DatabaseConfig.DATABASES[db_name]

        # Start timing
        start_time = time.time()

        # Create database instance
        db = OracleDatabase()

        # Connect to database
        if not db.connect(
            db_name=db_name,
            tns_alias=db_config['tns_alias'],
            tns_string=db_config['tns_string']
        ):
            print(f"\n{'=' * 100}")
            print(f"DATABASE: {db_name} - CONNECTION FAILED")
            print(f"{'=' * 100}\n")
            return

        # Execute query
        results = db.execute_query(query)

        # Print results
        if results:
            print_results(results, db_name)
        else:
            print(f"\n{'=' * 100}")
            print(f"DATABASE: {db_name} - NO RESULTS")
            print(f"{'=' * 100}\n")

        # Close connection
        db.close()

        # End timing
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"Execution time: {elapsed_time:.2f} seconds")
    else:
        # Run for all databases (legacy behavior)
        for db_name, db_config in DatabaseConfig.DATABASES.items():
            # Create database instance
            db = OracleDatabase()

            # Connect to database
            if not db.connect(
                db_name=db_name,
                tns_alias=db_config['tns_alias'],
                tns_string=db_config['tns_string']
            ):
                print(f"\n{'=' * 100}")
                print(f"DATABASE: {db_name} - CONNECTION FAILED")
                print(f"{'=' * 100}\n")
                continue

            # Execute query
            results = db.execute_query(query)

            # Print results
            if results:
                print_results(results, db_name)
            else:
                print(f"\n{'=' * 100}")
                print(f"DATABASE: {db_name} - NO RESULTS")
                print(f"{'=' * 100}\n")

            # Close connection
            db.close()


if __name__ == "__main__":
    main()
