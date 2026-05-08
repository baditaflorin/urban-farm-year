# 0001 - Deployment Mode

## Status

Accepted

## Context

Urban Farm Year should default to GitHub Pages and avoid runtime infrastructure unless v1 requires server-side auth, secrets, writes, or real-time coordination.

The app needs location-aware crop planning, static crop and location reference data, offline user records, weather fetched from a public browser-callable service, and optional heavy client-side modules such as ONNX Runtime Web and DuckDB-WASM.

## Decision

Use Mode B: GitHub Pages plus pre-built data.

The frontend is a static Vite application published from `main` branch `/docs`. A local data-generation pipeline writes versioned artifacts to `public/data/v1`, and the build copies them into `docs/data/v1`.

Runtime user data is stored in the browser with IndexedDB. Weather uses Open-Meteo public APIs from the browser and does not require secrets. Large or sensitive generation steps must remain offline.

## Consequences

- No runtime server is needed for v1.
- The public surface is static GitHub Pages.
- Data freshness depends on running `make data` and publishing the updated artifacts.
- Cross-device sync and account auth are intentionally out of scope.

## Alternatives Considered

- Mode A, pure GitHub Pages: rejected because GeoNames-style lookup tables, crop reference tables, and derived data need a repeatable offline build pipeline.
- Mode C, Pages plus Docker backend: rejected because v1 does not need runtime secrets, auth, server mutations, or server-side persistence.
