# 0045 - State Taxonomy And State Machine

## Status

Accepted

## Context

Phase 2 requires no stuck or half-applied states.

## Decision

Use the state taxonomy in `docs/phase2-substance/states.md`. Smart input parsing is request-guarded: only the latest request may update UI state.

## Consequences

- Fast repeated clicks cannot apply stale parse output.
- Cancel and retry paths preserve the previous good draft.

## Alternatives Considered

- Fire-and-forget parsing: rejected because it creates stale state races.
