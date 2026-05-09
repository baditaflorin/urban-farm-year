import type { DraftAnomaly, InferredField, SmartInputKind, SuggestedAction } from './types';
import { stableId } from './stable';

const cropAliases: Array<[RegExp, string]> = [
  [/\btomato(?:es)?\b/i, 'tomato'],
  [/\blettuce\b/i, 'lettuce'],
  [/\bcarrots?\b/i, 'carrot'],
  [/\bbeans?(?:,\s*bush)?\b|\bbush beans?\b/i, 'bean'],
  [/\bbeets?\b/i, 'beet'],
  [/\bbasil\b/i, 'basil'],
  [/\bpepper\b/i, 'pepper'],
];

export type ExtractionResult = {
  fields: InferredField[];
  anomalies: DraftAnomaly[];
  suggestedActions: SuggestedAction[];
};

export function extractFields(kind: SmartInputKind, text: string): ExtractionResult {
  const fields: InferredField[] = [];
  const anomalies: DraftAnomaly[] = [];
  const suggestedActions: SuggestedAction[] = [];
  const add = fieldAdder(fields);

  for (const [pattern, crop] of cropAliases) {
    if (pattern.test(text)) {
      add('crop', 'Crop', crop, crop, 0.78, ['Matched a known crop name.']);
    }
  }

  if (kind === 'seed_packet') {
    extractSeedPacket(text, add, suggestedActions);
  }
  if (kind === 'planting_guide') {
    extractPlantingGuide(text, add, anomalies, suggestedActions);
  }
  if (kind === 'soil_report') {
    extractSoilReport(text, add, anomalies, suggestedActions);
  }
  if (kind === 'harvest_log') {
    extractHarvestLog(text, add, anomalies, suggestedActions);
  }
  if (kind === 'location_record') {
    extractLocationRecord(text, add, suggestedActions);
  }
  if (kind === 'plant_image_manifest') {
    extractPlantImageManifest(text, add, anomalies, suggestedActions);
  }
  if (kind === 'gardener_intent') {
    extractGardenerIntent(text, add, suggestedActions);
  }

  if (fields.length === 0) {
    anomalies.push({
      code: 'no_fields_detected',
      severity: 'blocker',
      message: 'The input looked garden-related, but no usable field was detected.',
      suggestion: 'Paste a more complete row, report excerpt, or seed packet block.',
    });
  }

  return { fields: dedupeFields(fields), anomalies, suggestedActions };
}

type AddField = (
  key: string,
  label: string,
  value: string | number | boolean,
  raw: string,
  confidence: number,
  reasons: string[],
) => void;

function fieldAdder(fields: InferredField[]): AddField {
  return (key, label, value, raw, confidence, reasons) => {
    fields.push({
      id: stableId('field', key, String(value), raw),
      key,
      label,
      value,
      raw,
      confidence,
      reasons,
    });
  };
}

function extractSeedPacket(text: string, add: AddField, suggestedActions: SuggestedAction[]) {
  const variety = /tomato\s+"?([^".\n]+?)"?(?:\s+bush|\.|\n)/i.exec(text)?.[1]?.trim();
  if (variety && !/^tomato$/i.test(variety)) {
    add('variety', 'Variety', titleCase(variety.replace(/\s+bush$/i, '')), variety, 0.82, [
      'Found a crop name followed by variety text.',
    ]);
  }

  const days = /(\d{2,3})\s+days(?:\s+from\s+transplant)?/i.exec(text);
  if (days) {
    add('days_to_maturity', 'Days to maturity', Number(days[1]), days[0], 0.86, [
      'Matched seed packet maturity phrase.',
    ]);
  }

  const weeks = /(\d+)\s*-\s*(\d+)\s*(?:weeks|wks).*?last frost/i.exec(text);
  if (weeks) {
    const midpoint = Math.round((Number(weeks[1]) + Number(weeks[2])) / 2);
    add(
      'indoor_start_weeks_before_last_frost',
      'Indoor start weeks before last frost',
      midpoint,
      weeks[0],
      0.78,
      ['A frost-relative week range was averaged for a first draft.'],
    );
    suggestedActions.push({
      id: 'review-week-range',
      label: 'Review week range',
      detail: 'The seed packet gave a range, so the draft used the midpoint.',
      confidence: 0.78,
    });
  }

  const spacing = /(?:space|spacing).*?(\d+(?:\.\d+)?)\s*(?:in|")/i.exec(text);
  if (spacing) {
    add('spacing_cm', 'Plant spacing', inchesToCM(Number(spacing[1])), spacing[0], 0.82, [
      'Converted inch spacing to centimeters.',
    ]);
  }

  const temp = /(\d{2,3})\s*-\s*(\d{2,3})\s*F/i.exec(text);
  if (temp) {
    add(
      'soil_temperature_c_min',
      'Minimum soil temperature',
      fToC(Number(temp[1])),
      temp[0],
      0.76,
      ['Converted Fahrenheit range to Celsius.'],
    );
    add(
      'soil_temperature_c_max',
      'Maximum soil temperature',
      fToC(Number(temp[2])),
      temp[0],
      0.76,
      ['Converted Fahrenheit range to Celsius.'],
    );
  }
}

