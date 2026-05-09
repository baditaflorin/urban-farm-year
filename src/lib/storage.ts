import { openDB, type DBSchema } from 'idb';
import type { UserState } from '../features/garden/types';
import { createStateEnvelope, defaultState, parseStateEnvelope } from './stateSchema';

const dbName = 'urban-farm-year';
const storeName = 'kv';
const stateKey = 'user-state-v3';
const legacyStateKey = 'user-state-v1';

type UrbanFarmDB = DBSchema & {
  kv: {
    key: string;
    value: unknown;
  };
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
  if (stored) {
    return parseStateEnvelope(stored).state;
  }

  const legacy = await database.get(storeName, legacyStateKey);
  if (!legacy) {
    return defaultState;
  }
  const migrated = parseStateEnvelope(legacy).state;
  await saveUserState(migrated);
  return migrated;
}

export async function saveUserState(state: UserState): Promise<void> {
  const database = await db();
  await database.put(storeName, createStateEnvelope(state), stateKey);
}

export async function resetUserState(): Promise<UserState> {
  const database = await db();
  await database.delete(storeName, stateKey);
  await database.delete(storeName, legacyStateKey);
  return defaultState;
}
