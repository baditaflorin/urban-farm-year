import { describe, expect, it } from 'vitest';
import type { Crop, GardenProfile } from '../features/garden/types';
import { generatePlanTasks, planDensityScore } from './planning';

const tomato: Crop = {
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
  companions: ['basil'],
  avoid_after_family: 'Solanaceae',
  notes: 'Prune lower leaves',
};

const profile: GardenProfile = {
  locationName: 'Test',
  latitude: 40,
  longitude: -75,
  timezone: 'America/New_York',
  lastFrost: '04-15',
  firstFrost: '10-30',
  bedAreaM2: 4,
  containers: 4,
  sunlightHours: 7,
  waterBudgetLiters: 30,
};

describe('planning', () => {
  it('generates the expected tomato task types', () => {
    const tasks = generatePlanTasks([tomato], profile);
    expect(tasks.map((task) => task.type)).toEqual(['indoors', 'transplant', 'direct', 'harvest']);
  });

  it('scores density against bed area', () => {
    expect(planDensityScore([tomato], 4)).toBeGreaterThan(0);
    expect(planDensityScore([], 4)).toBe(0);
  });
});
