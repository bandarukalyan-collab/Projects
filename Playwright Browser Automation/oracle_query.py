import cx_Oracle
import sys

# Oracle connection details
# Converted from JDBC format to Python format
dsn = cx_Oracle.makedsn(
    host="efdrppr-cname.us.dell.com",
    port=1523,
    service_name="efdrp.prd.emea.dell.com"
)

# You'll need to provide username and password
username = input("Enter Oracle username: ")
password = input("Enter Oracle password: ")

try:
    # Establish connection
    print("Connecting to Oracle database...")
    connection = cx_Oracle.connect(username, password, dsn)
    
    # Create cursor
    cursor = connection.cursor()
    
    # Execute query
    query = """
    SELECT a.instance_name, a.host_name, a.startup_time, 
           a.database_status, a.instance_role, a.database_type 
    FROM GV$INSTANCE a
    """
    
    print("Executing query...")
    cursor.execute(query)
    
    # Fetch and display results
    print("\nQuery Results:")
    print("-" * 100)
    
    # Print column headers
    columns = [desc[0] for desc in cursor.description]
    print(f"{' | '.join(columns)}")
    print("-" * 100)
    
    # Print rows
    for row in cursor:
        print(f"{' | '.join(str(col) if col is not None else 'NULL' for col in row)}")
    
    # Close cursor and connection
    cursor.close()
    connection.close()
    print("\nQuery executed successfully!")
    
except cx_Oracle.DatabaseError as e:
    error, = e.args
    print(f"Oracle Error: {error.code}")
    print(f"Oracle Error Message: {error.message}")
    sys.exit(1)
    
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)
