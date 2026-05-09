import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { z } from 'zod';
import { inferGardenInput, stableStringify, type SmartDraft } from './index';

const expectedFixtureSchema = z.object({
  kind: z.enum([
    'seed_packet',
    'planting_guide',
    'soil_report',
    'harvest_log',
    'location_record',
    'plant_image_manifest',
    'gardener_intent',
    'unknown',
  ]),
  minConfidence: z.number(),
  fields: z.array(
    z.object({ key: z.string(), value: z.union([z.string(), z.number(), z.boolean()]) }),
  ),
  anomalies: z.array(z.string()).optional(),
});

const fixtureDir = 'test/fixtures/realdata';
const inputFiles = readdirSync(fixtureDir)
  .filter((file) => !file.endsWith('.expected.json'))
  .sort();

describe('real-data inference fixtures', () => {
  for (const file of inputFiles) {
    it(`infers ${file}`, () => {
      const input = readFileSync(join(fixtureDir, file), 'utf8');
      const expectedJSON: unknown = JSON.parse(
        readFileSync(
          join(fixtureDir, `${basename(file).replace(/\.[^.]+$/, '')}.expected.json`),
          'utf8',
        ),
      );
      const expected = expectedFixtureSchema.parse(expectedJSON);

      const started = performance.now();
      const draft = inferGardenInput(input);
      const duration = performance.now() - started;
      const repeated = inferGardenInput(input);

      expect(stableStringify(repeated)).toBe(stableStringify(draft));
      expect(draft.kind).toBe(expected.kind);
      expect(draft.confidence).toBeGreaterThanOrEqual(expected.minConfidence);
      expect(duration).toBeLessThan(1000);

      for (const field of expected.fields) {
        expect(
          hasField(draft, field.key, field.value),
          `${file} missing ${field.key}:${field.value}`,
        ).toBe(true);
      }
      for (const anomaly of expected.anomalies ?? []) {
        expect(
          draft.anomalies.some((item) => item.code === anomaly),
          `${file} missing anomaly ${anomaly}`,
        ).toBe(true);
      }
      for (const field of draft.fields) {
        expect(field.confidence).toBeGreaterThan(0);
        expect(field.reasons.length).toBeGreaterThan(0);
      }
    });
  }

  it('handles synthetic parser edge cases without crashing', () => {
    const huge = `${'tomato, 1/2 in, 70 days\n'.repeat(5000)}soil pH 6,4`;
    const cases = [
      '',
      '\uFEFFtomato\r\nsoil pH 5,8',
      'crop,"tomato\nunterminated',
      '???? \u202E tomato \u00A0 70 days',
      huge,
    ];
    for (const input of cases) {
      expect(() => inferGardenInput(input)).not.toThrow();
    }
  });
});

function hasField(draft: SmartDraft, key: string, value: string | number | boolean): boolean {
  return draft.fields.some((field) => {
    if (field.key !== key) return false;
    if (typeof value === 'number') {
      return typeof field.value === 'number' && Math.abs(field.value - value) < 0.001;
    }
    return String(field.value).toLowerCase() === String(value).toLowerCase();
  });
}
