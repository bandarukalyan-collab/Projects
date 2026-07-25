# Domain Guide — Greeting Service

> Human-authored domain documentation. Place your team's business docs, architecture
> guides, requirements documents, and onboarding materials in this `ai/raw/` directory.
> The `/create-pod-knowledge` skill reads these files to generate AI knowledge specs.

## What is the Greeting Service?

The Greeting Service is a simple multi-project platform that returns greeting messages.
It is used as a reference implementation to demonstrate the AI-native SDLC workflow.

## Services

### Greeting API (hello-world-java)
The core backend service. Exposes a REST endpoint that returns greeting messages.
Currently supports default and personalized greetings. Locale-based greetings are planned.

### Web Frontend (hello-world-nodejs)
A lightweight Node.js server that consumes the Greeting API and presents greetings
to end users via a web interface.

### CLI Tool (hello-world-csharp)
A .NET console application that calls the Greeting API from the command line.
Useful for scripting and automation.

## API Endpoints

| Method | Path | Parameters | Description |
|--------|------|-----------|-------------|
| GET | `/api/greeting` | `name` (optional), `locale` (planned) | Returns a greeting message |

## Example Usage

```bash
# Default greeting
curl http://localhost:8080/api/greeting
# {"message": "Hello, World!"}

# Personalized greeting
curl http://localhost:8080/api/greeting?name=Alice
# {"message": "Hello, Alice!"}
```

## Planned Features

1. **Locale support** — Greeting templates stored per locale (en-US, fr-FR, etc.)
2. **Template management** — Admin API for CRUD operations on greeting templates
3. **Authentication** — OAuth2 / API key for production deployment
