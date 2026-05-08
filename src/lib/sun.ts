import SunCalc from 'suncalc';
import type { GardenProfile } from '../features/garden/types';

export function daylightHours(profile: GardenProfile, date = new Date()): number {
  const times = SunCalc.getTimes(date, profile.latitude, profile.longitude);
  const diff = times.sunset.getTime() - times.sunrise.getTime();
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
