# 0040 - Real-Data Audit Findings And Substance Success Metrics

## Status

Accepted

## Context

The Phase 2 audit showed that v1 works when users accept built-in defaults, but fails when they bring seed packets, planting PDFs, soil reports, harvest spreadsheets, location rows, plant image manifests, or plain-language gardening intent.

## Decision

Use the 10 real-data fixtures in `test/fixtures/realdata` as the grading rubric. Phase 2 passes only when at least 7 of 10 produce useful drafts without manual setup and all 10 avoid crashes.

## Consequences

- Fixtures drive implementation priority.
- New logic must improve or preserve fixture behavior.
- The postmortem reports before and after pass rate.

## Alternatives Considered

- Continue building from curated demo data: rejected because it preserves the toy failure mode.
