# 0046 - Performance Budgets Per Operation

## Status

Accepted

## Context

Substance work must stay honest at real input scale.

## Decision

Use budgets and measurement plan in `docs/perf/phase2-substance.md`. Fixture tests record parse duration.

## Consequences

- Regressions are visible in the test output and postmortem.
- A worker remains deferred until fixture numbers justify it.

## Alternatives Considered

- Add a worker immediately: deferred because the fixture set is small enough for main-thread deterministic parsing.
