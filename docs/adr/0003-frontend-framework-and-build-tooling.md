# 0003 - Frontend Framework And Build Tooling

## Status

Accepted

## Context

The frontend must run on GitHub Pages, be TypeScript strict, support a polished interactive app, and keep the initial payload below the target by lazy-loading heavy modules.

## Decision

Use React, TypeScript, Vite, Tailwind CSS, TanStack Query, zod, idb, and lucide-react.

Vite builds directly into `docs` with base path `/urban-farm-year/`. Heavy optional modules such as DuckDB-WASM and ONNX Runtime Web are loaded only after user action.

## Consequences

- Local development is fast with `npm run dev`.
- Pages asset paths are correct from day one.
- Bundle size must be watched because React is not the smallest possible option.

## Alternatives Considered

- Vanilla TypeScript: rejected because the app benefits from a component model.
- Svelte: viable, but React has broader library support for the required stack.
- Next.js: rejected because static GitHub Pages is the deployment target and Vite is simpler here.
