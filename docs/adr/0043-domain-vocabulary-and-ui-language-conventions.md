# 0043 - Domain Vocabulary And UI Language Conventions

## Status

Accepted

## Context

V1 sometimes exposes implementation concepts instead of gardening concepts.

## Decision

Use gardening language in smart-input results and errors:

- "seed packet" instead of "text blob"
- "planting guide row" instead of "record"
- "soil report value" instead of "field"
- "harvest shorthand" instead of "parse token"
- "needs review" instead of "low confidence"

## Consequences

- Errors and confidence explanations are understandable to gardeners.

## Alternatives Considered

- Technical parser messages: rejected because they make recovery harder.
