import type { SmartInputKind } from './types';

type Detection = {
  kind: SmartInputKind;
  score: number;
  reasons: string[];
};

export function detectInputKind(text: string): Detection {
  const candidates: Detection[] = [
    score('soil_report', text, [
      [/soil test|soil report|buffer ph/i, 0.35, 'soil report vocabulary'],
      [/\bpH\s*\d/i, 0.25, 'pH value'],
      [/phosphorus|potassium|organic matter|ppm/i, 0.3, 'soil nutrient values'],
    ]),
    score('harvest_log', text, [
      [/harvest|quantity|unit|crop,part|source,date,crop/i, 0.3, 'harvest table header'],
      [/date[,\t].*crop[,\t].*quantity[,\t].*unit/i, 0.35, 'date crop quantity unit columns'],
      [/\d+\/\d+(?:\.\d+)?\s*(?:g|kg|oz|lb)\b/i, 0.35, 'harvest count/weight shorthand'],
      [/\b\d+(?:\.\d+)?\s*(?:g|kg|oz|lb|bunch|piece)\b/i, 0.2, 'harvest quantity unit'],
    ]),
    score('location_record', text, [
      [/geonameid|asciiname|alternatenames/i, 0.45, 'GeoNames-style header'],
      [/\b-?\d{1,2}\.\d{2,}\b.*\b-?\d{1,3}\.\d{2,}\b/, 0.25, 'latitude longitude pair'],
      [/[A-Z][a-z]+\/[A-Za-z_]+/, 0.2, 'timezone value'],
    ]),
    score('plant_image_manifest', text, [
      [/filename,class,variant/i, 0.35, 'image manifest header'],
      [/\.(?:jpg|jpeg|png)\b/i, 0.2, 'image filename'],
      [/___|early_blight|healthy|segmented|color/i, 0.25, 'PlantVillage class naming'],
    ]),
    score('gardener_intent', text, [
      [/i planted|planted .* on/i, 0.3, 'planting statement'],
      [
        /reminder|journal|succession|bed opens|expected harvest/i,
        0.35,
        'planning intent vocabulary',
      ],
      [/care|harvest/i, 0.15, 'care and harvest lifecycle'],
    ]),
    score('seed_packet', text, [
      [/seed depth|sow indoors|last frost|days from transplant/i, 0.35, 'seed packet instructions'],
      [/\b\d+\s*-\s*\d+\s*(?:weeks|wks)\b/i, 0.2, 'frost-relative week range'],
      [/\b\d+\s*days\b/i, 0.2, 'days to maturity'],
      [/\bspace|spacing|apart\b/i, 0.15, 'spacing instruction'],
    ]),
    score('planting_guide', text, [
      [/planting guide|spring|fall|soil temp|days to harvest/i, 0.3, 'planting guide vocabulary'],
      [/crop\s+soil temp|crop\s+.*days to harvest/i, 0.2, 'planting table header'],
      [/\b(?:lettuce|carrot|tomato|bean|beet)s?\b/i, 0.15, 'crop rows'],
      [
        /\b\d+\/\d+\s*-\s*\d+\/\d+\b|\b[A-Z][a-z]{2}\s+\d+\s*-\s*[A-Z][a-z]{2}\s+\d+\b/,
        0.25,
        'planting date window',
      ],
      [/\b\d+\s*-\s*\d+\s*(?:days|in)\b/i, 0.2, 'range values'],
    ]),
  ];

  const best = candidates.sort((a, b) => b.score - a.score)[0];
  if (!best || best.score < 0.25) {
    return {
      kind: 'unknown',
      score: 0.1,
      reasons: ['No known gardening input shape was strong enough.'],
    };
  }
  return best;
}

function score(
  kind: SmartInputKind,
  text: string,
  checks: Array<[RegExp, number, string]>,
): Detection {
  const reasons: string[] = [];
  let total = 0;
  for (const [pattern, value, reason] of checks) {
    if (pattern.test(text)) {
      total += value;
      reasons.push(reason);
    }
  }
  return { kind, score: Math.min(0.98, total), reasons };
}
