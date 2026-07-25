# Dell CA Certificate Bundle

Place the Dell corporate root/intermediate CA certificate(s) here as `dell-ca.crt` (PEM format).

This file is used by `setup.py` to verify TLS connections to internal Dell Atlassian
instances (Jira, Confluence) during OAuth token exchange.

**How to export from Windows:**

1. Open `certmgr.msc` (Certificate Manager).
2. Navigate to **Trusted Root Certification Authorities → Certificates**.
3. Find the Dell root CA (e.g. "Dell Inc Root Certificate Authority 2").
4. Right-click → **All Tasks → Export** → Base-64 encoded X.509 (.CER).
5. Rename the exported file to `dell-ca.crt` and place it in this directory.

If multiple intermediate CAs are needed, concatenate them into a single PEM file:

```bash
cat root-ca.crt intermediate-ca.crt > dell-ca.crt
```
