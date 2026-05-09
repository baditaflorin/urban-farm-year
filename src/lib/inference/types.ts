export type SmartInputKind =
  | 'seed_packet'
  | 'planting_guide'
  | 'soil_report'
  | 'harvest_log'
  | 'location_record'
  | 'plant_image_manifest'
  | 'gardener_intent'
  | 'unknown';

export type ConfidenceBand = 'high' | 'review' | 'low';

export type InferredValue = string | number | boolean;

export type InferredField = {
  id: string;
  key: string;
  label: string;
  value: InferredValue;
  raw: string;
  confidence: number;
  reasons: string[];
};

export type DraftAnomaly = {
  code: string;
  severity: 'info' | 'warning' | 'blocker';
  message: string;
  suggestion: string;
};

export type SuggestedAction = {
  id: string;
  label: string;
  detail: string;
  confidence: number;
};

export type DraftProvenance = {
  schemaVersion: 'phase2-draft-v1';
  sourceHash: string;
  sourceLength: number;
  appVersion: string;
  parameters: {
    normalization: string;
    detector: string;
  };
};

export type SmartDraft = {
  id: string;
  kind: SmartInputKind;
  title: string;
  normalizedText: string;
  confidence: number;
  confidenceBand: ConfidenceBand;
  fields: InferredField[];
  anomalies: DraftAnomaly[];
  suggestedActions: SuggestedAction[];
  provenance: DraftProvenance;
};

export type ParseIssue = {
  what: string;
  why: string;
  nowWhat: string;
};

export type NormalizedInput = {
  raw: string;
  text: string;
  issues: DraftAnomaly[];
};
