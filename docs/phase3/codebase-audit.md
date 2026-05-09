# Phase 3 Codebase Health Audit

This is a measurement-only audit before Phase 3 implementation.

## DRY Violations

| Area                            | Before                                                                                         | Files                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Domain select options           | Soil nutrient/texture and harvest unit literals are duplicated in UI and type casts.           | `src/features/soil/SoilPanel.tsx`, `src/features/harvest/HarvestPanel.tsx`, `src/features/garden/types.ts` |
| Export markdown                 | Markdown generation is embedded inside the Next-Year UI instead of a reusable output module.   | `src/features/next-year/NextYearPanel.tsx`                                                                 |
| State shape defaults/validation | `defaultState` and `UserState` exist, but persistence trusts partial unknown data with a cast. | `src/lib/storage.ts`, `src/features/garden/types.ts`                                                       |
| Clipboard/download behavior     | No canonical helper exists because output controls are missing.                                | Not yet implemented                                                                                        |

## SOLID / Boundary Issues

| Issue                                                                   | Before                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------- |
| `NextYearPanel` both renders UI and owns export serialization.          | Split exporter logic into `src/lib/exporters.ts`.     |
| Storage reads unknown IndexedDB data and casts to `Partial<UserState>`. | Add schema-backed parsing and migration.              |
| App has no project-level boundary for import/export/settings.           | Add `features/project` as the input/output workspace. |
| `OverviewPanel` accepts `setActiveTab` but never uses it.               | Remove unused prop.                                   |

## Dead Code / Dormant Code

- No large abandoned files found.
- `OverviewPanel.setActiveTab` prop is unused.
- `llmEndpoint` is persisted but no UI control sets it. It is retained as a local browser-model compatibility field from Phase 1 and should either be managed in settings or removed after a migration.

## TODO / FIXME / XXX / HACK

- Production source count: 0.
- Documentation mentions deferred libosmscout work honestly in postmortem.

## Type Safety Holes

| Pattern                      | Before                                                           |
| ---------------------------- | ---------------------------------------------------------------- |
| UI casts from string selects | Harvest unit, soil nutrient, and soil texture cast from strings. |
| IndexedDB cast               | Stored unknown is cast to `Partial<UserState>`.                  |
| DuckDB row casts             | DuckDB boundary normalizes unknown rows using casts.             |
| ONNX tensor cast             | Classifier assumes `Float32Array`.                               |
| Vite env cast                | Version module uses an import-meta boundary cast.                |

## Inconsistent Patterns

- Error messages vary between raw error strings and domain-actionable guidance.
- Persisted state is not versioned while static data is versioned.
- Outputs are generated ad hoc in UI components.

## Test Coverage Holes

1. No test for state export/import round trip.
2. No test for share-link state encoding.
3. No test for CSV escaping.
4. No e2e coverage for project import/export controls.
5. No test that persisted legacy state migrates forward.
