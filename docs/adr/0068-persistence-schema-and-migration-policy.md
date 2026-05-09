# 0068 Persistence Schema and Migration Policy

## Status

Accepted

## Context

IndexedDB stored raw `UserState` without a schema version.

## Decision

Persist a versioned envelope with schema `urban-farm-year.state.v3`. Legacy raw states are migrated by filling defaults and validating with zod. Exported state files use the same envelope.

## Consequences

Old users keep their data, and imports cannot silently corrupt app state.

## Alternatives Considered

- Keep raw state and hope types match: rejected because browser persistence outlives releases.
