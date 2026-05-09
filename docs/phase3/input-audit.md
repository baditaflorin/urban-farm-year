# Phase 3 Input Pathway Audit

Status key: green = works end-to-end on user data, yellow = works partially, red = claimed or visible but broken, gray = deliberately not built.

| Entry point                        | Before | Evidence                                                                                                                   | Target disposition                                                           |
| ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Text paste into Smart Garden Input | Green  | Pasted seed packets, planting guide rows, soil reports, harvest CSV text, GeoNames rows, and notes produce Phase 2 drafts. | Keep, add autosave and import sharing.                                       |
| HTML paste                         | Yellow | Browser paste as plain text works if the useful content is copied; raw HTML files are not routed by a file input.          | Add file sniffing and route HTML text to the same inference path.            |
| CSV / TSV text paste               | Green  | Fixture `06-growstuff-harvests.csv` and `07-tomato-spreadsheet.tsv` pass inference tests.                                  | Keep and expose through file import.                                         |
| File upload for garden text data   | Red    | Only classifier image upload exists; text/CSV/TSV/HTML/JSON state files have no input path.                                | Add project file picker with format detection.                               |
| Drag and drop for garden text data | Red    | No drop target exists for project data.                                                                                    | Add project drop zone with multi-file handling.                              |
| Multi-file / batch input           | Red    | No UI accepts more than one garden text input at a time.                                                                   | Add batch import result list and apply-all for draft files.                  |
| Clipboard read button              | Red    | Paste box works manually, but there is no permission-aware read button.                                                    | Add clipboard read with fallback guidance.                                   |
| URL input                          | Red    | No URL import exists.                                                                                                      | Add URL fetch attempt and honest CORS recovery text.                         |
| Mobile file picker                 | Yellow | Classifier file input invokes mobile pickers for image upload; garden text import is absent.                               | Add accept filters for text/CSV/JSON/image sources.                          |
| Image upload                       | Yellow | Classifier accepts one image via file picker. No drag-drop or batch flow.                                                  | Keep as scoped image path; document multi-image as out of scope for Phase 3. |
| Sample/demo input                  | Yellow | Placeholder text exists, but no one-click sample loader.                                                                   | Add sample loader beside real-data import.                                   |
| Imported state                     | Red    | State persists in IndexedDB, but there is no downloadable/importable state file.                                           | Add versioned state import.                                                  |
| Restored autosave                  | Yellow | Garden records persist, but the in-progress smart input text does not.                                                     | Add setting-backed smart input autosave.                                     |
| Deep links / shared state          | Red    | No hash state import/export.                                                                                               | Add small-state share URL with documented size limit.                        |

## Before Counts

- Green: 2
- Yellow: 4
- Red: 8
- Gray: 0

## Highest-Risk Input Gaps

1. A user cannot upload their real garden CSV, TSV, HTML, or text file.
2. A user cannot export state on one browser and import it on another.
3. A copied URL is a dead end without explicit CORS guidance.
4. Batch records require manual paste one file at a time.
5. In-progress smart input text disappears on reload.