function extractPlantingGuide(
  text: string,
  add: AddField,
  anomalies: DraftAnomaly[],
  suggestedActions: SuggestedAction[],
) {
  for (const region of text.matchAll(/\b(Northern|Central|Southern)\s+Illinois\b/gi)) {
    add('region', 'Region', titleCase(region[0]), region[0], 0.76, [
      'Detected a regional planting guide section.',
    ]);
  }

  if (/\bfall\b/i.test(text)) {
    add('season_window', 'Season window', 'fall', 'fall', 0.72, [
      'Detected a fall planting window.',
    ]);
  }
  if (/\bspring\b/i.test(text)) {
    add('season_window', 'Season window', 'spring', 'spring', 0.7, [
      'Detected a spring planting window.',
    ]);
  }

  for (const match of text.matchAll(/(\d{1,3})\s*-\s*(\d{1,3})\s*(?:days|$)/gi)) {
    add('days_to_maturity', 'Days to maturity', Number(match[2]), match[0], 0.68, [
      'Used the upper end of a days-to-harvest range.',
    ]);
  }
  for (const match of text.matchAll(
    /^(?:.*\b(?:lettuce|carrot|bean|beet|tomato)\b.*?)(\d{2,3})\s*-\s*(\d{2,3})$/gim,
  )) {
    add('days_to_maturity', 'Days to maturity', Number(match[2]), match[0], 0.66, [
      'Used the final range in a crop row as days to harvest.',
    ]);
  }
  for (const match of text.matchAll(/\bmaturity\s+(\d{1,3})\b/gi)) {
    add('days_to_maturity', 'Days to maturity', Number(match[1]), match[0], 0.72, [
      'Detected explicit maturity value.',
    ]);
  }

  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:in|")/gi)) {
    add('spacing_cm', 'Plant spacing', inchesToCM(Number(match[1])), match[0], 0.58, [
      'Converted the low end of an inch range for tight urban spacing.',
    ]);
    add('spacing_cm', 'Plant spacing', inchesToCM(Number(match[2])), match[0], 0.62, [
      'Converted the high end of an inch range for review.',
    ]);
  }
  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*(?:in|")\s+spacing/gi)) {
    add('spacing_cm', 'Plant spacing', inchesToCM(Number(match[1])), match[0], 0.7, [
      'Converted inch spacing to centimeters.',
    ]);
  }

  if (/wrapped|Carrots/i.test(text) && /Carrots/i.test(text)) {
    anomalies.push({
      code: 'wrapped_word',
      severity: 'warning',
      message: 'A PDF row appears to have a wrapped crop name.',
      suggestion: 'Review the merged crop row before applying it.',
    });
  }

  suggestedActions.push({
    id: 'review-local-guide',
    label: 'Review local guide values',
    detail: 'Planting guides often contain regional exceptions and footnotes.',
    confidence: 0.66,
  });
}

