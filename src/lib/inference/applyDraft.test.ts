import { describe, expect, it } from 'vitest';
import type { Crop } from '../../features/garden/types';
import { defaultState } from '../stateSchema';
import { inferGardenInput } from './index';
import { applySmartDraft } from './applyDraft';

const crops: Crop[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    family: 'Solanaceae',
    crop_type: 'fruit',
    frost_hardiness: 'tender',
    season: 'warm',
    days_to_maturity: 75,
    indoor_start_weeks_before_last_frost: 8,
    direct_sow_weeks_before_last_frost: 3,
    transplant_weeks_after_last_frost: 2,
    harvest_start_days_after_plant: 65,
    harvest_window_days: 75,
    spacing_cm: 45,
    water_mm_per_week: 30,
    sun_hours_min: 8,
    ph_min: 6,
    ph_max: 6.8,
    feed_level: 'heavy',
    companions: [],
    avoid_after_family: 'Solanaceae',
    notes: '',
  },
];

describe('applySmartDraft', () => {
  it('applies soil drafts once and keeps existing work intact', () => {
    const draft = inferGardenInput(
      'Soil Test Report pH 5,8 Organic matter 3.1% Phosphorus 22 ppm Potassium 164 ppm',
    );
    const applied = applySmartDraft(draft, defaultState, crops);
    const repeated = applySmartDraft(draft, applied, crops);

    expect(applied.soilTests).toHaveLength(1);
    expect(applied.activityLog).toHaveLength(1);
    expect(repeated.soilTests).toHaveLength(1);
    expect(repeated.activityLog).toHaveLength(1);
  });

  it('applies crop and harvest fields into existing workflows', () => {
    const draft = inferGardenInput('date,crop,part,quantity,unit\n2024-07-12,tomato,fruit,2.5,kg');
    const applied = applySmartDraft(draft, { ...defaultState, selectedCropIds: [] }, crops);

    expect(applied.selectedCropIds).toContain('tomato');
    expect(applied.harvests[0]).toMatchObject({ cropName: 'Tomato', quantity: 2.5, unit: 'kg' });
  });
});
