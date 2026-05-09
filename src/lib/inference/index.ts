import { appVersion } from '../version';
import { detectInputKind } from './detect';
import { extractFields } from './extract';
import { normalizeGardenInput } from './normalize';
import { stableHash, stableId } from './stable';
import type { ConfidenceBand, DraftAnomaly, SmartDraft } from './types';

const cache = new Map<string, SmartDraft>();

export function inferGardenInput(raw: string): SmartDraft {
  const normalized = normalizeGardenInput(raw);
  const sourceHash = stableHash(normalized.text);
  const cached = cache.get(sourceHash);
  if (cached) {
    return cached;
  }

  const detection = detectInputKind(normalized.text);
  const extracted = extractFields(detection.kind, normalized.text);
  const anomalies: DraftAnomaly[] = [...normalized.issues, ...extracted.anomalies];
  const fieldConfidence =
    extracted.fields.length > 0
      ? extracted.fields.reduce((sum, field) => sum + field.confidence, 0) / extracted.fields.length
      : 0.1;
  const blockerPenalty = anomalies.some((anomaly) => anomaly.severity === 'blocker') ? 0.35 : 0;
  const confidence = roundConfidence(
    Math.max(0, (fieldConfidence + detection.score) / 2 - blockerPenalty),
  );

  const draft: SmartDraft = {
    id: stableId('draft', detection.kind, sourceHash),
    kind: detection.kind,
    title: titleForKind(detection.kind),
    normalizedText: normalized.text,
    confidence,
    confidenceBand: confidenceBand(confidence),
    fields: extracted.fields,
    anomalies,
    suggestedActions: [
      ...extracted.suggestedActions,
      ...detection.reasons.map((reason) => ({
        id: stableId('reason', reason),
        label: 'Why this shape',
        detail: reason,
        confidence: detection.score,
      })),
    ],
    provenance: {
      schemaVersion: 'phase2-draft-v1',
      sourceHash,
      sourceLength: normalized.text.length,
      appVersion,
      parameters: {
        normalization: 'phase2-normalize-v1',
        detector: 'phase2-rule-detector-v1',
      },
    },
  };

  cache.set(sourceHash, draft);
  return draft;
}

export async function inferGardenInputAsync(
  raw: string,
  signal?: AbortSignal,
): Promise<SmartDraft> {
  if (signal?.aborted) {
    throw new DOMException('The garden input parse was cancelled before it started.', 'AbortError');
  }
  await Promise.resolve();
  if (signal?.aborted) {
    throw new DOMException('The garden input parse was cancelled.', 'AbortError');
  }
  return inferGardenInput(raw);
}

function confidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.45) return 'review';
  return 'low';
}

function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100;
}

function titleForKind(kind: SmartDraft['kind']): string {
  const labels: Record<SmartDraft['kind'], string> = {
    seed_packet: 'Seed packet draft',
    planting_guide: 'Planting guide draft',
    soil_report: 'Soil report draft',
    harvest_log: 'Harvest log draft',
    location_record: 'Location record draft',
    plant_image_manifest: 'Plant image manifest',
    gardener_intent: 'Planting lifecycle draft',
    unknown: 'Garden input draft',
  };
  return labels[kind];
}

export * from './stable';
export type * from './types';
