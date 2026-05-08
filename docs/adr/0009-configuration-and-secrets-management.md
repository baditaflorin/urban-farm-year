# 0009 - Configuration And Secrets Management

## Status

Accepted

## Context

The frontend must not contain secrets. V1 has no required secret-bearing services.

## Decision

Use build-time public values only:

- `VITE_APP_VERSION`
- `VITE_GIT_COMMIT`

Document placeholders in `.env.example`. Do not commit real `.env` files. Optional user-supplied local endpoints, such as an Ollama endpoint, are stored only in the browser.

## Consequences

- The app can be forked and deployed without secret setup.
- Weather uses public browser-callable APIs only.

## Alternatives Considered

- Shared API keys in frontend: rejected categorically.
- Runtime proxy backend for secrets: rejected because v1 does not need secret APIs.
