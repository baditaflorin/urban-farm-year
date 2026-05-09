# 0063 Half-Baked Feature Triage Decisions

## Status

Accepted

## Context

Several visible surfaces worked only halfway: season export, project persistence, smart input entry methods, DuckDB failure handling, and deferred geospatial enrichment.

## Decision

| Feature                          | Decision          | Rationale                                                               |
| -------------------------------- | ----------------- | ----------------------------------------------------------------------- |
| Season Export                    | Finish            | It is visible and valuable; add copy/download through shared exporters. |
| Project persistence              | Finish            | Local-first apps need import/export and migration.                      |
| Smart input file/clipboard entry | Finish            | Phase 2 engine is already good enough; routing is the missing piece.    |
| DuckDB analytics                 | Finish            | Keep the button and make failures actionable.                           |
| Settings                         | Finish            | Required for user-controlled persistence and output defaults.           |
| libosmscout enrichment           | Hide/defer        | Not visible in production UI; remains documented future pipeline work.  |
| Screenshot/embed export          | Keep out of scope | Not claimed and not needed for garden planning.                         |

## Consequences

Users see fewer dead ends, and visible controls complete their promises.

## Alternatives Considered

- Delete DuckDB: rejected because it already works and is explicitly in the project definition.
- Expose libosmscout placeholders: rejected because placeholders violate Phase 3.
