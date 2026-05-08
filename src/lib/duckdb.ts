import duckdbWasmUrl from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdbWorkerUrl from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import type { HarvestEntry, HarvestSummary } from '../features/garden/types';
import { summarizeHarvests } from './harvest';

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
    await conn.insertJSONFromPath('harvests.json', {
      name: 'harvests',
      create: true,
      shape: 'row-array' as never,
    });
    const table = await conn.query(`
      select cropName, unit, sum(quantity) as quantity, count(*) as entries
      from harvests
      group by cropName, unit
      order by quantity desc
    `);
    await conn.close();
    await db.terminate();
    return table.toArray().map((row: unknown) => normalizeDuckRow(row));
  } catch {
    return summarizeHarvests(entries);
  }
}

function normalizeDuckRow(row: unknown): HarvestSummary {
  const record =
    typeof row === 'object' && row !== null && 'toJSON' in row
      ? (row as { toJSON: () => Record<string, unknown> }).toJSON()
      : (row as Record<string, unknown>);

  return {
    cropName: stringValue(record.cropName ?? record.cropname, 'Unknown'),
    unit: stringValue(record.unit, ''),
    quantity: Number(record.quantity ?? 0),
    entries: Number(record.entries ?? 0),
  };
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}
