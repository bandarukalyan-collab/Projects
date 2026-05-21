import msal
import requests

# TODO: Replace with your Entra (Azure AD) IDs before running
TENANT_ID = "945c199a-83a2-4e80-9f8c-5a91be5752dd"
CLIENT_ID = "681fb9b6-ab53-4c0b-b2c1-5f0009ef5197"

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["https://graph.microsoft.com/Mail.Read"]
GRAPH_ROOT = "https://graph.microsoft.com/v1.0"
REDIRECT_URI = "http://localhost"  # Make sure this is added as a redirect URI (Public client / mobile & desktop)


def get_token():
    """Interactive (browser-based) auth and return an access token."""
    app = msal.PublicClientApplication(CLIENT_ID, authority=AUTHORITY)
    result = app.acquire_token_interactive(
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI,
        prompt="select_account",
    )
    if "access_token" not in result:
        raise RuntimeError(f"Token error: {result}")
    return result["access_token"]


def fetch_all_messages(token):
    """Yield all messages across the mailbox."""
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{GRAPH_ROOT}/me/messages?$top=50"  # adjust page size if needed
    while url:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        for msg in data.get("value", []):
            yield {
                "id": msg.get("id"),
                "subject": msg.get("subject"),
                "from": msg.get("from", {}).get("emailAddress", {}).get("address"),
                "received": msg.get("receivedDateTime"),
                "snippet": msg.get("bodyPreview"),
            }
        url = data.get("@odata.nextLink")


def main():
    token = get_token()
    for i, msg in enumerate(fetch_all_messages(token), start=1):
        print(f"\n#{i}")
        print(f"From: {msg['from']}")
        print(f"Received: {msg['received']}")
        print(f"Subject: {msg['subject']}")
        print(f"Preview: {msg['snippet']}")


if __name__ == "__main__":
    main()