function extractSoilReport(
  text: string,
  add: AddField,
  anomalies: DraftAnomaly[],
  suggestedActions: SuggestedAction[],
) {
  addNumber(text, /\bpH\s+(\d+(?:\.\d+)?)/i, 'ph', 'Soil pH', add, 0.9, 'Detected pH value.');
  addNumber(
    text,
    /buffer\s+pH\s+(\d+(?:\.\d+)?)/i,
    'buffer_ph',
    'Buffer pH',
    add,
    0.86,
    'Detected buffer pH value.',
  );
  addNumber(
    text,
    /organic matter\s+(\d+(?:\.\d+)?)%/i,
    'organic_matter_pct',
    'Organic matter',
    add,
    0.88,
    'Detected organic matter percentage.',
  );
  addNumber(
    text,
    /phosphorus.*?(\d+(?:\.\d+)?)\s*ppm/i,
    'phosphorus_ppm',
    'Phosphorus',
    add,
    0.84,
    'Detected phosphorus ppm.',
  );
  addNumber(
    text,
    /potassium\s+(\d+(?:\.\d+)?)\s*ppm/i,
    'potassium_ppm',
    'Potassium',
    add,
    0.84,
    'Detected potassium ppm.',
  );

  if (/bray|mehlich|olsen/i.test(text)) {
    anomalies.push({
      code: 'soil_method_specific',
      severity: 'info',
      message: 'The soil report names an extraction method.',
      suggestion: 'Use lab-specific thresholds before converting ppm to low/ok/high.',
    });
  }
  suggestedActions.push({
    id: 'review-soil-thresholds',
    label: 'Review soil thresholds',
    detail: 'Nutrient ppm needs lab-method context before strong recommendations.',
    confidence: 0.82,
  });
}

function extractHarvestLog(
  text: string,
  add: AddField,
  anomalies: DraftAnomaly[],
  suggestedActions: SuggestedAction[],
) {
  const lines = text.split('\n').filter(Boolean);
  const delimiter = text.includes('\t') ? '\t' : ',';
  const headerLineIndex = Math.max(
    0,
    lines.findIndex((line) => /date/i.test(line) && line.split(delimiter).length > 2),
  );
  const header = lines[headerLineIndex]?.split(delimiter).map((part) => part.trim()) ?? [];

  for (const headerCell of header) {
    if (
      !/source|date|crop|part|quantity|unit|notes/i.test(headerCell) &&
      /[A-Za-z]/.test(headerCell)
    ) {
      add('variety', 'Variety', headerCell, headerCell, 0.64, [
        'Detected a wide spreadsheet variety column.',
      ]);
    }
  }

  for (const line of lines.slice(headerLineIndex + 1)) {
    const cells = line.split(delimiter).map((part) => part.trim());
    const cropIndex = header.findIndex((part) => /^crop$/i.test(part));
    const partIndex = header.findIndex((part) => /^part$/i.test(part));
    const quantityIndex = header.findIndex((part) => /^quantity$/i.test(part));
    const unitIndex = header.findIndex((part) => /^unit$/i.test(part));
    if (cropIndex >= 0 && cells[cropIndex]) {
      add('crop', 'Crop', cells[cropIndex].toLowerCase(), cells[cropIndex], 0.86, [
        'Used the crop column.',
      ]);
    }
    if (partIndex >= 0 && cells[partIndex]) {
      add('plant_part', 'Plant part', cells[partIndex].toLowerCase(), cells[partIndex], 0.8, [
        'Used the plant part column.',
      ]);
    }
    if (quantityIndex >= 0 && cells[quantityIndex]) {
      add('quantity', 'Quantity', Number(cells[quantityIndex]), cells[quantityIndex], 0.84, [
        'Used the quantity column.',
      ]);
    }
    if (unitIndex >= 0 && cells[unitIndex]) {
      add('unit', 'Unit', cells[unitIndex], cells[unitIndex], 0.84, ['Used the unit column.']);
    }
  }

  for (const match of text.matchAll(/(\d+)\/(\d+(?:\.\d+)?)(g|kg|oz|lb)\b/gi)) {
    add('count', 'Harvest count', Number(match[1]), match[0], 0.7, [
      'Parsed count/weight shorthand.',
    ]);
    add('quantity', 'Quantity', Number(match[2]), match[0], 0.7, [
      'Parsed count/weight shorthand.',
    ]);
    add('unit', 'Unit', match[3].toLowerCase(), match[0], 0.7, ['Parsed count/weight shorthand.']);
    anomalies.push({
      code: 'harvest_shorthand',
      severity: 'warning',
      message: 'A compact count/weight cell was detected.',
      suggestion: 'Review whether the count and weight should both be saved.',
    });
  }

  suggestedActions.push({
    id: 'review-harvest-units',
    label: 'Review harvest units',
    detail: 'Mixed units can be imported, but summaries stay grouped by unit.',
    confidence: 0.72,
  });
}

