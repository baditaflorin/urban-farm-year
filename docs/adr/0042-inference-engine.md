# 0042 - Inference Engine

## Status

Accepted

## Context

The app needs useful first guesses from seed packet text, planting tables, soil reports, harvest logs, location rows, and gardener intent.

## Decision

Add a deterministic client-side inference engine under `src/lib/inference`.

The engine returns:

- input kind
- inferred fields
- confidence
- reasons
- anomalies
- suggested fixes
- provenance
- apply operations for existing workflows

## Consequences

- Existing workflows can accept drafts instead of only manual form input.
- Low-confidence outputs are visible rather than silently applied.

## Alternatives Considered

- Use a local LLM for all inference: rejected for v2 substance because deterministic rule-based extraction is easier to test and reproduce.
