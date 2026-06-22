# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Active support  |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue, please email: **yacine.baghli@gmail.com**

Include:
- A description of the vulnerability.
- Steps to reproduce.
- Potential impact.

You can expect an acknowledgement within **48 hours** and a resolution timeline within **7 days** for confirmed issues.

## Notes on API Key Security

- API keys entered in the browser UI are stored **only in `localStorage`** on the client side and are **never sent to any intermediary server**.
- Keys are transmitted directly from the client to the respective LLM provider API endpoint (Google AI Studio, OpenAI, Anthropic).
- Server-side environment variables (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) are accessed only within the serverless API route and are never exposed to the client.
