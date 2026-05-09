import { DatabaseZap, Plus, Scale } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Crop, HarvestEntry, HarvestSummary, UserState } from '../garden/types';
import { displayLongDate, todayISO } from '../../lib/date';
import { analyzeHarvestWithDuckDB } from '../../lib/duckdb';
import { harvestUnits, isHarvestUnit } from '../../lib/domainOptions';
import { summarizeHarvests } from '../../lib/harvest';

export function HarvestPanel({
  crops,
  state,
  updateState,
}: {
  crops: Crop[];
  state: UserState;
  updateState: (recipe: (current: UserState) => UserState) => void;
}) {
  const [cropId, setCropId] = useState(crops[0]?.id ?? '');
  const [quantity, setQuantity] = useState(250);
  const [unitOverride, setUnitOverride] = useState<HarvestEntry['unit'] | null>(null);
  const [note, setNote] = useState('');
  const [duckSummary, setDuckSummary] = useState<HarvestSummary[] | null>(null);
  const [duckLoading, setDuckLoading] = useState(false);
  const [duckError, setDuckError] = useState<string | null>(null);
  const summary = useMemo(
    () => duckSummary ?? summarizeHarvests(state.harvests),
    [duckSummary, state.harvests],
  );
  const effectiveCropId = crops.some((crop) => crop.id === cropId) ? cropId : (crops[0]?.id ?? '');
  const unit = unitOverride ?? state.settings.defaultHarvestUnit;

  const addHarvest = () => {
    const crop = crops.find((item) => item.id === effectiveCropId) ?? crops[0];
    if (!crop || quantity <= 0) {
      return;
    }
    updateState((current) => ({
      ...current,
      harvests: [
        {
          id: crypto.randomUUID(),
          date: todayISO(),
          cropId: crop.id,
          cropName: crop.name,
          quantity,
          unit,
          note,
        },
        ...current.harvests,
      ],
    }));
    setNote('');
  };

  const runDuckDB = async () => {
    setDuckLoading(true);
    setDuckError(null);
    try {
      setDuckSummary(await analyzeHarvestWithDuckDB(state.harvests));
    } catch (error) {
      setDuckError(
        error instanceof Error
          ? `DuckDB analysis failed: ${error.message}. The regular harvest summary is still available.`
          : 'DuckDB analysis failed. The regular harvest summary is still available.',
      );
    } finally {
      setDuckLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="flex items-center gap-2">
          <Scale size={20} aria-hidden="true" />
          <h2 className="section-title">Harvest Ledger</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_2fr_auto]">
          <label className="field">
            <span>Crop</span>
            <select value={effectiveCropId} onChange={(event) => setCropId(event.target.value)}>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Unit</span>
            <select
              value={unit}
              onChange={(event) => {
                if (isHarvestUnit(event.target.value)) {
                  setUnitOverride(event.target.value);
                }
              }}
            >
              {harvestUnits.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Note</span>
            <input value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="button button-primary self-end" type="button" onClick={addHarvest}>
            <Plus size={18} aria-hidden="true" />
            Add
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="section-title">Yield Summary</h2>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void runDuckDB()}
            disabled={duckLoading}
          >
            <DatabaseZap size={18} aria-hidden="true" />
            {duckLoading ? 'Analyzing' : 'Analyze with DuckDB'}
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {duckError ? <p className="care-advice border-clay/20 bg-clay/10">{duckError}</p> : null}
          {summary.map((item) => (
            <article className="summary-row" key={`${item.cropName}-${item.unit}`}>
              <strong>{item.cropName}</strong>
              <span>
                {Math.round(item.quantity * 10) / 10} {item.unit} · {item.entries} entries
              </span>
            </article>
          ))}
          {summary.length === 0 ? <p className="muted">No harvests logged yet.</p> : null}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Recent Harvests</h2>
        <div className="mt-4 grid gap-3">
          {state.harvests.slice(0, 10).map((entry) => (
            <article className="task-row" key={entry.id}>
              <div>
                <strong>{entry.cropName}</strong>
                <span>{entry.note || `${entry.quantity} ${entry.unit}`}</span>
              </div>
              <time>{displayLongDate(entry.date)}</time>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
