# Phase 2 Substance Real-Data Audit

Status: draft for confirmation

Live v1 audited:

https://baditaflorin.github.io/urban-farm-year/

Repository:

https://github.com/baditaflorin/urban-farm-year

## Summary

V1 is useful when the user accepts the built-in crop catalog and manually enters structured values. It breaks down when the user brings normal gardening inputs: seed packet text, extension planting PDFs, soil reports, harvest spreadsheets, location names outside the seed list, and real plant images.

The core problem is not UI polish. The app has no ingestion and inference layer. It expects the user to translate real-world gardening data into the app's internal schema by hand.

## Real-World Inputs

### 1. Clean Seed Packet/Product Page: Bush Tomato

Source:

https://www.gulleygreenhouse.com/browse/tomato-red-pride-bush-seeds/

Shape: clean HTML product page with smart quotes, Fahrenheit temperatures, inch spacing, frost-relative planting instructions, days to emerge, and row spacing.

What v1 did:

- The user could manually select generic `Tomato`.
- V1 ignored variety-specific details such as 78 days from transplanting, 24 inch seed spacing, 36 inch row spacing, and 4-6 week indoor start guidance.

What it should have done:

- Detect this as a seed packet or seed product page.
- Extract crop, variety, days to maturity, indoor start timing, transplant timing, spacing, depth, soil temperature, and confidence.
- Create a draft crop override the user can accept or correct.

Why it failed:

- No paste/import path.
- No seed-packet parser.
- Crop model is crop-level, not variety-level.
- Unit and phrase normalization are absent.

Failure mode:

Wrong-by-omission. The app produces a generic tomato calendar that looks confident.

Manual work the app forced:

The user has to read the page, convert inches to centimeters, understand "from transplanting," and decide how to adjust the built-in tomato profile.

### 2. Mildly Messy Extension Planting Table: CSU Vegetable Planting Guide

Source:

https://extension.colostate.edu/resource/vegetable-planting-guide/

Shape: HTML table-like text with non-breaking spaces, footnote markers, mixed spacing formats, temperature columns, transplant age, and days-to-harvest values.

What v1 did:

- The user could manually select crops already in the catalog.
- V1 did not ingest the table or reconcile CSU spacing and timing with the local crop records.

What it should have done:

- Recognize the common extension planting-guide shape.
- Extract rows by crop, identify columns, normalize temperatures, ranges, footnotes, spacing, and harvest days.
- Surface conflicts with the built-in crop catalog.

Why it failed:

- No repeated-row detection.
- No field classification.
- No confidence or conflict model.

Failure mode:

Silent mismatch. The app uses its own values and never tells the user a trusted local guide disagrees.

Manual work the app forced:

The user must manually compare the extension table against each crop card.

### 3. Genuinely Messy PDF Table: Cooke County Vegetable Planting Guide

Source:

https://cooke.agrilife.org/files/2011/09/vegetable-planting-guide_2.pdf

Shape: PDF table extraction with page breaks, split headers, broken words, ranges, fractions, footnotes, and multi-season rows.

What v1 did:

- Nothing directly. The user cannot upload or paste the PDF into a meaningful flow.
- If the user manually retypes values, v1 accepts only a small subset.

What it should have done:

- Accept pasted PDF text or uploaded extracted text.
- Detect row fragments, merge wrapped rows, normalize fractions, and mark uncertain cells.
- Produce crop-window drafts rather than requiring manual transcription.

Why it failed:

- No partial/broken input handling.
- No PDF-table normalization policy.
- No anomaly surfacing for row fragments.

Failure mode:

Obvious block. The app has no place for this input.

Manual work the app forced:

The user has to transcribe a difficult PDF table and decide what broken extraction text means.

### 4. Regional PDF With Repeated Sections: University of Illinois Planting Guide

Source:

https://extension.illinois.edu/media/6823/download?inline=

Shape: multi-page PDF with northern, central, and southern regional sections, two planting windows for fall crops, inch spacing, and crop-specific instructions.

What v1 did:

- The user could choose generic crops and manually set frost dates.
- V1 did not infer region, second planting windows, or fall crop opportunities.

What it should have done:

- Detect region-specific sections.
- Ask for or infer the relevant region once.
- Import spring and fall planting windows with provenance and confidence.

Why it failed:

- The planning engine only understands one frost-relative model per crop.
- It lacks a concept of regional guide sections and multiple valid planting windows.

