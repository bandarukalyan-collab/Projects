# Flow 1: Default Greeting

> Demonstrates the simplest API call — no parameters.

## Sequence

```
Client                   hello-world-java
  |                            |
  |  GET /api/greeting         |
  |--------------------------->|
  |                            |  Build default message
  |                            |  "Hello, World!"
  |  200 OK                    |
  |  {"message": "Hello, World!"}
  |<---------------------------|
```

## Steps

1. Client sends `GET /api/greeting` with no query parameters.
2. API uses the default greeting template: `"Hello, World!"`
3. API returns HTTP 200 with JSON body: `{"message": "Hello, World!"}`

## Error Cases

None — the default greeting always succeeds.
