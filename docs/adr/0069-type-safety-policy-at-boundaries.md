# 0069 Type-Safety Policy at Boundaries

## Status

Accepted

## Context

The app receives unknown data from files, IndexedDB, DuckDB, ONNX, weather, and Vite env.

## Decision

Unknown external values are parsed or narrowed at the boundary. UI select controls use shared option guards instead of casts. Remaining casts must live in explicit boundary modules with local validation.

## Consequences

Core UI and domain helpers avoid unsafe casts, while browser/library boundary code remains honest and contained.

## Alternatives Considered

- Ban all casts mechanically: rejected because some browser/library APIs require narrowing wrappers.
