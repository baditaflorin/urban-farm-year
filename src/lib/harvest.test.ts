import { describe, expect, it } from 'vitest';
import type { HarvestEntry } from '../features/garden/types';
import { bestHarvestCrop, summarizeHarvests } from './harvest';

const entries: HarvestEntry[] = [
  {
    id: '1',
    date: '2026-05-08',
    cropId: 'tomato',
    cropName: 'Tomato',
    quantity: 2,
    unit: 'kg',
    note: '',
  },
  {
    id: '2',
    date: '2026-05-09',
    cropId: 'tomato',
    cropName: 'Tomato',
    quantity: 1,
    unit: 'kg',
    note: '',
  },
];

describe('harvest summaries', () => {
  it('groups harvests by crop and unit', () => {
    expect(summarizeHarvests(entries)[0]).toMatchObject({
      cropName: 'Tomato',
      quantity: 3,
      entries: 2,
    });
    expect(bestHarvestCrop(entries)).toBe('Tomato');
  });
});
