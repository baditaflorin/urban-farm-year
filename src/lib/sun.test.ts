import { describe, expect, it } from 'vitest';
import { daylightHours, sunlightFit } from './sun';
import type { GardenProfile } from '../features/garden/types';

const profile = (latitude: number, longitude: number): GardenProfile => ({
  locationName: 'Test plot',
  latitude,
  longitude,
  timezone: 'UTC',
  lastFrost: '2026-04-15',
  firstFrost: '2026-10-30',
  bedAreaM2: 4,
  containers: 0,
  sunlightHours: 6,
  waterBudgetLiters: 100,
});

describe('daylightHours', () => {
  it('returns a positive value for a mid-latitude summer day', () => {
    const hours = daylightHours(profile(44.4268, 26.1025), new Date('2026-06-21T12:00:00Z'));
    expect(hours).toBeGreaterThan(13);
    expect(hours).toBeLessThan(17);
  });

  it('returns 24 during polar day above the Arctic Circle', () => {
    // Tromsø latitude in June.
    const hours = daylightHours(profile(69.6492, 18.9553), new Date('2026-06-21T12:00:00Z'));
    expect(hours).toBe(24);
  });

  it('returns 0 during polar night above the Arctic Circle', () => {
    // Tromsø latitude in December.
    const hours = daylightHours(profile(69.6492, 18.9553), new Date('2026-12-21T12:00:00Z'));
    expect(hours).toBe(0);
  });

  it('never returns NaN even when SunCalc would', () => {
    // Above the latitude where SunCalc cannot resolve sunrise/sunset, the
    // old implementation returned NaN, which then propagated into UI string
    // joins. The fallback must always return a finite number.
    const hours = daylightHours(profile(85, 0), new Date('2026-03-15T00:00:00Z'));
    expect(Number.isFinite(hours)).toBe(true);
  });
});

describe('sunlightFit', () => {
  it('classifies fits based on profile sunlight budget', () => {
    expect(sunlightFit(5, profile(44, 26))).toBe('good');
    expect(sunlightFit(7, profile(44, 26))).toBe('tight');
    expect(sunlightFit(9, profile(44, 26))).toBe('poor');
  });
});
