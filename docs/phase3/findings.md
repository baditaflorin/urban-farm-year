# Phase 3 Findings Synthesis

## Top 5 Usability Gaps

1. Users can paste real garden text, but cannot upload the files they already have.
2. Users cannot move their garden year between browsers or devices.
3. Users can see season export text, but cannot copy or download it.
4. Settings are implicit or absent; weather, export defaults, and input autosave are not user-manageable.
5. Several failure modes are silent or too technical: URL CORS, DuckDB failure, invalid imported state, and weather failure.

## Top 5 Half-Baked Features

| Feature                   | Decision | Rationale                                                                         |
| ------------------------- | -------- | --------------------------------------------------------------------------------- |
| Season Export textarea    | Finish   | It is visible and useful but lacks output controls.                               |
| Local state persistence   | Finish   | IndexedDB works, but versioned import/export/migration are required for real use. |
| Smart input as only paste | Finish   | The engine works; the missing part is file/clipboard/batch entry.                 |
| DuckDB analytics button   | Finish   | Keep it, add failure handling and export path.                                    |
| libosmscout enrichment    | Keep cut | It is documented as deferred pipeline work and not visible in production UI.      |

## Top 5 Codebase Pain Points

1. No canonical state schema at the persistence boundary.
2. Output serialization lives in UI components.
3. Domain option literals force unsafe UI casts.
4. Project-level workflows have no module boundary.
5. Error handling lacks one shared user-facing shape.

## Top 5 Documentation / Reality Mismatches

1. README says harvest logs, but export is missing.
2. README says offline-friendly without explaining first-load/weather limitations.
3. Local storage is advertised but not portable or versioned.
4. DuckDB is advertised without a tested failure path.
5. Season export is visible but not actually actionable.

## Definition of Fully Usable

1. A stranger can import a real seed packet text file, harvest CSV, soil report text, or saved project JSON without reading source code.
2. A stranger can export the whole project, reload it in a new private browser session, and continue working.
3. A stranger can copy/download markdown and CSV outputs for email, spreadsheets, or notebooks.
4. A stranger can understand and recover from input, weather, analytics, and state errors.
5. A stranger can change settings and see those settings persist and affect behavior.

## Phase 3 Success Metrics

- Input audit green/yellow acceptable rows improve from 6/14 to at least 12/14.
- Output audit green/yellow acceptable rows improve from 2/10 to at least 8/10.
- All production UI controls have a real handler or are removed.
- State export/import round trip passes unit tests and e2e smoke.
- TODO/FIXME/XXX/HACK remains 0 in production source.
- Type casts at UI state boundaries are replaced by shared validators or documented boundary modules.

## Out of Scope

- No runtime backend.
- No cross-device sync account system.
- No new inference engine behavior beyond routing user data to the Phase 2 engine.
- No polish-only visual redesign.
- No full libosmscout artifact pipeline.
- No medical/agronomic disease diagnosis from classifier images.

## Phase 3 Result

- Fully usable means local-first project movement is now complete: import, apply, persist, export, share small state, print, and restore.
- Remaining yellow areas are architectural limits of Mode B: direct URL fetches depend on CORS, and share URLs are bounded by browser URL length.
- The app did not add a backend, did not change the Phase 2 inference engine, and did not introduce polish-only features.
