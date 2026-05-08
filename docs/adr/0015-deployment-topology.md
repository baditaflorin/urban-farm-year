# 0015 - Deployment Topology

## Status

Accepted

## Context

ADR 0001 selects Mode B.

## Decision

Deploy only to GitHub Pages from `main` branch `/docs`.

No `deploy` directory, Dockerfile, nginx, Prometheus, or server compose topology is needed for v1.

## Consequences

- Operations are simple: build, commit, push.
- Rollback is a git revert of the publishing commit.
- Runtime backend concerns are deferred.

## Alternatives Considered

- Docker backend: rejected because there is no runtime API.
