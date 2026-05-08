# 0004 - Static Data Contract

## Status

Accepted

## Context

The browser needs crop, location, and data freshness metadata without a runtime API.

## Decision

Publish versioned JSON artifacts:

- `/data/v1/crops.json`
- `/data/v1/locations.json`
- `/data/v1/garden-data.meta.json`

All artifacts include stable IDs and deterministic ordering. Breaking schema changes move to `/data/v2`.

## Consequences

- The frontend can fetch static files with TanStack Query.
- Git diffs stay readable for small artifacts.
- Large future artifacts can be moved to GitHub Releases by semver tag.

## Alternatives Considered

- SQLite or Parquet as the primary v1 contract: deferred until the dataset is large enough to justify binary artifacts.
- Runtime REST API: rejected for v1.