function extractLocationRecord(text: string, add: AddField, suggestedActions: SuggestedAction[]) {
  const lines = text.split('\n').filter((line) => line.includes('\t'));
  const header = lines[0]?.split('\t').map((part) => part.trim().toLowerCase()) ?? [];
  const row = lines[1]?.split('\t').map((part) => part.trim()) ?? [];
  const get = (key: string) => row[header.indexOf(key)];

  const name = get('name');
  const lat = get('latitude');
  const lon = get('longitude');
  const timezone = get('timezone');
  if (name)
    add('location_name', 'Location name', name, name, 0.9, ['Used the GeoNames name column.']);
  if (lat)
    add('latitude', 'Latitude', Number(lat), lat, 0.9, ['Used the GeoNames latitude column.']);
  if (lon)
    add('longitude', 'Longitude', Number(lon), lon, 0.9, ['Used the GeoNames longitude column.']);
  if (timezone)
    add('timezone', 'Timezone', timezone, timezone, 0.88, ['Used the GeoNames timezone column.']);

  suggestedActions.push({
    id: 'choose-location-candidate',
    label: 'Choose location candidate',
    detail: 'Location rows can have alternate names; verify the right city before applying.',
    confidence: 0.86,
  });
}

function extractPlantImageManifest(
  text: string,
  add: AddField,
  anomalies: DraftAnomaly[],
  suggestedActions: SuggestedAction[],
) {
  for (const match of text.matchAll(/([A-Za-z_]+)___([A-Za-z_]+)/g)) {
    add('crop', 'Crop', titleCase(match[1].replace(/_/g, ' ')).toLowerCase(), match[0], 0.78, [
      'Detected PlantVillage crop class naming.',
    ]);
    add('condition', 'Condition', titleCase(match[2].replace(/_/g, ' ')), match[0], 0.72, [
      'Detected PlantVillage condition class naming.',
    ]);
  }
  anomalies.push({
    code: 'classifier_scope',
    severity: 'warning',
    message: 'This is an image manifest, not a plant image.',
    suggestion: 'Use it for classifier scope checks, not as a diagnosis.',
  });
  suggestedActions.push({
    id: 'review-classifier-scope',
    label: 'Review classifier scope',
    detail: 'The current ONNX model is not a PlantVillage disease classifier.',
    confidence: 0.72,
  });
}

function extractGardenerIntent(text: string, add: AddField, suggestedActions: SuggestedAction[]) {
  const planting = /planted\s+([A-Za-z]+).*?\b([A-Z][a-z]{2})\s+(\d{1,2})/i.exec(text);
  if (planting) {
    add('crop', 'Crop', planting[1].toLowerCase().replace(/s$/, ''), planting[1], 0.76, [
      'Detected a planting statement.',
    ]);
    add(
      'planting_date',
      'Planting date',
      monthDay(planting[2], Number(planting[3])),
      planting[0],
      0.68,
      ['Detected month and day without a year.'],
    );
  }
  for (const intent of ['reminders', 'journal', 'harvest', 'succession']) {
    if (new RegExp(intent, 'i').test(text)) {
      add('intent', 'Intent', intent, intent, 0.64, ['Detected planning intent vocabulary.']);
    }
  }
  suggestedActions.push({
    id: 'create-planting-lifecycle',
    label: 'Create planting lifecycle',
    detail: 'Use the planting date to connect care, harvest, and succession.',
    confidence: 0.66,
  });
}

function addNumber(
  text: string,
  pattern: RegExp,
  key: string,
  label: string,
  add: AddField,
  confidence: number,
  reason: string,
) {
  const match = pattern.exec(text);
  if (match?.[1]) {
    add(key, label, Number(match[1]), match[0], confidence, [reason]);
  }
}

function dedupeFields(fields: InferredField[]): InferredField[] {
  const seen = new Set<string>();
  return fields.filter((field) => {
    const key = `${field.key}:${String(field.value).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inchesToCM(value: number): number {
  return Math.round(value * 2.54);
}

function fToC(value: number): number {
  return Math.round(((value - 32) * 5) / 9);
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function monthDay(month: string, day: number): string {
  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];
  const index = months.indexOf(month.slice(0, 3).toLowerCase());
  return `${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
