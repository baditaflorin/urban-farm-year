# 0065 Module Boundaries and Dependency Direction

## Status

Accepted

## Context

The app needs a workspace surface without blending UI, persistence, and serialization.

## Decision

Use this direction: `features/*` UI imports `lib/*` application/domain helpers; `lib/*` imports only domain types, schemas, and browser primitives; no `lib/*` imports from UI.

## Consequences

The Project workspace can coordinate import/export/settings while keeping reusable logic testable.

## Alternatives Considered

- Put project import logic in `App.tsx`: rejected because it would make the root component a workflow god module.
