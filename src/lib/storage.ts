import { openDB, type DBSchema } from 'idb';
import type { UserState } from '../features/garden/types';

const dbName = 'urban-farm-year';
const storeName = 'kv';
const stateKey = 'user-state-v1';

type UrbanFarmDB = DBSchema & {
  kv: {
    key: string;
    value: unknown;
  };
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
};

async function db() {
  return openDB<UrbanFarmDB>(dbName, 1, {
    upgrade(database) {
      database.createObjectStore(storeName);
    },
  });
}

export async function loadUserState(): Promise<UserState> {
  const database = await db();
  const stored = await database.get(storeName, stateKey);
  if (!stored) {
    return defaultState;
  }
  return { ...defaultState, ...(stored as Partial<UserState>) };
}

export async function saveUserState(state: UserState): Promise<void> {
  const database = await db();
  await database.put(storeName, state, stateKey);
}

export async function resetUserState(): Promise<UserState> {
  const database = await db();
  await database.delete(storeName, stateKey);
  return defaultState;
}
