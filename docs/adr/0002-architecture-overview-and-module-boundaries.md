# 0002 - Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The product spans planning, care logs, weather, soil tests, harvest tracking, next-year planning, and optional local intelligence modules. The codebase needs clear boundaries so static delivery remains simple.

## Decision

Use three top-level areas:

- `src/features`: user-facing feature modules grouped by domain.
- `src/lib`: shared client utilities for storage, planning math, weather, versioning, and optional WASM adapters.
- `cmd` plus `internal`: Mode B data-generation pipeline in Go.

Static data is treated as a versioned contract under `/data/v1`. User-owned records never leave the browser.

## Consequences

- Frontend modules can evolve without coupling to the generator internals.
- The Go generator can be run locally or on a cron without becoming a deployed service.
- Optional heavy modules stay lazy-loaded and off the initial path.

## Alternatives Considered

- A monolithic frontend file: rejected because the product crosses too many domains.
- A runtime API boundary: rejected for v1 per ADR 0001.