Failure mode:

Wrong-but-confident. Fall plantings and region-specific windows disappear.

Manual work the app forced:

The user has to manually decide whether the generic frost model overrides the local guide.

### 5. Soil Test Interpretation Page/Report Shape

Source:

https://extension.umn.edu/testing-and-analysis/understanding-soil-test-report

Shape: soil report vocabulary includes ppm, pounds per acre, pH, buffer pH, lime guidance, phosphorus extraction methods, and potassium levels.

What v1 did:

- The user could enter pH and choose low/ok/high for N-P-K.
- V1 could not read ppm values, buffer pH, lime recommendations, extraction method, or organic matter interpretation.

What it should have done:

- Parse soil-report fields into structured values.
- Convert ppm/report language into low/ok/high only when the source scale is known.
- Warn when a value cannot be interpreted safely.

Why it failed:

- Soil data model is too shallow.
- No unit, method, or threshold inference.
- No "unknown but important" state.

Failure mode:

Wrong-by-compression. A nuanced soil report is collapsed into a few manual buckets.

Manual work the app forced:

The user has to know agronomy vocabulary and translate lab values into app categories.

### 6. Public Harvest Records: Growstuff Harvests

Source:

https://www.growstuff.org/harvests

Shape: public garden harvest tracking domain with crops, plant parts, quantities, and community records.

What v1 did:

- The user can enter one harvest at a time.
- V1 has no import, no crop-name matching, no plant-part handling, and no unit normalization beyond a fixed select box.

What it should have done:

- Accept a harvest table or CSV export.
- Infer crop, plant part, date, quantity, unit, and confidence.
- Preserve unknown fields instead of dropping them.

Why it failed:

- No tabular import path.
- No schema inference.
- No lossless state export/import.

Failure mode:

Obvious friction. The app is usable only for manual logging.

Manual work the app forced:

The user has to re-enter every harvest and resolve units by hand.

### 7. Real Gardener Spreadsheet Shorthand: Tomato Production Logs

Source:

https://www.reddit.com/r/tomatoes/comments/yn4ov9

Shape: human spreadsheet shorthand such as per-variety picking counts and total weight in compact cells like count/weight.

What v1 did:

- It has no parser for `6/400g`, per-variety columns, or wide spreadsheet layouts.
- The user must split one real-world cell into multiple form fields.

What it should have done:

- Detect wide harvest-log layouts.
- Parse count/weight shorthand.
- Infer that `400g` is weight and `6` is count, then keep both.

Why it failed:

- No format inference.
- Harvest model has only one quantity and one unit per entry.
- No per-field confidence.

Failure mode:

Obvious manual burden.

Manual work the app forced:

The user must normalize a spreadsheet before the app can use it.

### 8. GeoNames-Scale Location Input With Diacritics And Alternate Names

Source:

https://download.geonames.org/export/dump/

Shape: GeoNames-style global location data with UTF-8 names, alternate names, country/admin hierarchy, latitude, longitude, population, and timezones.

What v1 did:

- V1 searches only a small curated seed list.
- A user outside those cities must enter coordinates and frost dates manually.

What it should have done:

- Fuzzy-match city names, diacritics, alternate names, and admin regions.
- Infer timezone and candidate frost dates with visible source confidence.
- Offer "not sure" choices rather than requiring lat/lon knowledge.

Why it failed:

- Location data is too small.
- No fuzzy matching.
- No confidence-ranked location candidates.

Failure mode:

Obvious if the city is missing, but the required manual fix is unreasonable for normal users.

Manual work the app forced:

The user must know or find lat/lon, timezone, and frost dates.

### 9. PlantVillage Leaf Image Dataset

Sources:

https://www.kaggle.com/datasets/mohitsingh1804/plantvillage

https://huggingface.co/datasets/mohanty/PlantVillage

Shape: real image-classification input domain with healthy and diseased plant leaf images across configurations such as color, grayscale, and segmented images.

What v1 did:

- V1 accepts one image and runs a tiny feature-based ONNX model.
- It returns broad labels such as "Leafy edible" or "Stress or disease sign."
- It cannot identify crop species, disease class, image quality, or "not enough evidence."

What it should have done:

- Distinguish health/stress/species only when the model supports it.
- Say when the image is outside model scope.
- Carry low confidence into the result and any export.

Why it failed:

- The model is a smoke-test classifier, not a domain classifier.
- No model-card style limits are surfaced.
- Confidence is numeric but not calibrated.

