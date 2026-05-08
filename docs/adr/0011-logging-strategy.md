# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode B has no server logs. Browser console output should stay quiet in production.

## Decision

Use explicit user-facing errors and toasts for recoverable failures. Development-only diagnostics may use console output guarded by `import.meta.env.DEV`.

The Go generator writes concise progress and errors to stderr/stdout.

## Consequences

- Production users do not see noisy console output.
- Failures remain visible in the UI.

## Alternatives Considered

- Client telemetry logs: rejected for v1 privacy and simplicity.
