# 0067 State-Management Convention

## Status

Accepted

## Context

User records are in IndexedDB, but settings and last input state were not explicit.

## Decision

All user-owned garden records, project settings, recent smart input text, and activity history live in `UserState`. Transient component state remains local.

## Consequences

Settings persist, smart input can resume, and export/import captures the whole project.

## Alternatives Considered

- Store settings in `localStorage`: rejected because export/import would miss them.