Failure mode:

Wrong-but-confident risk. A user may treat a vague classifier label as diagnosis.

Manual work the app forced:

The user has to know the classifier is not a real disease model.

### 10. Real Gardener Planning Intent: Planting Date To Journal And Succession

Source:

https://www.reddit.com/r/gardening/comments/n7fm0a/garden_planners_a_rant/

Shape: plain-language planning intent from a gardener who wants planting dates, harvest windows, journal entries, and succession logic to coordinate automatically.

What v1 did:

- V1 can generate a generic calendar before the user records a real planting date.
- Care logs, harvest predictions, and next-year planning do not become a coherent planting lifecycle for a specific planting.

What it should have done:

- Let a real planting date become the anchor for expected harvest, care tasks, journal history, takeout/compost timing, and succession opportunities.
- Treat each planting as a lifecycle with stable ID and state.

Why it failed:

- The planner is crop-centric, not planting-instance-centric.
- Care logs and harvests are adjacent screens, not one coherent state machine.
- No succession model uses weather, frost windows, or bed availability.

Failure mode:

Wrong-by-missing-connection. The pieces exist, but the user must mentally connect them.

Manual work the app forced:

The user must remember which planting a task, care note, or harvest belongs to and decide when that space is free again.

## Top 5 Logic Gaps

1. No ingestion layer for real gardening inputs. Seed pages, PDFs, CSVs, reports, and notes cannot become drafts.
2. No inference engine. The app does not infer crop, variety, timing, units, dates, soil fields, or harvest schema from user-provided data.
3. Crop planning is generic. It loses variety-specific instructions, transplant-vs-seed maturity semantics, regional extension windows, and fall succession windows.
4. Units and domain formats are not normalized. Inches, centimeters, Fahrenheit, Celsius, ppm, pounds per acre, grams, pounds, fractions, ranges, and shorthand like `6/400g` are not handled.
5. Confidence and provenance are missing from most outputs. The app looks certain even when it used generic defaults or ignored a real-world source.

## Top 3 Intuition Failures

1. A user expects to paste or upload what they already have. V1 instead starts with empty manual forms.
2. Weather and local guidance do not affect the plan. The app shows advice, but the calendar does not shift or explain tradeoffs.
3. The classifier feels more authoritative than it is. It returns a label and percentage without making model limits obvious enough.

## Top 3 "Feels Stupid" Moments

1. The user must translate seed-packet phrases into internal crop settings the app should infer.
2. The user must convert soil report numbers and methods into low/ok/high buckets.
3. The user must split harvest spreadsheet shorthand into individual form entries.

## What Smart Means For Urban Farm Year

1. Pasting a seed packet, extension table row, soil report excerpt, harvest CSV row, or mixed garden note immediately produces a useful draft.
2. The draft normalizes units, dates, ranges, frost-relative phrases, and crop names while showing confidence and source evidence.
3. The app flags uncertainty in domain terms: unknown crop, ambiguous unit, unsupported soil method, missing year, outside classifier scope.
4. The planner uses real source facts when confidence is high and falls back to catalog defaults only when it says it is doing so.
5. Every generated plan, soil interpretation, harvest import, and classifier result carries provenance sufficient to reproduce the decision.

## Phase 2 Substance Success Metrics

1. At least 7 of the 10 real-data fixtures produce a useful draft with no manual setup beyond providing the input.
2. All 10 fixtures complete without crashes; unsupported inputs produce actionable domain errors.
3. Identical fixture input produces byte-identical normalized output in 100 percent of determinism tests.
4. Every inferred field in fixture output includes confidence and at least one reason.
5. Median time from paste/import to preview is under 1 second for text fixtures; worst text fixture is under 5 seconds or cancellable.
6. Soil and harvest normalization correctly identifies units and values for at least 8 of 10 representative fields in the fixture set.
7. No wrong-but-confident classifier result: unsupported or low-confidence image cases must say they are low confidence.

## Explicitly Out Of Scope

- No runtime backend, auth, cross-device sync, or architecture mode change.
- No new major user-facing feature area.
- No visual polish, dark mode, command palette, animations, or marketing work.
- No production-grade medical/agronomic diagnosis.
- No complete global crop encyclopedia.
- No complete GeoNames or OSM/libosmscout import until the Phase 2 plan ranks it against the fixtures.
- No Phase 3 polish work before the substance pass-rate improves.
