# Phase 3 Controls Audit

Status key: green = does what the label says end-to-end, yellow = works but incomplete feedback/recovery, red = visible control that does not complete its promise.

| Surface            | Control                                                          | Before | Notes                                                                                      |
| ------------------ | ---------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Header             | Star on GitHub                                                   | Green  | Links to repository.                                                                       |
| Header             | Support                                                          | Green  | Links to PayPal.                                                                           |
| Navigation         | Overview / Plan / Care / Soil / Harvest / Classifier / Next Year | Green  | Switches panels.                                                                           |
| Garden Profile     | Reset icon                                                       | Yellow | Resets local IndexedDB state, but has no confirmation or recovery path.                    |
| Garden Profile     | Location search rows                                             | Green  | Updates location, coordinates, timezone, frost dates.                                      |
| Garden Profile     | Numeric/text profile fields                                      | Yellow | Persist, but invalid values are accepted silently.                                         |
| Crop Plan          | Crop cards                                                       | Green  | Toggles selected crops and updates calendar.                                               |
| Smart Garden Input | Paste textarea                                                   | Green  | Produces draft inference.                                                                  |
| Smart Garden Input | Apply draft                                                      | Green  | Applies high/review drafts and logs activity.                                              |
| Smart Garden Input | Clear                                                            | Green  | Clears local input.                                                                        |
| Smart Garden Input | Remember                                                         | Yellow | Stores correction memory, but there is no visible management surface.                      |
| Care               | Weather query                                                    | Yellow | Loads Open-Meteo when available, but cannot be disabled and has no failure explanation.    |
| Care               | Add                                                              | Green  | Persists care log.                                                                         |
| Soil               | Save soil test                                                   | Green  | Persists soil test.                                                                        |
| Harvest            | Add                                                              | Green  | Persists harvest.                                                                          |
| Harvest            | Analyze with DuckDB                                              | Yellow | Runs lazily, but failure is not surfaced.                                                  |
| Classifier         | Upload a plant image                                             | Yellow | Accepts one image and classifies locally, but no drag-drop or scope warning before upload. |
| Next-Year          | Refresh advice                                                   | Green  | Uses browser-local/heuristic advice.                                                       |
| Next-Year          | Season Export textarea                                           | Red    | Output appears but cannot be copied/downloaded with a control.                             |

## Before Counts

- Green: 12
- Yellow: 7
- Red: 1

## Control Priorities

1. Add explicit output controls for the season export.
2. Add a project workspace for import/export/settings instead of hiding those flows in unrelated panels.
3. Add actionable failure states for weather, DuckDB, URL import, and file import.
4. Make every setting visible, persistent, and behavior-changing.
