# 0062 Output Pathway Coverage Policy

## Status

Accepted

## Context

The app had a read-only markdown export but no copy/download controls, no full state export, and no CSV output.

## Decision

Support four output types: versioned state JSON, season markdown, harvest CSV, and small share URLs. Each output gets copy and/or download controls where browser APIs allow it.

## Consequences

- State JSON becomes the canonical round-trip project file.
- CSV is intentionally limited to harvest rows because that is the tabular user-owned data in v1.
- Share URLs have a documented size limit and fall back to file download.

## Alternatives Considered

- Add PDF generation: rejected because browser print covers the v1 need without extra dependencies.
- Add server-side short links: rejected because Mode B has no runtime backend.
