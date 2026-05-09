# Phase 3 Output Pathway Audit

Status key: green = works end-to-end on user data, yellow = works partially, red = claimed or visible but broken, gray = deliberately not built.

| Exit point                    | Before | Evidence                                                                                       | Target disposition                                              |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Season markdown export        | Yellow | Next-Year panel renders markdown in a read-only textarea, but has no copy or download control. | Add copy/download and move generation to a shared exporter.     |
| Full state JSON export        | Red    | No downloadable state file exists.                                                             | Add versioned state envelope export.                            |
| Full state JSON import        | Red    | No import path exists.                                                                         | Add validated import and migration.                             |
| Harvest CSV export            | Red    | Harvest ledger has summaries only.                                                             | Add CSV generator, copy, and download.                          |
| Copy to clipboard             | Red    | No output copy controls exist.                                                                 | Add copy controls for state JSON, markdown, CSV, and share URL. |
| Share URL                     | Red    | No encoded state link exists.                                                                  | Add hash-encoded small state link.                              |
| Print / PDF                   | Red    | Browser print works only accidentally, with no explicit control.                               | Add print control and print-friendly CSS.                       |
| API / automation-ready output | Yellow | Static JSON artifacts exist, but user state is not exportable for scripts.                     | Add documented JSON/CSV output.                                 |
| Screenshot export             | Gray   | Not claimed and not needed for core gardening workflow.                                        | Keep out of scope.                                              |
| Embed code                    | Gray   | Not claimed and not useful for local-first garden records.                                     | Keep out of scope.                                              |

## Before Counts

- Green: 0
- Yellow: 2
- Red: 6
- Gray: 2

## Highest-Risk Output Gaps

1. Users cannot take their local garden year to another browser.
2. The visible markdown export cannot be copied or downloaded from the UI.
3. Harvest logs cannot leave the app as CSV.
4. There is no small share link for a project snapshot.
5. There is no test proving export then import restores usable state.

## After Phase 3

| Exit point                    | After | Evidence                                                             |
| ----------------------------- | ----- | -------------------------------------------------------------------- |
| Season markdown export        | Green | Next-Year and Project surfaces copy/download shared markdown output. |
| Full state JSON export        | Green | Project JSON exporter writes a versioned state envelope.             |
| Full state JSON import        | Green | Project imports current envelopes and migrates legacy raw state.     |
| Harvest CSV export            | Green | Project exports spreadsheet-ready harvest CSV with escaping tests.   |
| Copy to clipboard             | Green | JSON, markdown, CSV, and share URL copy controls share one helper.   |
| Share URL                     | Green | Small state hash URLs round-trip in tests and import on app load.    |
| Print / PDF                   | Green | Project print button plus print CSS produce a browser PDF path.      |
| API / automation-ready output | Green | JSON and CSV formats are stable, documented, and tested.             |
| Screenshot export             | Gray  | Not claimed and not needed for core gardening workflow.              |
| Embed code                    | Gray  | Not claimed and not useful for local-first garden records.           |

## After Counts

- Green: 8
- Yellow: 0
- Red: 0
- Gray: 2
