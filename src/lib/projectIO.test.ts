import { describe, expect, it } from 'vitest';
import { importText, makeShareUrl, routeFile, stateJSONFromHash } from './projectIO';
import { makeStateJSON } from './exporters';
import { defaultState, parseStateEnvelope } from './stateSchema';

describe('project input/output helpers', () => {
  it('routes common garden files without user configuration', () => {
    expect(routeFile('harvest.csv', 'text/csv')).toBe('garden-text');
    expect(routeFile('soil-report.txt', 'text/plain')).toBe('garden-text');
    expect(routeFile('project.json', 'application/json')).toBe('state-json');
    expect(routeFile('leaf.jpg', 'image/jpeg')).toBe('image');
    expect(routeFile('archive.zip', 'application/zip')).toBe('unsupported');
  });

  it('imports pasted garden text as a draft', () => {
    const outcome = importText(
      'seed.txt',
      'Tomato Red Pride. 78 days from transplant. Sow indoors 4-6 weeks before last frost.',
    );

    expect(outcome.status).toBe('draft');
    if (outcome.status === 'draft') {
      expect(outcome.draft.kind).toBe('seed_packet');
      expect(outcome.draft.fields.some((field) => field.key === 'crop')).toBe(true);
    }
  });

  it('imports project JSON as validated state', () => {
    const outcome = importText(
      'project.json',
      makeStateJSON(defaultState, '2026-05-09T00:00:00.000Z'),
    );

    expect(outcome.status).toBe('state');
    if (outcome.status === 'state') {
      expect(outcome.envelope.state.profile.locationName).toContain('Bucharest');
    }
  });

  it('round-trips a small state through a share URL hash', () => {
    const stateJson = makeStateJSON(defaultState, '2026-05-09T00:00:00.000Z');
    const url = makeShareUrl(stateJson, 'https://baditaflorin.github.io/urban-farm-year/');
    const restored = stateJSONFromHash(new URL(url).hash);

    expect(restored).toBe(stateJson);
    const parsed: unknown = JSON.parse(restored ?? '');
    expect(parseStateEnvelope(parsed).state.selectedCropIds).toContain('tomato');
  });
});
