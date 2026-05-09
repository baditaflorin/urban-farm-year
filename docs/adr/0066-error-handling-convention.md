# 0066 Error-Handling Convention

## Status

Accepted

## Context

Some errors were raw exception messages while others used domain guidance.

## Decision

User-facing errors follow: what failed, why it likely failed, and what the user can do next. Boundary helpers convert unknown exceptions to actionable strings.

## Consequences

URL import, file import, state import, weather, DuckDB, and classifier paths surface recovery guidance instead of stack-shaped text.

## Alternatives Considered

- Central toast system: deferred as polish; inline actionable errors are enough for Phase 3.
