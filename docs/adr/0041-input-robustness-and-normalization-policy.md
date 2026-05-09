# 0041 - Input Robustness And Normalization Policy

## Status

Accepted

## Context

Gardening inputs arrive as copied HTML, PDF text, CSV, TSV, spreadsheet shorthand, smart quotes, NBSP, CRLF, decimal comma, and mixed units.

## Decision

Normalize at the boundary before inference:

- Strip UTF-8 BOM.
- Convert CRLF and CR to LF.
- Convert NBSP and repeated whitespace to plain spaces where structure is not tabular.
- Normalize smart quotes and long dashes.
- Preserve raw input alongside normalized text.
- Convert decimal comma when surrounded by digits.

## Consequences

- Inference works on predictable text.
- Raw input remains available for provenance and debugging.

## Alternatives Considered

- Let every extractor handle all variants independently: rejected because it creates inconsistent behavior.
