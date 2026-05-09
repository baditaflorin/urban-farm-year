import { CheckCircle2, ClipboardPaste, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Crop, UserState } from '../garden/types';
import { applySmartDraft, rememberFieldCorrection } from '../../lib/inference/applyDraft';
import { inferGardenInputAsync, stableStringify, type SmartDraft } from '../../lib/inference';

type SmartState =
  | 'idle-empty'
  | 'editing'
  | 'classifying'
  | 'inferred-high'
  | 'inferred-review'
  | 'inferred-low'
  | 'unsupported-recoverable'
  | 'error-recoverable'
  | 'cancelled'
  | 'applying'
  | 'applied';

export function SmartInputPanel({
  crops,
  state,
  updateState,
  onDraft,
}: {
  crops: Crop[];
  state: UserState;
  updateState: (recipe: (current: UserState) => UserState) => void;
  onDraft: (draft: SmartDraft | null) => void;
}) {
  const [input, setInput] = useState(() =>
    state.settings.rememberSmartInput ? state.lastSmartInput : '',
  );
  const [draft, setDraft] = useState<SmartDraft | null>(null);
  const [smartState, setSmartState] = useState<SmartState>('idle-empty');
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!input.trim()) {
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      setSmartState('classifying');
      inferGardenInputAsync(input, controller.signal)
        .then((nextDraft) => {
          if (requestRef.current !== requestId) return;
          setDraft(nextDraft);
          onDraft(nextDraft);
          setSmartState(stateForDraft(nextDraft));
        })
        .catch((err: unknown) => {
          if (requestRef.current !== requestId) return;
          if (err instanceof DOMException && err.name === 'AbortError') {
            setSmartState('cancelled');
            return;
          }
          setError(
            err instanceof Error
              ? `Could not read this garden input. ${err.message}. Try pasting a smaller excerpt with crop, soil, harvest, or location values.`
              : 'Could not read this garden input. Try pasting a smaller garden-specific excerpt.',
          );
          setSmartState('error-recoverable');
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [input, onDraft]);

  useEffect(() => {
    if (!state.settings.rememberSmartInput || input === state.lastSmartInput) {
      return;
    }
    const timer = window.setTimeout(() => {
      updateState((current) => ({ ...current, lastSmartInput: input }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [input, state.lastSmartInput, state.settings.rememberSmartInput, updateState]);

  const apply = () => {
    if (!draft) return;
    setSmartState('applying');
    updateState((current) => applySmartDraft(draft, current, crops));
    setSmartState('applied');
  };

  return (
    <section className="panel space-y-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <ClipboardPaste size={20} aria-hidden="true" />
          <h2 className="section-title">Smart Garden Input</h2>
        </div>
        <span className={`state-pill state-${smartState}`}>{stateLabel(smartState)}</span>
      </div>

      <label className="field">
        <span>
          Paste seed packets, planting guide rows, soil reports, harvest logs, GeoNames rows, or
          garden notes
        </span>
        <textarea
          className="min-h-28"
          value={input}
          onChange={(event) => {
            const nextInput = event.target.value;
            setInput(nextInput);
            if (!nextInput.trim()) {
              requestRef.current += 1;
              setSmartState('idle-empty');
              setDraft(null);
              onDraft(null);
            } else {
              setSmartState('editing');
              setError(null);
            }
          }}
          placeholder="Tomato Red Pride. 78 days from transplant. Sow indoors 4-6 weeks before last frost. Space 24 in..."
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          className="button button-primary"
          type="button"
          onClick={apply}
          disabled={!draft || draft.confidenceBand === 'low'}
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          Apply draft
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => {
            requestRef.current += 1;
            setInput('');
            setDraft(null);
            onDraft(null);
            updateState((current) => ({ ...current, lastSmartInput: '' }));
            setSmartState('idle-empty');
          }}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Clear
        </button>
      </div>

      {smartState === 'classifying' ? (
        <div className="care-advice">
          <Loader2 className="animate-spin" size={17} aria-hidden="true" />
          <span>Reading the gardening shape and field values.</span>
        </div>
      ) : null}

      {error ? (
        <div className="care-advice border-clay/20 bg-clay/10">
          <XCircle size={17} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {draft ? (
        <DraftPreview
          draft={draft}
          onRemember={(fieldId) => {
            const field = draft.fields.find((item) => item.id === fieldId);
            if (!field) return;
            updateState((current) => rememberFieldCorrection(draft, field, current));
          }}
          remembered={state.correctionMemory}
        />
      ) : null}

      {new URLSearchParams(window.location.search).get('debug') === '1' && draft ? (
        <details className="debug-box">
          <summary>Debug draft JSON</summary>
          <pre>{stableStringify(draft)}</pre>
        </details>
      ) : null}
    </section>
  );
}

function DraftPreview({
  draft,
  onRemember,
  remembered,
}: {
  draft: SmartDraft;
  onRemember: (fieldId: string) => void;
  remembered: Record<string, string>;
}) {
  return (
    <div className="smart-preview">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <strong>{draft.title}</strong>
          <span>
            {Math.round(draft.confidence * 100)}% confidence · {draft.fields.length} inferred fields
          </span>
        </div>
        <code>{draft.provenance.sourceHash}</code>
      </div>

      <div className="field-grid">
        {draft.fields.map((field) => {
          const rememberedKey = `${draft.kind}:${field.key}`;
          return (
            <article className="inferred-field" key={field.id}>
              <div>
                <strong>{field.label}</strong>
                <span>{String(field.value)}</span>
              </div>
              <small>{Math.round(field.confidence * 100)}%</small>
              <details>
                <summary>Why</summary>
                <ul>
                  {field.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                {remembered[rememberedKey] ? (
                  <p>Remembered preference: {remembered[rememberedKey]}</p>
                ) : null}
                <button
                  className="button button-secondary mt-2"
                  type="button"
                  onClick={() => onRemember(field.id)}
                >
                  Remember
                </button>
              </details>
            </article>
          );
        })}
      </div>

      {draft.anomalies.length > 0 ? (
        <div className="grid gap-2">
          {draft.anomalies.map((anomaly) => (
            <article
              className={`advice ${anomaly.severity === 'blocker' ? 'advice-fix' : 'advice-watch'}`}
              key={anomaly.code}
            >
              <strong>{anomaly.message}</strong>
              <span>{anomaly.suggestion}</span>
            </article>
          ))}
        </div>
      ) : null}

      <div className="grid gap-2">
        {draft.suggestedActions.slice(0, 3).map((action) => (
          <article className="advice advice-good" key={action.id}>
            <strong>{action.label}</strong>
            <span>{action.detail}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function stateForDraft(draft: SmartDraft): SmartState {
  if (draft.anomalies.some((anomaly) => anomaly.severity === 'blocker'))
    return 'unsupported-recoverable';
  if (draft.confidenceBand === 'high') return 'inferred-high';
  if (draft.confidenceBand === 'review') return 'inferred-review';
  return 'inferred-low';
}

function stateLabel(state: SmartState): string {
  const labels: Record<SmartState, string> = {
    'idle-empty': 'ready',
    editing: 'editing',
    classifying: 'reading',
    'inferred-high': 'high confidence',
    'inferred-review': 'review',
    'inferred-low': 'low confidence',
    'unsupported-recoverable': 'needs source help',
    'error-recoverable': 'recoverable error',
    cancelled: 'cancelled',
    applying: 'applying',
    applied: 'applied',
  };
  return labels[state];
}
