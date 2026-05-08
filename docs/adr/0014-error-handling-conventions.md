# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Static apps still need clear failure modes for data fetches, storage, weather APIs, and optional WASM modules.

## Decision

Frontend modules return typed results and show recoverable errors in the UI. Optional features provide fallbacks.

Go code wraps errors with `%w` and uses `internal/utils.HandleErrorOrLogWithMessages(err, errMsg, successMsg)` at command boundaries.

## Consequences

- Users see actionable messages.
- Generator failures stop the command with context.

## Alternatives Considered

- Panics in Go commands: rejected.
- Silent frontend failures: rejected.
