# 0017 - Dependency Policy

## Status

Accepted

## Context

The app depends on browser storage, static data fetching, weather, optional WASM, and data generation.

## Decision

Use production-ready libraries with clear maintenance histories. Avoid custom implementations for routing-like state, schema validation, IndexedDB, ONNX runtime, and DuckDB.

Dependencies are committed through lockfiles. High or critical audit findings must be fixed before release unless documented as tooling-only false positives.

## Consequences

- The app avoids fragile home-grown infrastructure.
- The dependency list is reviewed for bundle size and browser suitability.

## Alternatives Considered

- Hand-rolled storage/query/classifier layers: rejected because maintained libraries exist.
