# 0016 - Local Git Hooks

## Status

Accepted

## Context

Checks must run locally because GitHub Actions are not part of this project.

## Decision

Use plain `.githooks` scripts wired by `make install-hooks`.

Hooks:

- `pre-commit`: format/lint/typecheck plus gitleaks staged scan.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: `make test`, `make build`, `make smoke`.
- `post-merge` and `post-checkout`: regenerate static data.

## Consequences

- No extra hook manager dependency is needed.
- Contributors must run `make install-hooks` once.

## Alternatives Considered

- lefthook: viable, but plain hooks are transparent and enough.
