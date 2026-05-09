import { z } from 'zod';
import type { SmartDraft } from '../../lib/inference/types';

export const cropSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: z.string(),
  crop_type: z.string(),
  frost_hardiness: z.string(),
  season: z.string(),
  days_to_maturity: z.number(),
  indoor_start_weeks_before_last_frost: z.number(),
  direct_sow_weeks_before_last_frost: z.number(),
  transplant_weeks_after_last_frost: z.number(),
  harvest_start_days_after_plant: z.number(),
  harvest_window_days: z.number(),
  spacing_cm: z.number(),
  water_mm_per_week: z.number(),
  sun_hours_min: z.number(),
  ph_min: z.number(),
  ph_max: z.number(),
  feed_level: z.string(),
  companions: z.array(z.string()),
  avoid_after_family: z.string(),
  notes: z.string(),
});

export const cropCatalogSchema = z.object({
  schema_version: z.string(),
  crops: z.array(cropSchema),
});

export const locationSchema = z.object({
  geoname_id: z.string(),
  name: z.string(),
  admin1: z.string(),
  country_code: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  population: z.number(),
  timezone: z.string(),
  default_last_frost: z.string(),
  default_first_frost: z.string(),
});

export const locationCatalogSchema = z.object({
  schema_version: z.string(),
  locations: z.array(locationSchema),
});

export const dataMetaSchema = z.object({
  schema_version: z.string(),
  generated_at: z.string(),
  source_commit: z.string(),
  input_checksums: z.record(z.string(), z.string()),
  artifacts: z.array(z.string()),
});

export type Crop = z.infer<typeof cropSchema>;
export type CropCatalog = z.infer<typeof cropCatalogSchema>;
export type GardenLocation = z.infer<typeof locationSchema>;
export type LocationCatalog = z.infer<typeof locationCatalogSchema>;
export type DataMeta = z.infer<typeof dataMetaSchema>;

export type GardenProfile = {
  locationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  lastFrost: string;
  firstFrost: string;
  bedAreaM2: number;
  containers: number;
  sunlightHours: number;
  waterBudgetLiters: number;
};

export type PlanTaskType = 'indoors' | 'direct' | 'transplant' | 'care' | 'harvest';

export type PlanTask = {
  id: string;
  cropId: string;
  cropName: string;
  type: PlanTaskType;
  title: string;
  date: string;
  windowStart: string;
  windowEnd: string;
  note: string;
};

export type CareLogEntry = {
  id: string;
  date: string;
  cropId: string;
  cropName: string;
  action: string;
  note: string;
  completed: boolean;
};

export type HarvestEntry = {
  id: string;
  date: string;
  cropId: string;
  cropName: string;
  quantity: number;
  unit: 'g' | 'kg' | 'oz' | 'lb' | 'bunch' | 'piece';
  note: string;
};

export type SoilTest = {
  id: string;
  date: string;
  ph: number;
  nitrogen: 'low' | 'ok' | 'high';
  phosphorus: 'low' | 'ok' | 'high';
  potassium: 'low' | 'ok' | 'high';
  organicMatterPct: number;
  texture: 'sandy' | 'loam' | 'clay' | 'potting-mix';
  note: string;
};

export type UserState = {
  profile: GardenProfile;
  selectedCropIds: string[];
  careLogs: CareLogEntry[];
  harvests: HarvestEntry[];
  soilTests: SoilTest[];
  llmEndpoint: string;
  smartDrafts: SmartDraft[];
  activityLog: ActivityLogEntry[];
  correctionMemory: Record<string, string>;
};

export type WeatherDay = {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationMM: number;
  windKPH: number;
  evapotranspirationMM: number;
};

export type HarvestSummary = {
  cropName: string;
  quantity: number;
  unit: string;
  entries: number;
};

export type ActivityLogEntry = {
  id: string;
  draftId?: string;
  date: string;
  action: string;
  detail: string;
};
