import { z } from 'zod';
import type { GardenProfile, WeatherDay } from '../features/garden/types';

const forecastSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    wind_speed_10m_max: z.array(z.number()),
    et0_fao_evapotranspiration: z.array(z.number()).optional(),
  }),
});

export async function fetchWeather(profile: GardenProfile): Promise<WeatherDay[]> {
  const params = new URLSearchParams({
    latitude: String(profile.latitude),
    longitude: String(profile.longitude),
    daily:
      'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,et0_fao_evapotranspiration',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    forecast_days: '7',
    timezone: 'auto',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }
  const data = forecastSchema.parse(await response.json());
  return data.daily.time.map((date, index) => ({
    date,
    temperatureMax: data.daily.temperature_2m_max[index] ?? 0,
    temperatureMin: data.daily.temperature_2m_min[index] ?? 0,
    precipitationMM: data.daily.precipitation_sum[index] ?? 0,
    windKPH: data.daily.wind_speed_10m_max[index] ?? 0,
    evapotranspirationMM: data.daily.et0_fao_evapotranspiration?.[index] ?? 0,
  }));
}

export function weatherAdvice(days: WeatherDay[]): string[] {
  const advice: string[] = [];
  const today = days[0];
  if (!today) {
    return ['Weather unavailable. Use the last successful plan and check containers by hand.'];
  }
  if (today.temperatureMin <= 2) {
    advice.push('Cover tender seedlings tonight.');
  }
  if (today.temperatureMax >= 31) {
    advice.push('Water early and shade lettuce or spinach.');
  }
  if (today.precipitationMM < 2 && today.evapotranspirationMM > 3) {
    advice.push('Irrigate containers before midday.');
  }
  if (today.windKPH > 35) {
    advice.push('Secure trellises and young transplants.');
  }
  return advice.length > 0 ? advice : ['Weather looks workable for routine care.'];
}
