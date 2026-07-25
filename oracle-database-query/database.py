"""Oracle database connection handler"""

import oracledb
from config import DatabaseConfig
import sys
import io
import ctypes
import os
import threading
import time
from ctypes import wintypes

# Initialize thick mode for OS Authentication support
try:
    oracledb.init_oracle_client()
except Exception:
    pass


def auto_select_edge_account():
    """Click the already highlighted Azure account row."""
    if os.getenv("ORACLE_AUTO_SELECT_ACCOUNT", "1").lower() in ("0", "false", "no"):
        return

    def worker():
        user32 = ctypes.windll.user32
        delay = float(os.getenv("ORACLE_AUTO_SELECT_DELAY", "5"))
        time.sleep(delay)

        screen_width = user32.GetSystemMetrics(0)
        screen_height = user32.GetSystemMetrics(1)
        click_x = int(screen_width * 0.50)
        click_y = int(screen_height * 0.52)

        for attempt in range(1, 11):
            user32.SetCursorPos(click_x, click_y)
            time.sleep(0.1)
            user32.mouse_event(0x0002, 0, 0, 0, 0)
            user32.mouse_event(0x0004, 0, 0, 0, 0)
            time.sleep(1)

    threading.Thread(target=worker, daemon=True).start()


class OracleDatabase:
    """Oracle database connection and query handler"""

    def __init__(self):
        self.connection = None
        self.cursor = None

    def connect(self, db_name=None, tns_alias=None, tns_string=None):
        """Establish connection to Oracle database using OS Authentication"""
        try:
            # Use provided TNS or default from config
            alias_to_use = tns_alias or DatabaseConfig.DATABASES.get('EFDRP', {}).get('tns_alias')
            string_to_use = tns_string or DatabaseConfig.DATABASES.get('EFDRP', {}).get('tns_string')

            auto_select_edge_account()

            # Suppress output during connection
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            sys.stdout = io.StringIO()
            sys.stderr = io.StringIO()

            try:
                # Method 1: Try with externalauth parameter
                self.connection = oracledb.connect(
                    dsn=alias_to_use,
                    externalauth=True
                )
                self.cursor = self.connection.cursor()
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                return True
            except Exception:
                pass

            try:
                # Method 2: Try without user/password (let OS auth handle it)
                self.connection = oracledb.connect(
                    dsn=alias_to_use
                )
                self.cursor = self.connection.cursor()
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                return True
            except Exception:
                pass

            try:
                # Method 3: Full TNS string with externalauth
                self.connection = oracledb.connect(
                    dsn=string_to_use,
                    externalauth=True
                )
                self.cursor = self.connection.cursor()
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                return True
            except Exception:
                pass

            # Method 4: Full TNS string without credentials
            self.connection = oracledb.connect(
                dsn=string_to_use
            )
            self.cursor = self.connection.cursor()
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            return True

        except oracledb.DatabaseError as e:
            error, = e.args
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            print(f"Oracle Error: {error.code}")
            print(f"Oracle Error Message: {error.message}")
            return False
        except Exception as e:
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            print(f"Connection Error: {str(e)}")
            return False
    
    def execute_query(self, query):
        """Execute a SQL query and return results"""
        if not self.connection:
            return None
        
        try:
            self.cursor.execute(query)
            
            # Fetch column names
            columns = [desc[0] for desc in self.cursor.description]
            
            # Fetch all rows
            rows = self.cursor.fetchall()
            
            return {
                'columns': columns,
                'rows': rows
            }
            
        except oracledb.DatabaseError as e:
            error, = e.args
            print(f"Query Error: {error.code}")
            print(f"Query Error Message: {error.message}")
            return None
        except Exception as e:
            print(f"Query Error: {str(e)}")
            return None
    
    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
