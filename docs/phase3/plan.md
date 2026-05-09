# Phase 3 Implementation Plan

Items are ranked by real-user impact and map to the Phase 3 catalog.

| Rank | Catalog item | Implementation                                                              |
| ---- | ------------ | --------------------------------------------------------------------------- |
| 1    | A1           | Add project file upload for text, CSV, TSV, HTML, and JSON state files.     |
| 2    | A2           | Sniff extension, MIME, and content patterns before routing imports.         |
| 3    | A4           | Accept multi-file batches with per-file success/error rows.                 |
| 4    | A6           | Add permission-aware clipboard import with paste-box fallback.              |
| 5    | A3           | Add URL import attempt with explicit CORS recovery guidance.                |
| 6    | A7           | Add one-click real-data sample loader beside user data import.              |
| 7    | A8           | Restore last smart input when the setting is enabled; add true start-fresh. |
| 8    | B9           | Add full state export/import round trip.                                    |
| 9    | B10          | Add copy-to-clipboard for JSON, markdown, CSV, and share URL.               |
| 10   | B11          | Add downloadable versioned state file.                                      |
| 11   | B12          | Add small hash-encoded share URL with limit handling.                       |
| 12   | B13          | Add print action and print CSS.                                             |
| 13   | B14          | Add automation-ready state JSON and harvest CSV.                            |
| 14   | C15          | Triage every half-baked surface in ADR 0063.                                |
| 15   | C16          | Finish Season Export controls and DuckDB failure feedback.                  |
| 16   | C18          | Add settings page and wire every setting to behavior.                       |
| 17   | C19          | Align README claims with tested reality and limitations.                    |
| 18   | D20          | Extract output serialization to one exporter module.                        |
| 19   | D22          | Add canonical domain option constants for units/nutrients/textures.         |
| 20   | D23          | Add shared validation schemas at state import/storage boundaries.           |
| 21   | E24          | Add a project feature boundary for import/export/settings.                  |
| 22   | E25          | Keep dependency direction UI -> lib/domain primitives.                      |
| 23   | F28          | Remove unused props and dead UI plumbing.                                   |
| 24   | F29          | Keep source TODO/FIXME/XXX/HACK count at zero.                              |
| 25   | G31          | Add shared user-facing error message helpers.                               |
| 26   | G32          | Define state ownership: project settings and user records in `UserState`.   |
| 27   | H35          | Remove unsafe UI casts and replace with guards/constants.                   |
| 28   | H36          | Validate imported state with zod before mutation.                           |
| 29   | I38          | Add tests proving saves survive reload-style storage round trip.            |
| 30   | I39          | Add persisted state migrations from legacy raw v1 to envelope v3.           |
| 31   | I40          | Add explicit clear-state behavior in project controls.                      |
| 32   | I41          | Add state export/import round-trip test.                                    |
| 33   | J42          | Convert README feature section into a verified checklist.                   |
| 34   | J44          | Add minimal inline help for non-obvious import/output controls.             |
| 35   | K46          | Run private-window stranger test with a real fixture.                       |
| 36   | K47          | Fix the top three stranger-test findings before release.                    |

## Execution Order

1. ADRs 0060-0071.
2. Shared state schema, options, exporters, and import helpers.
3. Project workspace UI and settings.
4. Wire settings into existing panels.
5. Tests and e2e coverage.
6. Update audits, README, stranger test, and postmortem.
7. Version bump, Pages build, tag, release.
