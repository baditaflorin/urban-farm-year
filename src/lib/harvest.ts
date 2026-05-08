import type { HarvestEntry, HarvestSummary } from '../features/garden/types';

export function summarizeHarvests(entries: HarvestEntry[]): HarvestSummary[] {
  const totals = new Map<string, HarvestSummary>();
  for (const entry of entries) {
    const key = `${entry.cropName}:${entry.unit}`;
    const current = totals.get(key) ?? {
      cropName: entry.cropName,
      unit: entry.unit,
      quantity: 0,
      entries: 0,
    };
    current.quantity += entry.quantity;
    current.entries += 1;
    totals.set(key, current);
  }
  return [...totals.values()].sort((a, b) => b.quantity - a.quantity);
}

export function bestHarvestCrop(entries: HarvestEntry[]): string {
  return summarizeHarvests(entries)[0]?.cropName ?? 'No harvests yet';
}
