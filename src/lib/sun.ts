import SunCalc from 'suncalc';
import type { GardenProfile } from '../features/garden/types';

export function daylightHours(profile: GardenProfile, date = new Date()): number {
  const times = SunCalc.getTimes(date, profile.latitude, profile.longitude);
  const sunriseMs = times.sunrise?.getTime();
  const sunsetMs = times.sunset?.getTime();
  // Above the Arctic/Antarctic Circle, SunCalc returns invalid dates for
  // polar night (sun never rises) and polar day (sun never sets), so
  // getTime() yields NaN. Disambiguate by sampling solar altitude at solar
  // noon — positive altitude means 24h of daylight, negative means 0h.
  if (!Number.isFinite(sunriseMs) || !Number.isFinite(sunsetMs)) {
    const solarNoon = times.solarNoon ?? date;
    const altitude = SunCalc.getPosition(solarNoon, profile.latitude, profile.longitude).altitude;
    return altitude > 0 ? 24 : 0;
  }
  const diff = sunsetMs - sunriseMs;
  return Math.max(0, Math.round((diff / 3_600_000) * 10) / 10);
}

export function sunlightFit(
  requiredHours: number,
  profile: GardenProfile,
): 'good' | 'tight' | 'poor' {
  if (profile.sunlightHours >= requiredHours) {
    return 'good';
  }
  if (profile.sunlightHours + 1 >= requiredHours) {
    return 'tight';
  }
  return 'poor';
}
