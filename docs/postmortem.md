# Postmortem

## What Was Built

Urban Farm Year v1 was implemented as a GitHub Pages static app with a Mode B data-generation pipeline.

## Deployment Mode In Hindsight

Mode B was the right choice for v1. The product needs static crop and location reference data, but it does not need runtime auth, a server database, or secret-bearing API calls.

## What Worked

- GitHub Pages kept deployment small and inspectable.
- IndexedDB matched the local-first privacy goal.
- Optional heavy modules could stay lazy-loaded.

## What Did Not Work

- GitHub Pages cannot set COOP and COEP headers, limiting some threaded WASM options.
- Public static hosting means cross-device sync remains out of scope.

## Surprises

- The same `/docs` directory must hold source documentation and Pages output, so build cleanup has to be careful.

## Accepted Tech Debt

- The ONNX classifier is a small local heuristic model, not a production-grade species classifier.
- Location data is a curated GeoNames-style seed dataset, not a complete global gazetteer.
- libosmscout enrichment is documented as a pipeline boundary but not linked into v1.

## Next Improvements

1. Add complete GeoNames and OSM-derived neighborhood artifacts as release assets.
2. Add export and import for encrypted garden backups.
3. Add a richer local model adapter for browser-native LLMs as those APIs stabilize.

## Time Spent Vs Estimate

Initial estimate: one focused implementation pass for the v1 scaffold and core workflows.

Actual: implemented in one focused pass with deliberate scope cuts around hosted sync and production-grade ML datasets.
