# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live Pages URL must work from day one and built assets must be committed. GitHub Actions are not allowed.

## Decision

Publish from `main` branch `/docs`.

Vite uses `base: "/urban-farm-year/"` and writes hashed assets into `docs/assets`. The build also copies `index.html` to `404.html` as a single-page app fallback. The `.gitignore` excludes generic `dist` output but does not ignore `docs`.

Live URL:

https://baditaflorin.github.io/urban-farm-year/

Repository:

https://github.com/baditaflorin/urban-farm-year

## Consequences

- No GitHub Actions are needed.
- Each publish is a normal git commit to `main`.
- Source documentation and Pages assets share `docs`, so build cleanup must avoid deleting ADRs and docs files.

## Alternatives Considered

- `gh-pages` branch: rejected because it adds branching overhead for this small project.
- `main /`: rejected because build assets would clutter the repo root.
