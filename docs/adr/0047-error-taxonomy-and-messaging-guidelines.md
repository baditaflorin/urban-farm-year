# 0047 - Error Taxonomy And Messaging Guidelines

## Status

Accepted

## Context

Users need recovery paths in domain terms.

## Decision

Errors include:

- what failed
- why it failed in gardening terms
- now what the user can do

Recoverable errors preserve the input and prior draft.

## Consequences

- No raw `undefined` or stack-trace-style messages.
- Unsupported inputs are not fatal.

## Alternatives Considered

- Generic toasts: rejected because they do not guide recovery.
