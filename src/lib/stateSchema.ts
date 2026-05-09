import { z } from 'zod';
import type {
  ActivityLogEntry,
  CareLogEntry,
  GardenProfile,
  HarvestEntry,
  SoilTest,
  UserSettings,
  UserState,
} from '../features/garden/types';
import { exportFormats, harvestUnits, nutrientLevels, soilTextures } from './domainOptions';
import type { SmartDraft } from './inference/types';
import { appVersion, gitCommit } from './version';

export const stateSchemaVersion = 'urban-farm-year.state.v3';

export const defaultSettings: UserSettings = {
  weatherEnabled: true,
  defaultHarvestUnit: 'g',
  primaryExportFormat: 'json',
  rememberSmartInput: true,
};

export const defaultState: UserState = {
  profile: {
    locationName: 'Bucharest, Bucuresti, RO',
    latitude: 44.43225,
    longitude: 26.10626,
    timezone: 'Europe/Bucharest',
    lastFrost: '04-10',
    firstFrost: '10-30',
    bedAreaM2: 8,
    containers: 6,
    sunlightHours: 6,
    waterBudgetLiters: 45,
  },
  selectedCropIds: ['tomato', 'lettuce', 'basil', 'carrot', 'pepper', 'radish'],
  careLogs: [],
  harvests: [],
  soilTests: [],
  llmEndpoint: '',
  smartDrafts: [],
  activityLog: [],
  correctionMemory: {},
  settings: defaultSettings,
  lastSmartInput: '',
};

const inferredValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const smartDraftSchema = z.object({
  id: z.string(),
  kind: z.enum([
    'seed_packet',
    'planting_guide',
    'soil_report',
    'harvest_log',
    'location_record',
    'plant_image_manifest',
    'gardener_intent',
    'unknown',
  ]),
  title: z.string(),
  normalizedText: z.string(),
  confidence: z.number(),
  confidenceBand: z.enum(['high', 'review', 'low']),
  fields: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      label: z.string(),
      value: inferredValueSchema,
      raw: z.string(),
      confidence: z.number(),
      reasons: z.array(z.string()),
    }),
  ),
  anomalies: z.array(
    z.object({
      code: z.string(),
      severity: z.enum(['info', 'warning', 'blocker']),
      message: z.string(),
      suggestion: z.string(),
    }),
  ),
  suggestedActions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      detail: z.string(),
      confidence: z.number(),
    }),
  ),
  provenance: z.object({
    schemaVersion: z.literal('phase2-draft-v1'),
    sourceHash: z.string(),
    sourceLength: z.number(),
    appVersion: z.string(),
    parameters: z.object({
      normalization: z.string(),
      detector: z.string(),
    }),
  }),
}) satisfies z.ZodType<SmartDraft>;

const profileSchema = z.object({
  locationName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  lastFrost: z.string(),
  firstFrost: z.string(),
  bedAreaM2: z.number(),
  containers: z.number(),
  sunlightHours: z.number(),
  waterBudgetLiters: z.number(),
}) satisfies z.ZodType<GardenProfile>;

const careLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  cropId: z.string(),
  cropName: z.string(),
  action: z.string(),
  note: z.string(),
  completed: z.boolean(),
}) satisfies z.ZodType<CareLogEntry>;

const harvestSchema = z.object({
  id: z.string(),
  date: z.string(),
  cropId: z.string(),
  cropName: z.string(),
  quantity: z.number(),
  unit: z.enum(harvestUnits),
  note: z.string(),
}) satisfies z.ZodType<HarvestEntry>;

const soilTestSchema = z.object({
  id: z.string(),
  date: z.string(),
  ph: z.number(),
  nitrogen: z.enum(nutrientLevels),
  phosphorus: z.enum(nutrientLevels),
  potassium: z.enum(nutrientLevels),
  organicMatterPct: z.number(),
  texture: z.enum(soilTextures),
  note: z.string(),
}) satisfies z.ZodType<SoilTest>;

const activityLogSchema = z.object({
  id: z.string(),
  draftId: z.string().optional(),
  date: z.string(),
  action: z.string(),
  detail: z.string(),
}) satisfies z.ZodType<ActivityLogEntry>;

const settingsSchema = z.object({
  weatherEnabled: z.boolean().default(defaultSettings.weatherEnabled),
  defaultHarvestUnit: z.enum(harvestUnits).default(defaultSettings.defaultHarvestUnit),
  primaryExportFormat: z.enum(exportFormats).default(defaultSettings.primaryExportFormat),
  rememberSmartInput: z.boolean().default(defaultSettings.rememberSmartInput),
}) satisfies z.ZodType<UserSettings>;

export const userStateSchema = z.object({
  profile: profileSchema.default(defaultState.profile),
  selectedCropIds: z.array(z.string()).default(defaultState.selectedCropIds),
  careLogs: z.array(careLogSchema).default([]),
  harvests: z.array(harvestSchema).default([]),
  soilTests: z.array(soilTestSchema).default([]),
  llmEndpoint: z.string().default(''),
  smartDrafts: z.array(smartDraftSchema).default([]),
  activityLog: z.array(activityLogSchema).default([]),
  correctionMemory: z.record(z.string(), z.string()).default({}),
  settings: settingsSchema.default(defaultSettings),
  lastSmartInput: z.string().default(''),
}) satisfies z.ZodType<UserState>;

export const stateEnvelopeSchema = z.object({
  schema_version: z.literal(stateSchemaVersion),
  exported_at: z.string(),
  app_version: z.string(),
  git_commit: z.string(),
  state: userStateSchema,
});

export type StateEnvelope = z.infer<typeof stateEnvelopeSchema>;

export function createStateEnvelope(
  state: UserState,
  exportedAt = new Date().toISOString(),
): StateEnvelope {
  return {
    schema_version: stateSchemaVersion,
    exported_at: exportedAt,
    app_version: appVersion,
    git_commit: gitCommit,
    state: normalizeUserState(state),
  };
}

export function parseStateEnvelope(value: unknown): StateEnvelope {
  const envelope = stateEnvelopeSchema.safeParse(value);
  if (envelope.success) {
    return envelope.data;
  }

  return createStateEnvelope(parseLegacyState(value), new Date(0).toISOString());
}

export function normalizeUserState(value: unknown): UserState {
  return userStateSchema.parse({ ...defaultState, ...(isRecord(value) ? value : {}) });
}

function parseLegacyState(value: unknown): UserState {
  if (!isRecord(value)) {
    throw new Error('The file is not a recognized Urban Farm Year project file.');
  }
  if ('state' in value) {
    throw new Error('The project file has an unsupported schema version.');
  }
  return normalizeUserState(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
