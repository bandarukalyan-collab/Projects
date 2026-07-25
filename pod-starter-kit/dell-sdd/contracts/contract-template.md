API Contract: User ID Endpoint

Endpoint: GET /api/userid
Version: 1.0
Date: 2025-04-22

## Overview

This API endpoint returns the user's ID as a JSON response. The user ID value is hardcoded for demo purposes.

## Request

### Method

GET

### Path

/api/userid

### Headers

None required

### Query Parameters

None

### Request Body

None

## Response

### Status Codes

- 200 OK: Request successful

### Response Body

Content-Type: application/json

```json
{
  "userid": "USR-001"
}
```

### Response Schema

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| userid | string | The user's ID | "USR-001" |

### Validation Rules

- userid must be a non-empty string
- Current implementation returns hardcoded value "USR-001"

## Error Handling

### Error Response Format

No errors are expected in the current implementation since the user ID value is hardcoded.

### Potential Future Errors

If dynamic user ID retrieval is implemented in the future, the following error scenarios should be considered:

- 404 Not Found: User ID not found for user
- 500 Internal Server Error: Database or service failure

## Examples

### Successful Response

**Request:**

```
GET /api/userid HTTP/1.1
Host: localhost:5000
```

**Response:**

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "userid": "USR-001"
}
```

## Usage Notes

- This endpoint follows the same pattern as the existing /api/username and /api/role endpoints
- The user ID value is currently hardcoded and does not change
- No authentication is required (demo application)
- No rate limiting is implemented
