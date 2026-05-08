# 0012 - Metrics And Observability

## Status

Accepted

## Context

Mode B has no server-side metrics. Client analytics would collect usage data and requires privacy documentation.

## Decision

Use no analytics in v1.

Operational observability comes from local tests, smoke tests, GitHub Pages availability, and visible data freshness metadata in the UI.

## Consequences

- No PII or behavioral analytics are collected.
- Product usage insight must come from direct feedback and GitHub stars/issues.

## Alternatives Considered

- Plausible analytics: viable but not needed for v1.
- Custom beacon endpoint: rejected because it introduces infrastructure.
