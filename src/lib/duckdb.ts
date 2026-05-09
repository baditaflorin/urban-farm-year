import duckdbWasmUrl from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdbWorkerUrl from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import type { HarvestEntry, HarvestSummary } from '../features/garden/types';

export async function analyzeHarvestWithDuckDB(entries: HarvestEntry[]): Promise<HarvestSummary[]> {
  if (entries.length === 0) {
    return [];
  }

  try {
    const duckdb = await import('@duckdb/duckdb-wasm');
    const worker = new Worker(duckdbWorkerUrl);
    const logger = new duckdb.VoidLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(duckdbWasmUrl);
    await db.registerFileText('harvests.json', JSON.stringify(entries));
    const conn = await db.connect();
    const insertOptions: Parameters<typeof conn.insertJSONFromPath>[1] = {
      name: 'harvests',
      create: true,
      shape: 'row-array' as Parameters<typeof conn.insertJSONFromPath>[1]['shape'],
    };
    await conn.insertJSONFromPath('harvests.json', insertOptions);
    const table = await conn.query(`
      select cropName, unit, sum(quantity) as quantity, count(*) as entries
      from harvests
      group by cropName, unit
      order by quantity desc
    `);
    await conn.close();
    await db.terminate();
    return table.toArray().map((row: unknown) => normalizeDuckRow(row));
  } catch (error) {
    throw new Error('DuckDB-WASM could not analyze harvests.', { cause: error });
  }
}

function normalizeDuckRow(row: unknown): HarvestSummary {
  const record = rowToRecord(row);

  return {
    cropName: stringValue(record.cropName ?? record.cropname, 'Unknown'),
    unit: stringValue(record.unit, ''),
    quantity: Number(record.quantity ?? 0),
    entries: Number(record.entries ?? 0),
  };
}

function rowToRecord(row: unknown): Record<string, unknown> {
  if (hasToJSON(row)) {
    return row.toJSON();
  }
  return isRecord(row) ? row : {};
}

function hasToJSON(value: unknown): value is { toJSON: () => Record<string, unknown> } {
  return isRecord(value) && typeof value.toJSON === 'function';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}
