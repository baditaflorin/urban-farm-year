import {
  ClipboardCopy,
  ClipboardPaste,
  Download,
  FileInput,
  Link,
  Printer,
  RotateCcw,
  Settings,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Crop, PlanTask, UserState } from '../garden/types';
import {
  copyText,
  downloadText,
  makeHarvestCSV,
  makePrimaryExport,
  makeSeasonMarkdown,
  makeStateJSON,
  printableSummary,
} from '../../lib/exporters';
import { applySmartDraft } from '../../lib/inference/applyDraft';
import {
  fetchImportUrl,
  friendlyError,
  importGardenFiles,
  importText,
  makeShareUrl,
  readClipboardText,
  type ImportOutcome,
} from '../../lib/projectIO';
import {
  exportFormats,
  harvestUnits,
  isExportFormat,
  isHarvestUnit,
} from '../../lib/domainOptions';

const sampleInput =
  'Tomato "Red Pride" Bush. 78 days from transplant. Sow indoors 4-6 weeks before last frost. Space 24 in.';

export function ProjectPanel({
  crops,
  selectedCrops,
  planTasks,
  state,
  updateState,
  reset,
}: {
  crops: Crop[];
  selectedCrops: Crop[];
  planTasks: PlanTask[];
  state: UserState;
  updateState: (recipe: (current: UserState) => UserState) => void;
  reset: () => Promise<void>;
}) {
  const [outcomes, setOutcomes] = useState<ImportOutcome[]>([]);
  const [rawInput, setRawInput] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const advice = useMemo(
    () => state.activityLog.slice(0, 3).map((entry) => entry.detail),
    [state.activityLog],
  );
  const markdown = useMemo(
    () => makeSeasonMarkdown({ selectedCrops, state, advice, planTasks }),
    [advice, planTasks, selectedCrops, state],
  );
  const stateJson = useMemo(() => makeStateJSON(state), [state]);
  const harvestCsv = useMemo(() => makeHarvestCSV(state), [state]);
  const primaryExport = useMemo(() => makePrimaryExport(state, markdown), [markdown, state]);

  const importFiles = async (files: FileList | File[]) => {
    setBusy(true);
    setStatus('');
    try {
      setOutcomes(await importGardenFiles(Array.from(files)));
    } finally {
      setBusy(false);
    }
  };

  const importRawText = (fileName: string, text: string) => {
    try {
      setOutcomes([importText(fileName, text)]);
      setStatus('Input was read. Review the result before applying it.');
    } catch (error) {
      setStatus(
        friendlyError(error, 'Check that the text is garden data or a saved project JSON file.'),
      );
    }
  };

  const applyOutcome = (outcome: ImportOutcome) => {
    if (outcome.status === 'state') {
      updateState(() => ({
        ...outcome.envelope.state,
        activityLog: [
          {
            id: `${outcome.id}-import-state`,
            date: new Date().toISOString().slice(0, 10),
            action: 'import-project-state',
            detail: `Imported project from ${outcome.fileName}.`,
          },
          ...outcome.envelope.state.activityLog,
        ].slice(0, 30),
      }));
      setStatus(`Imported project from ${outcome.fileName}.`);
      return;
    }
    if (outcome.status === 'draft') {
      updateState((current) => applySmartDraft(outcome.draft, current, crops));
      setStatus(`Applied ${outcome.draft.title} from ${outcome.fileName}.`);
    }
  };

  const applyAllDrafts = () => {
    const draftOutcomes = outcomes.filter((outcome) => outcome.status === 'draft');
    updateState((current) =>
      draftOutcomes.reduce((next, outcome) => applySmartDraft(outcome.draft, next, crops), current),
    );
    setStatus(`Applied ${draftOutcomes.length} draft${draftOutcomes.length === 1 ? '' : 's'}.`);
  };

  const copy = async (body: string, label: string) => {
    try {
      await copyText(body);
      setStatus(`Copied ${label}.`);
    } catch (error) {
      setStatus(friendlyError(error, `Select and copy the ${label} manually.`));
    }
  };

  const copyShareUrl = async () => {
    if (stateJson.length > 7000) {
      setStatus(
        'This project is too large for a reliable share URL. Download the project JSON instead.',
      );
      return;
    }
    await copy(makeShareUrl(stateJson, window.location.href), 'share URL');
  };

  return (
    <div className="space-y-5">
      <section className="panel space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <FileInput size={20} aria-hidden="true" />
            <h2 className="section-title">Load Your Garden Data</h2>
          </div>
          <span className="state-pill">{busy ? 'reading files' : 'ready'}</span>
        </div>

        <label
          className="upload-zone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void importFiles(event.dataTransfer.files);
          }}
        >
          <Upload size={30} aria-hidden="true" />
          <span>Drop or choose TXT, CSV, TSV, HTML, JSON, or image files</span>
          <small>Images stay in the Classifier tab; text and project files are read here.</small>
          <input
            multiple
            accept=".txt,.csv,.tsv,.html,.htm,.md,.json,text/*,application/json,image/*"
            type="file"
            onChange={(event) => {
              if (event.target.files) {
                void importFiles(event.target.files);
              }
            }}
          />
        </label>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="field">
            <span>Paste or edit input before import</span>
            <textarea
              className="min-h-28"
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              placeholder="Paste garden text, CSV, TSV, HTML text, or project JSON"
            />
          </label>
          <button
            className="button button-secondary self-end"
            type="button"
            onClick={() => importRawText('pasted-input.txt', rawInput)}
            disabled={!rawInput.trim()}
          >
            <FileInput size={18} aria-hidden="true" />
            Import Text
          </button>
          <button
            className="button button-secondary self-end"
            type="button"
            onClick={() => {
              void readClipboardText()
                .then((text) => {
                  setRawInput(text);
                  importRawText('clipboard.txt', text);
                })
                .catch((error: unknown) =>
                  setStatus(friendlyError(error, 'Paste manually into the text field.')),
                );
            }}
          >
            <ClipboardPaste size={18} aria-hidden="true" />
            Read Clipboard
          </button>
          <button
            className="button button-secondary self-end"
            type="button"
            onClick={() => {
              setRawInput(sampleInput);
              importRawText('sample-seed-packet.txt', sampleInput);
            }}
          >
            <FileInput size={18} aria-hidden="true" />
            Load Sample
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="field">
            <span>URL import</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/garden-guide"
            />
          </label>
          <button
            className="button button-secondary self-end"
            type="button"
            disabled={!url.trim()}
            onClick={() => {
              setBusy(true);
              void fetchImportUrl(url)
                .then((text) => {
                  setRawInput(text);
                  importRawText(url, text);
                })
                .catch((error: unknown) =>
                  setStatus(
                    friendlyError(
                      error,
                      'Many sites block browser imports with CORS. Open the page, copy the rendered text, and paste it here.',
                    ),
                  ),
                )
                .finally(() => setBusy(false));
            }}
          >
            <Link size={18} aria-hidden="true" />
            Fetch URL
          </button>
        </div>

        {outcomes.length > 0 ? (
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                className="button button-primary"
                type="button"
                onClick={applyAllDrafts}
                disabled={!outcomes.some((outcome) => outcome.status === 'draft')}
              >
                <Upload size={18} aria-hidden="true" />
                Apply All Drafts
              </button>
            </div>
            {outcomes.map((outcome) => (
              <article className={`outcome-row outcome-${outcome.status}`} key={outcome.id}>
                <div>
                  <strong>{outcome.fileName}</strong>
                  <span>{outcome.message}</span>
                </div>
                {outcome.status === 'draft' || outcome.status === 'state' ? (
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => applyOutcome(outcome)}
                  >
                    Apply
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel space-y-4">
        <div className="flex items-center gap-2">
          <Download size={20} aria-hidden="true" />
          <h2 className="section-title">Take Your Work Out</h2>
        </div>
        <p className="muted">{printableSummary(state)}</p>
        <div className="output-grid">
          <OutputCard
            title="Project JSON"
            detail="Full versioned state. Import this later to restore your project."
            onCopy={() => void copy(stateJson, 'project JSON')}
            onDownload={() =>
              downloadText('urban-farm-year-project.json', stateJson, 'application/json')
            }
          />
          <OutputCard
            title="Season Markdown"
            detail="Readable planning notes for email, docs, or a garden notebook."
            onCopy={() => void copy(markdown, 'season markdown')}
            onDownload={() => downloadText('urban-farm-year-season.md', markdown, 'text/markdown')}
          />
          <OutputCard
            title="Harvest CSV"
            detail="Spreadsheet-ready harvest rows with stable IDs."
            onCopy={() => void copy(harvestCsv, 'harvest CSV')}
            onDownload={() => downloadText('urban-farm-year-harvests.csv', harvestCsv, 'text/csv')}
          />
          <OutputCard
            title="Share URL"
            detail="Small browser hash snapshot for quick handoff. Large projects should use JSON."
            onCopy={() => void copyShareUrl()}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="button button-primary"
            type="button"
            onClick={() =>
              downloadText(primaryExport.fileName, primaryExport.body, primaryExport.mime)
            }
          >
            <Download size={18} aria-hidden="true" />
            Download Primary Export ({state.settings.primaryExportFormat})
          </button>
          <button className="button button-secondary" type="button" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" />
            Print
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              if (
                window.confirm('Start fresh and clear all local garden records in this browser?')
              ) {
                void reset().then(() =>
                  setStatus('Local project cleared. Downloaded exports are unaffected.'),
                );
              }
            }}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Start Fresh
          </button>
        </div>
      </section>

      <section className="panel space-y-4">
        <div className="flex items-center gap-2">
          <Settings size={20} aria-hidden="true" />
          <h2 className="section-title">Settings</h2>
        </div>
        <div className="settings-grid">
          <label className="check-field">
            <input
              type="checkbox"
              checked={state.settings.weatherEnabled}
              onChange={(event) =>
                updateState((current) => ({
                  ...current,
                  settings: { ...current.settings, weatherEnabled: event.target.checked },
                }))
              }
            />
            <span>Show weather advice in Daily Care</span>
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={state.settings.rememberSmartInput}
              onChange={(event) =>
                updateState((current) => ({
                  ...current,
                  settings: {
                    ...current.settings,
                    rememberSmartInput: event.target.checked,
                  },
                  lastSmartInput: event.target.checked ? current.lastSmartInput : '',
                }))
              }
            />
            <span>Restore last Smart Garden Input text on this device</span>
          </label>
          <label className="field">
            <span>Default harvest unit</span>
            <select
              value={state.settings.defaultHarvestUnit}
              onChange={(event) => {
                const unit = event.target.value;
                if (isHarvestUnit(unit)) {
                  updateState((current) => ({
                    ...current,
                    settings: { ...current.settings, defaultHarvestUnit: unit },
                  }));
                }
              }}
            >
              {harvestUnits.map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Primary export</span>
            <select
              value={state.settings.primaryExportFormat}
              onChange={(event) => {
                const format = event.target.value;
                if (isExportFormat(format)) {
                  updateState((current) => ({
                    ...current,
                    settings: { ...current.settings, primaryExportFormat: format },
                  }));
                }
              }}
            >
              {exportFormats.map((format) => (
                <option key={format}>{format}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {status ? <p className="care-advice">{status}</p> : null}
    </div>
  );
}

function OutputCard({
  title,
  detail,
  onCopy,
  onDownload,
}: {
  title: string;
  detail: string;
  onCopy: () => void;
  onDownload?: () => void;
}) {
  return (
    <article className="output-card">
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="button button-secondary" type="button" onClick={onCopy}>
          <ClipboardCopy size={18} aria-hidden="true" />
          Copy
        </button>
        {onDownload ? (
          <button className="button button-secondary" type="button" onClick={onDownload}>
            <Download size={18} aria-hidden="true" />
            Download
          </button>
        ) : null}
      </div>
    </article>
  );
}
