# 0050 - Interaction Learning Policy

## Status

Accepted

## Context

Phase 2 can remember corrections, but must not feel like hidden behavior.

## Decision

Remember lightweight correction preferences in local app state only. Show when a remembered correction influenced an inference. No remote learning and no silent global model change.

## Consequences

- Repeated session work gets faster.
- Behavior remains explainable and local.

## Alternatives Considered

- Train or fine-tune a model from interactions: rejected for privacy, scope, and determinism.
