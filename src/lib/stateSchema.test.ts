import { describe, expect, it } from 'vitest';
import { createStateEnvelope, defaultState, parseStateEnvelope } from './stateSchema';

describe('state schema and migrations', () => {
  it('migrates legacy raw user state into the current envelope', () => {
    const legacy = {
      ...defaultState,
      settings: undefined,
      lastSmartInput: undefined,
      harvests: [],
    };

    const envelope = parseStateEnvelope(legacy);

    expect(envelope.schema_version).toBe('urban-farm-year.state.v3');
    expect(envelope.state.settings.weatherEnabled).toBe(true);
    expect(envelope.state.lastSmartInput).toBe('');
  });

  it('rejects unknown future state envelopes instead of guessing', () => {
    expect(() =>
      parseStateEnvelope({
        schema_version: 'urban-farm-year.state.v999',
        state: defaultState,
      }),
    ).toThrow(/unsupported schema version/i);
  });

  it('normalizes a current envelope without dropping settings', () => {
    const envelope = createStateEnvelope({
      ...defaultState,
      settings: { ...defaultState.settings, weatherEnabled: false, primaryExportFormat: 'csv' },
    });

    expect(parseStateEnvelope(envelope).state.settings).toMatchObject({
      weatherEnabled: false,
      primaryExportFormat: 'csv',
    });
  });
});
