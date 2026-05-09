import { describe, expect, it } from 'vitest';
import { makeHarvestCSV, makeSeasonMarkdown, makeStateJSON } from './exporters';
import { defaultState, parseStateEnvelope } from './stateSchema';

describe('project exporters', () => {
  it('exports and imports the full state envelope', () => {
    const state = {
      ...defaultState,
      harvests: [
        {
          id: 'harvest-1',
          date: '2026-07-01',
          cropId: 'tomato',
          cropName: 'Tomato',
          quantity: 2.5,
          unit: 'kg' as const,
          note: 'first picking',
        },
      ],
    };

    const exported = makeStateJSON(state, '2026-05-09T00:00:00.000Z');
    const parsed: unknown = JSON.parse(exported);
    const envelope = parseStateEnvelope(parsed);

    expect(envelope.schema_version).toBe('urban-farm-year.state.v3');
    expect(envelope.state.harvests[0]).toMatchObject({ cropName: 'Tomato', unit: 'kg' });
  });

  it('escapes harvest CSV for spreadsheet import', () => {
    const csv = makeHarvestCSV({
      ...defaultState,
      harvests: [
        {
          id: 'h1',
          date: '2026-07-01',
          cropId: 'tomato',
          cropName: 'Tomato, cherry',
          quantity: 12,
          unit: 'piece',
          note: 'sweet "snack"',
        },
      ],
    });

    expect(csv).toContain('"Tomato, cherry"');
    expect(csv).toContain('"sweet ""snack"""');
  });

  it('creates markdown with provenance and project content', () => {
    const markdown = makeSeasonMarkdown({
      selectedCrops: [],
      state: defaultState,
      advice: ['Rotate tomatoes away from peppers.'],
      planTasks: [],
    });

    expect(markdown).toContain('Version:');
    expect(markdown).toContain('Rotate tomatoes away from peppers.');
    expect(markdown).toContain('No planting tasks generated yet.');
  });
});
