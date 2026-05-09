# Phase 2 Substance Performance Notes

## Budgets

- Text normalization: under 50 ms for fixtures under 100 KB.
- Structure inference: median under 1 second across the real-data fixture set.
- Worst text fixture: under 5 seconds or cancellable.
- UI responsiveness: parse/apply operations must be cancellable or request-guarded.

## Measurement Plan

The fixture test suite records parse duration for every real-data fixture. The postmortem reports median, p95, and worst observed times.

## Initial Hot Paths

1. Normalization and regex extraction over input text.
2. CSV/TSV delimiter sniffing.
3. Field classification and confidence explanation assembly.

## Phase 2 Constraint

No worker is introduced unless fixture measurements show main-thread parsing exceeds the budget.

## Measurement Result

Measured May 9, 2026 against `test/fixtures/realdata`:

- Median: 0.56 ms.
- p95: 4.07 ms.
- Worst: 4.07 ms.

All 10 real-data fixtures stayed below the budget.
