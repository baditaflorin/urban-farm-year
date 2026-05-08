# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Garden profiles, selected crop plans, care logs, soil tests, and harvest records are private user data. V1 must work offline and avoid auth.

## Decision

Use IndexedDB through the `idb` package for structured user records. Use localStorage only for tiny UI preferences when needed.

## Consequences

- The app is local-first and offline-friendly.
- Users retain control of their data.
- Clearing browser data removes records unless the user exports them.

## Alternatives Considered

- Server database: rejected because it requires auth, operations, and data protection beyond v1 needs.
- localStorage only: rejected because records are structured and can grow.
