# Phase 3 Postmortem

## Audit Movement

| Audit           | Before                              | After                               |
| --------------- | ----------------------------------- | ----------------------------------- |
| Input pathways  | 2 green / 4 yellow / 8 red          | 12 green / 2 yellow / 0 red         |
| Output pathways | 0 green / 2 yellow / 6 red / 2 gray | 8 green / 0 yellow / 0 red / 2 gray |
| Controls        | 12 green / 7 yellow / 1 red         | 23 green / 2 yellow / 0 red         |

## Half-Baked Feature Outcomes

| Feature                          | Outcome       | Rationale                                                                                  |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| Season Export                    | Finished      | Copy/download controls use shared markdown exporter.                                       |
| Project persistence              | Finished      | Versioned JSON envelope imports/exports full state.                                        |
| Smart input file/clipboard entry | Finished      | Project workspace routes file, text, clipboard, sample, batch, URL, and share-link inputs. |
| DuckDB analytics                 | Finished      | Failure is actionable and fallback summary remains visible.                                |
| Settings                         | Finished      | Four settings persist and affect behavior.                                                 |
| libosmscout enrichment           | Kept deferred | It is not production UI and remains a future data-pipeline item.                           |

## Codebase Health Metrics

| Metric                         | Before         | After                                                   |
| ------------------------------ | -------------- | ------------------------------------------------------- |
| Core DRY violations            | 4              | 0 accepted core violations                              |
| Production TODO/FIXME/XXX/HACK | 0              | 0                                                       |
| Unsafe UI casts                | 3              | 0                                                       |
| Persistence schema             | Raw state cast | zod envelope + migration                                |
| Real-user path tests           | 17 tests       | 27 tests                                                |
| E2E project coverage           | None           | Import, apply, export surface, settings, harvest effect |

## Stranger Test

The substitute private-browser stranger test found three issues: cramped pasted-input control, misleading Share URL download action, and unclear primary export format. All three were fixed before release.

## Documentation Reality Mismatches Fixed

- README now lists verified feature checks instead of broad claims.
- README now calls out offline, URL import, share URL, and classifier limitations.
- Phase 3 audits record before/after status instead of only describing planned work.

## Surprises

- The useful engine work from Phase 2 made file import cheap; most Phase 3 value came from routing and state ownership, not new inference.
- A small wording/control mismatch in Share URL felt more damaging than missing advanced features because it made the user distrust exports.
- Versioned browser state became the central product object. Once that existed, import, export, share, tests, and docs all became simpler.

## Still-Open Completeness Gaps

1. URL import cannot bypass CORS in Mode B.
2. Share URLs are only practical for small projects.
3. Classifier is broad and local; it is not a real disease model.
4. No cross-device sync beyond manual JSON/share URL transfer.
5. No full OSM/libosmscout location enrichment artifact yet.

## Honest Take

A stranger can now use Urban Farm Year for their own real work end-to-end if their workflow is local-first: import real text/CSV/TSV/HTML/project JSON, apply drafts, log care/soil/harvests, change settings, export JSON/CSV/markdown, print, and reopen later.

It is still not effortless for URL-first workflows because many sites block browser fetches, and it is not a multi-device account product. Within the promised GitHub Pages Mode B shape, it now feels usable rather than demo-only.
