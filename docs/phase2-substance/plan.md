# Phase 2 Substance Plan

Status: accepted by user request to continue and fully implement

Ranking principle: fix the failures that blocked the 10 real-data audit inputs first. No polish work.

## Ranked Substance Items

1. A1 fuzz parser with all 10 real-data fixtures plus synthetic edge cases.
2. B8 useful first guess from pasted gardening input.
3. B6 auto-detect input structure: seed packet, planting guide, soil report, harvest log, location row, image manifest, gardener intent.
4. B7 auto-classify fields: crop, variety, date, days, spacing, temperature, pH, ppm, quantity, unit, location, timezone.
5. B9 normalize formats by default: whitespace, BOM, CRLF, NBSP, smart quotes, dashes, decimal comma, inches, Fahrenheit.
6. D16 confidence on every inferred field.
7. D19 explain decisions with reasons on each inferred field.
8. H32 actionable errors with what, why, now what.
9. C12 domain-aware validation for pH, soil ppm, unsupported images, missing crop, ambiguous units.
10. C13 recognize common gardening shapes under one engine.
11. C15 bake in gardening conventions: frost phrases, succession language, seed packet language, CSV/TSV sniffing.
12. D18 surface anomalies such as ambiguous date, missing unit, unsupported model scope, and mixed schema.
13. D17 suggest fixes for each recoverable anomaly.
14. E22 stable IDs for drafts and inferred entities.
15. I35 deterministic inference output.
16. I38 output provenance: source hash, schema version, app version, parameters.
17. F24 enumerate reachable states.
18. F25 every state has an exit.
19. F27 guard concurrent parse/apply operations with request IDs and cancellation.
20. G31 cache parsed drafts by normalized input hash.
21. G28 measure fixture performance and document median/worst.
22. H33 validate at boundaries with zod.
23. I37 debug overlay via `?debug=1`.
24. J39 remember correction preferences in session-local state.
25. E20 pipeline outputs can apply into existing profile, plan, soil, and harvest state.

## Expected Phase 2 Result

The app remains Mode B and keeps the same core workflows. The main change is that the existing workflows accept real gardening data as drafts that users correct rather than hand-enter from scratch.
