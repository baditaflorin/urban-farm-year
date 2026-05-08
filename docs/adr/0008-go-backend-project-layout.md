# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

Mode B has no runtime backend, but it does have offline generator commands.

## Decision

Use the conventional Go layout:

- `cmd/build-data` for the generator binary.
- `internal/data` for parsing, schema, and artifact writing.
- `internal/utils` for shared error handling.
- `test` for integration fixtures if needed later.

No `cmd/server` is created in v1.

## Consequences

- The repo remains ready for richer offline pipelines.
- Server-only directories are omitted to avoid implying a deployed API.

## Alternatives Considered

- No Go at all: rejected because the project requirements call for Mode B Go commands.
- Full server layout: rejected because Mode C is not selected.
