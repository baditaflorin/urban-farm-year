# 0013 - Testing Strategy

## Status

Accepted

## Context

The project needs fast local checks because GitHub Actions are not allowed.

## Decision

Use Vitest for frontend logic tests, Go tests for the data generator, and Playwright smoke/e2e tests against the static build.

`make test` runs unit tests. `make smoke` builds and serves `docs` locally, then runs the happy-path Playwright test.

## Consequences

- Checks remain local and hook-friendly.
- Browser behavior is verified before publishing.

## Alternatives Considered

- GitHub Actions: rejected by project constraints.
- Manual-only QA: rejected because Pages path and storage behavior are easy to regress.
