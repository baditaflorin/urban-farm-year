import type { Crop, HarvestEntry, SoilTest, UserState } from '../../features/garden/types';
import { todayISO } from '../date';
import type { InferredField, SmartDraft } from './types';

const cropMap: Record<string, string> = {
  bean: 'beans-bush',
  beans: 'beans-bush',
  tomato: 'tomato',
  lettuce: 'lettuce',
  carrot: 'carrot',
  beet: 'beet',
  basil: 'basil',
  pepper: 'pepper',
};

export function applySmartDraft(draft: SmartDraft, state: UserState, crops: Crop[]): UserState {
  if (
    state.activityLog.some(
      (entry) => entry.draftId === draft.id && entry.action === 'apply-smart-draft',
    )
  ) {
    return state;
  }

  const selectedCropIds = new Set(state.selectedCropIds);
  for (const cropName of values(draft, 'crop')) {
    const cropId =
      cropMap[String(cropName).toLowerCase()] ?? cropByName(crops, String(cropName))?.id;
    if (cropId) {
      selectedCropIds.add(cropId);
    }
  }

  const profile = applyLocation(draft, state.profile);
  const soilTest = soilFromDraft(draft);
  const harvest = harvestFromDraft(draft, crops);

  return {
    ...state,
    profile,
    selectedCropIds: [...selectedCropIds],
    soilTests: soilTest ? [soilTest, ...state.soilTests] : state.soilTests,
    harvests: harvest ? [harvest, ...state.harvests] : state.harvests,
    smartDrafts: [draft, ...state.smartDrafts.filter((item) => item.id !== draft.id)].slice(0, 8),
    activityLog: [
      {
        id: `${draft.id}-apply`,
        draftId: draft.id,
        date: todayISO(),
        action: 'apply-smart-draft',
        detail: `Applied ${draft.title} with ${Math.round(draft.confidence * 100)}% confidence.`,
      },
      ...state.activityLog,
    ].slice(0, 30),
  };
}

export function rememberFieldCorrection(
  draft: SmartDraft,
  field: InferredField,
  state: UserState,
): UserState {
  return {
    ...state,
    correctionMemory: {
      ...state.correctionMemory,
      [`${draft.kind}:${field.key}`]: String(field.value),
    },
    activityLog: [
      {
        id: `${draft.id}-${field.id}-remember`,
        draftId: draft.id,
        date: todayISO(),
        action: 'remember-correction',
        detail: `Remembered ${field.label}: ${String(field.value)} for similar ${draft.title.toLowerCase()} inputs.`,
      },
      ...state.activityLog,
    ].slice(0, 30),
  };
}

function applyLocation(draft: SmartDraft, profile: UserState['profile']): UserState['profile'] {
  const latitude = numberField(draft, 'latitude');
  const longitude = numberField(draft, 'longitude');
  const timezone = stringField(draft, 'timezone');
  const locationName = stringField(draft, 'location_name');

  if (latitude === undefined || longitude === undefined) {
    return profile;
  }

  return {
    ...profile,
    latitude,
    longitude,
    timezone: timezone ?? profile.timezone,
    locationName: locationName ? `${locationName}` : profile.locationName,
  };
}

function soilFromDraft(draft: SmartDraft): SoilTest | null {
  const ph = numberField(draft, 'ph');
  if (ph === undefined) {
    return null;
  }
  const phosphorus = numberField(draft, 'phosphorus_ppm');
  const potassium = numberField(draft, 'potassium_ppm');
  return {
    id: `${draft.id}-soil`,
    date: todayISO(),
    ph,
    nitrogen: 'ok',
    phosphorus: phosphorus === undefined ? 'ok' : phosphorus < 20 ? 'low' : 'ok',
    potassium: potassium === undefined ? 'ok' : potassium < 120 ? 'low' : 'ok',
    organicMatterPct: numberField(draft, 'organic_matter_pct') ?? 4,
    texture: 'loam',
    note: `Imported from ${draft.title}. Review lab-specific thresholds before amending.`,
  };
}

function harvestFromDraft(draft: SmartDraft, crops: Crop[]): HarvestEntry | null {
  const quantity = numberField(draft, 'quantity');
  const unit = stringField(draft, 'unit');
  const cropName = stringField(draft, 'crop');
  if (quantity === undefined || !unit || !cropName) {
    return null;
  }
  const crop = cropByName(crops, cropName);
  return {
    id: `${draft.id}-harvest`,
    date: todayISO(),
    cropId: crop?.id ?? cropName,
    cropName: crop?.name ?? cropName,
    quantity,
    unit: unit as HarvestEntry['unit'],
    note: `Imported from ${draft.title}.`,
  };
}

function numberField(draft: SmartDraft, key: string): number | undefined {
  const value = draft.fields.find((field) => field.key === key)?.value;
  return typeof value === 'number' ? value : undefined;
}

function stringField(draft: SmartDraft, key: string): string | undefined {
  const value = draft.fields.find((field) => field.key === key)?.value;
  return typeof value === 'string' ? value : undefined;
}

function values(draft: SmartDraft, key: string) {
  return draft.fields.filter((field) => field.key === key).map((field) => field.value);
}

function cropByName(crops: Crop[], value: string): Crop | undefined {
  const normalized = value.toLowerCase();
  return crops.find((crop) => crop.id === normalized || crop.name.toLowerCase() === normalized);
}
