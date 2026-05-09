# 0044 - Confidence Model

## Status

Accepted

## Context

Wrong-but-confident output is the worst Phase 2 failure mode.

## Decision

Every inferred field has confidence from 0 to 1 and at least one reason. Draft confidence is the weighted average of field confidence plus shape confidence.

Confidence bands:

- high: >= 0.75
- review: >= 0.45 and < 0.75
- low: < 0.45

## Consequences

- UI can tell users when to trust, review, or reject a draft.
- Exports can carry uncertainty.

## Alternatives Considered

- One confidence score for the whole draft: rejected because users need to know which values are suspect.
