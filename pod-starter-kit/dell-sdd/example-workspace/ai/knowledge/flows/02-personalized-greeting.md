# Flow 2: Personalized Greeting

> Demonstrates the API call with a name parameter.

## Sequence

```
Client                   hello-world-java
  |                            |
  |  GET /api/greeting?name=Alice
  |--------------------------->|
  |                            |  Validate name (1-100 chars)
  |                            |  Build message: "Hello, Alice!"
  |  200 OK                    |
  |  {"message": "Hello, Alice!"}
  |<---------------------------|
```

## Steps

1. Client sends `GET /api/greeting?name=Alice`.
2. API validates the `name` parameter (must be 1-100 characters).
3. API builds the greeting: `"Hello, Alice!"`
4. API returns HTTP 200 with JSON body: `{"message": "Hello, Alice!"}`

## Error Cases

| Condition | HTTP Status | Response |
|-----------|------------|----------|
| Name is empty string | 400 | `{"error": "Name must be 1-100 characters"}` |
| Name exceeds 100 chars | 400 | `{"error": "Name must be 1-100 characters"}` |
