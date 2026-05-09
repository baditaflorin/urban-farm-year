# 0061 Input Pathway Coverage Policy

## Status

Accepted

## Context

Smart paste works, but real users often have text files, CSV, TSV, HTML snippets, saved state JSON, clipboard content, or URLs.

## Decision

Add a Project workspace that routes text-like files, clipboard text, sample text, URL-fetched text, and imported state through explicit detectors. Image classification remains in the Classifier panel.

## Consequences

- Batch text imports produce per-file outcomes.
- CORS-blocked URL imports give recovery guidance instead of failing silently.
- Saved project JSON is validated before replacing local state.

## Alternatives Considered

- Keep paste-only input: rejected because it keeps real user data trapped outside the app.
- Add a runtime URL proxy: rejected because Mode B must stay static.
