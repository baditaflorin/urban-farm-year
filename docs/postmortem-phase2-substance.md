# Phase 2 Substance Postmortem

## Real-Data Pass Rate

Before Phase 2:

- Useful draft from provided input: 0/10.
- Crash-free manual happy path: partial, but only after users translated the data by hand.

After Phase 2:

- Useful deterministic draft from provided fixture: 10/10.
- Crash-free fixture run: 10/10.
- Determinism check: 10/10 byte-identical normalized draft output.

## Per-Fixture Result

| Fixture                         | Before                   | After                                                    | Evidence            |
| ------------------------------- | ------------------------ | -------------------------------------------------------- | ------------------- |
| 01 seed packet tomato           | Generic tomato only      | Seed packet draft, variety, timing, spacing, temperature | Fixture test passes |
| 02 CSU planting table           | Ignored table            | Planting guide draft, crops, maturity, spacing           | Fixture test passes |
| 03 broken PDF text              | No path                  | Planting guide draft with wrapped-word anomaly           | Fixture test passes |
| 04 Illinois regional guide      | Lost region/fall windows | Region and fall window detected                          | Fixture test passes |
| 05 soil report                  | Manual pH buckets        | pH, buffer pH, OM, P ppm, K ppm                          | Fixture test passes |
| 06 Growstuff harvest CSV        | Manual harvests only     | Harvest log draft with crop, part, quantity, unit        | Fixture test passes |
| 07 tomato spreadsheet shorthand | Manual split required    | Count/weight shorthand detected                          | Fixture test passes |
| 08 GeoNames row                 | Tiny location list only  | Location name, lat/lon, timezone                         | Fixture test passes |
| 09 PlantVillage manifest        | Classifier scope unclear | Image manifest recognized as scope warning               | Fixture test passes |
| 10 gardener intent              | Screens not connected    | Planting lifecycle intent draft                          | Fixture test passes |

## Top 5 Logic Gaps

1. No ingestion layer.
   Closed with Smart Garden Input and the deterministic inference engine.

2. No inference engine.
   Closed with structure detection, field classification, confidence, and reasons.

3. Generic crop planning.
   Partly closed: seed packet and planting guide facts now produce reviewable drafts and can select matching crops. Variety-level planning overrides remain a Phase 3 candidate.

4. No unit/domain normalization.
   Closed for the fixture set: inches to cm, Fahrenheit to Celsius, decimal comma, smart quotes, NBSP, CRLF, CSV/TSV, ppm, and harvest shorthand.

5. Missing confidence and provenance.
   Closed for smart drafts: every field carries confidence and reasons; every draft carries source hash, app version, schema version, and parameters.

## Smart Behaviors Promised

- Paste real gardening input and get a draft: works on all 10 fixtures.
- Normalize real-world formats: works on the fixture set.
- Show confidence and reasons: enforced by fixture tests.
- Use source facts transparently: drafts show inferred values before applying.
- Carry provenance: every draft has source hash and schema metadata.

## Determinism

All 10 fixture drafts pass the deterministic output assertion. The inference engine excludes timestamps and random IDs from draft output.

## Performance

Measured with the 10 real-data fixtures on May 9, 2026:

- Median: 0.56 ms.
- p95: 4.07 ms.
- Worst: 4.07 ms.
- Slowest fixture: seed packet tomato.

All fixture inputs are below the 1 second median target and below the 5 second worst-case target. No worker is required yet.

## What Surprised Me

The app did not need a local LLM to feel much smarter. Deterministic rules, confidence, reasons, and a good draft/apply loop fixed most of the "toy" feeling for these inputs.

The biggest remaining mismatch is data shape: crop facts are inferred, but the planner still has limited variety-level overrides.

## Still Open For Phase 3

1. Variety-specific crop plan overrides that actually change the calendar.
2. Multi-row harvest import that preserves every row, not just the first applicable summary draft.
3. Richer PDF table repair for multi-page extension guides.
4. Full location artifact expansion from GeoNames or release assets.
5. Real disease/species classifier with a visible model card and calibrated confidence.

## Honest Take

It no longer feels like a pure toy when given real text data: it can read a seed packet, soil report, harvest log, location row, and messy planting guide excerpt, then explain what it found.

It still feels toy-like around deeper agronomy decisions. The app can infer facts, but it does not yet fully let inferred variety and regional guide data override the crop calendar with traceable conflict resolution. That is the next substance frontier.
