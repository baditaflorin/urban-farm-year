# 0006 - WASM Modules

## Status

Accepted

## Context

The desired stack includes DuckDB and a plant-classifier ONNX model. These are useful but too heavy for initial load.

## Decision

Use DuckDB-WASM and ONNX Runtime Web as lazy modules loaded behind explicit user actions.

GitHub Pages cannot set COOP and COEP headers. Therefore v1 uses non-threaded browser execution paths where available and falls back to TypeScript logic when a WASM module cannot initialize.

## Consequences

- The initial app stays light.
- Advanced analytics and classifier features degrade gracefully.
- Future hosting with configurable headers could enable faster threaded WASM.

## Alternatives Considered

- Bundle WASM on initial load: rejected because it hurts first-load performance.
- Runtime backend for analytics and classification: rejected because Mode B remains sufficient.
