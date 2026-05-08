import { describe, expect, it } from 'vitest';
import type { Crop, SoilTest } from '../features/garden/types';
import { analyzeSoil } from './soil';

const crop: Crop = {
  id: 'lettuce',
  name: 'Lettuce',
  family: 'Asteraceae',
  crop_type: 'leaf',
  frost_hardiness: 'semi-hardy',
  season: 'cool',
  days_to_maturity: 45,
  indoor_start_weeks_before_last_frost: 4,
  direct_sow_weeks_before_last_frost: -4,
  transplant_weeks_after_last_frost: 0,
  harvest_start_days_after_plant: 30,
  harvest_window_days: 50,
  spacing_cm: 20,
  water_mm_per_week: 18,
  sun_hours_min: 4,
  ph_min: 6,
  ph_max: 7,
  feed_level: 'light',
  companions: [],
  avoid_after_family: 'Asteraceae',
  notes: 'Shade in heat',
};

const test: SoilTest = {
  id: 'soil',
  date: '2026-05-08',
  ph: 5.4,
  nitrogen: 'low',
  phosphorus: 'ok',
  potassium: 'ok',
  organicMatterPct: 3,
  texture: 'loam',
  note: '',
};

describe('soil advice', () => {
  it('flags low pH and low nutrients', () => {
    const advice = analyzeSoil(test, [crop]);
    expect(advice.some((item) => item.title.includes('pH'))).toBe(true);
    expect(advice.some((item) => item.title.includes('Nitrogen'))).toBe(true);
  });
});
