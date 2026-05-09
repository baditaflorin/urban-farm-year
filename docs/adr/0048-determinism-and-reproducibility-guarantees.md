# 0048 - Determinism And Reproducibility Guarantees

## Status

Accepted

## Context

Same input must produce same normalized output for fixture tests and user trust.

## Decision

Inference output uses deterministic IDs derived from normalized text and field content. Generation timestamps are excluded from deterministic inference output and added only to user exports with explicit metadata.

## Consequences

- Fixture outputs can be byte-identical.
- User exports can still include generation timestamp.

## Alternatives Considered

- Use random IDs and current timestamps in drafts: rejected because it breaks determinism.
