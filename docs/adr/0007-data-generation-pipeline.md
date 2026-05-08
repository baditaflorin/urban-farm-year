# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B needs repeatable static data generation rather than a deployed backend.

## Decision

Use a Go command at `cmd/build-data` to read raw CSV inputs from `data/raw` and write JSON artifacts to `public/data/v1`.

The pipeline is deterministic except for metadata `generated_at`. It writes to a temporary directory, then swaps files into place to avoid partial artifacts.

## Consequences

- `make data` is the source of truth for data artifacts.
- Data can be regenerated locally without cloud infrastructure.
- Polars and libosmscout remain optional future enrichment tools rather than runtime dependencies.

## Alternatives Considered

- Python-only pipeline with Polars: viable, but Go matches the requested backend convention for Mode B.
- Manual JSON editing: rejected because schemas and metadata need repeatability.
