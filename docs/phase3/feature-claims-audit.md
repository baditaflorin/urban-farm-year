# Phase 3 Feature Claims Audit

| Source             | Claim                                | Before            | Evidence / correction                                                                                  |
| ------------------ | ------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------ |
| README             | Static, offline-friendly planner     | Shipped partially | Core records persist and PWA assets exist; weather and initial static data fetches still need network. |
| README             | Daily care                           | Shipped fully     | Care logs and weather advice are wired.                                                                |
| README             | Soil tests                           | Shipped fully     | Soil test entry and guidance are wired.                                                                |
| README             | Harvest logs                         | Shipped partially | Logging works; export did not.                                                                         |
| README             | Next-year growing decisions          | Shipped partially | Advice and markdown exist; no copy/download controls.                                                  |
| README             | Infers drafts from pasted real data  | Shipped fully     | Phase 2 fixture suite verifies 10 real-data inputs.                                                    |
| README             | Stores records locally in IndexedDB  | Shipped partially | Saves records, but no migration envelope or import/export.                                             |
| README             | Uses SunCalc                         | Shipped fully     | Profile daylight metric uses SunCalc.                                                                  |
| README             | Uses Open-Meteo                      | Shipped fully     | Care panel fetches Open-Meteo.                                                                         |
| README             | Uses tiny local ONNX classifier      | Shipped fully     | Classifier loads local ONNX when possible and falls back locally.                                      |
| README             | Uses DuckDB-WASM harvest analytics   | Shipped partially | Button runs analytics, but error handling is thin.                                                     |
| README             | Publishes from `main` branch `/docs` | Shipped fully     | GitHub Pages API reports `main` `/docs`.                                                               |
| docs/postmortem.md | libosmscout enrichment is deferred   | Honest cut        | Not in UI; remains pipeline future work.                                                               |
| In-app             | Season Export                        | Shipped partially | Visible text area lacks controls.                                                                      |

## Before Mismatches

1. "Harvest logs" implies user-owned output, but CSV/state export is missing.
2. "Offline-friendly" needs clearer limitations: first load/data/weather constraints.
3. IndexedDB persistence lacks a versioned migration/import/export contract.
4. DuckDB is advertised, but runtime failure has no user-facing recovery.
5. Season export appears complete but lacks output controls.
