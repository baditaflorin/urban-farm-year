# Phase 3 Stranger Test

## Method

No second human was available in this autonomous pass, so I used the allowed substitute: a fresh Playwright browser context with no prior IndexedDB state. The run used a real seed-packet input and the Project workspace.

Command path:

```sh
make smoke
```

Manual path in the private context:

1. Open app.
2. Paste a tomato seed-packet record into Smart Garden Input.
3. Apply the draft.
4. Open Project.
5. Load the sample input.
6. Apply all drafts.
7. Inspect output cards.
8. Change default harvest unit to `kg`.
9. Open Harvest and add a harvest.

## Findings

| Finding                                                                                                     | Severity | Response                                                         |
| ----------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| The Project raw input field was a single-line input, which felt cramped for real pasted CSV/HTML/text.      | High     | Replaced it with a multiline textarea.                           |
| The Share URL card had a Download button that actually downloaded the primary export, which was misleading. | High     | Removed download from Share URL; it now only copies a share URL. |
| The primary export button did not say which format it would download.                                       | Medium   | Button now includes the selected primary export format.          |

## Result

The private-browser workflow completed without help. The app can now accept a user input, apply it, export project/CSV/markdown, change a setting, and see that setting affect a later workflow.

## Remaining Friction

- URL import still depends on third-party CORS policy; the app gives recovery guidance but cannot bypass it in Mode B.
- Share URLs are intentionally limited to small projects; larger projects need JSON export.
- Classifier output remains broad and is not a disease diagnosis.
