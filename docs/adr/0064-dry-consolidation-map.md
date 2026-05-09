# 0064 DRY Consolidation Map

## Status

Accepted

## Context

Domain literals and export serialization were scattered in UI components.

## Decision

- Move output serialization to `src/lib/exporters.ts`.
- Move domain options to `src/lib/domainOptions.ts`.
- Move import/export state validation to `src/lib/stateSchema.ts`.
- Move file/URL/share helpers to `src/lib/projectIO.ts`.

## Consequences

UI components call small focused helpers and no longer own serialization or validation policy.

## Alternatives Considered

- One large project utility file: rejected because import, export, and schema boundaries change for different reasons.
