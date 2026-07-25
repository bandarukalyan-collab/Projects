# Oracle Multi-Database Query Tool

A Python-based tool for querying multiple Oracle databases using OS Authentication (SSO) with support for TNS aliases, failover, and SSL/TLS connections.

## Features

- **OS Authentication (SSO)**: Uses external authentication without requiring explicit username/password
- **Multi-Database Support**: Query multiple Oracle databases with a single execution
- **Failover Support**: TNS aliases configured with multiple hosts for high availability
- **SSL/TLS**: Secure connections using TCPS protocol with certificate verification
- **Dual Timezone Output**: Results display timestamps in both IST and CST timezones
- **Clean Output**: Professional formatting suitable for team evidence

## Prerequisites

- Python 3.8+
- Oracle Instant Client (for OS Authentication support)
- Oracle Client libraries accessible in system PATH
- OS Authentication configured for Oracle databases
- Valid TNS entries in `tnsnames.ora` or full TNS strings in config

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure Oracle Instant Client is installed and accessible:
   - Download from Oracle website
   - Extract and add to system PATH
   - Or set `ORACLE_HOME` environment variable

3. Configure TNS aliases in your `tnsnames.ora` file

## Configuration

Edit `config.py` to add database configurations:
```python
DATABASES = {
    'DB_NAME': {
        'tns_alias': 'TNS_ALIAS',
        'tns_string': '(DESCRIPTION=...)'
    }
}
```

## Usage

### Run with Filtered Output (Recommended)

Use the provided batch file to hide Oracle authentication messages:
```bash
.\run_query.bat
```

This filters out "Please complete the authentication process through the browser" messages while showing query results.

### Run Directly
```bash
python main.py
```

Note: Running directly will show Oracle authentication messages.

## Query

The default query retrieves instance information:
```sql
SELECT a.instance_name, a.host_name, a.startup_time,
       a.database_status, a.instance_role, a.database_type
FROM GV$INSTANCE a ORDER BY 1
```

To modify the query, edit the `query` variable in `main.py`.

## Output Format

```
====================================================================================================
Database: EFDRP | CST: 2026-06-30 11:15:59 | IST: 2026-06-30 21:45:59
====================================================================================================
INSTANCE_NAME | HOST_NAME | STARTUP_TIME | DATABASE_STATUS | INSTANCE_ROLE | DATABASE_TYPE
------------------------------------------------------------------------------------------
efdrp1 | udmplors3pr6e01.amer.dell.com | 2026-05-24 19:38:48 | ACTIVE | PRIMARY_INSTANCE | RAC
...

Total rows returned: 8
====================================================================================================
```

## Project Structure

```
oracle-database-query/
├── config.py              # Database configurations
├── database.py            # Oracle connection handler
├── main.py                # Main script
├── requirements.txt       # Python dependencies
├── .env.example           # Configuration template
├── .gitignore            # Git ignore rules
├── run_query.bat         # Batch file for filtered output
└── README.md             # This file
```

## Troubleshooting

### OS Authentication Issues
- Ensure Oracle Instant Client is installed and accessible
- Verify OS user has proper Oracle authentication permissions
- Check Oracle client library versions match database version

### Connection Failures
- Verify TNS alias exists in `tnsnames.ora`
- Check network connectivity to Oracle hosts
- Ensure SSL/TLS certificates are valid
- Verify firewall allows connections to Oracle ports

### Import Errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Oracle Instant Client is in system PATH
- Verify Python version compatibility (3.8+)

## Security Notes

- OS Authentication relies on system-level security
- No credentials are stored in code or configuration files
- SSL/TLS ensures encrypted connections
- TNS strings should be kept confidential
- `.env` file is excluded from version control
