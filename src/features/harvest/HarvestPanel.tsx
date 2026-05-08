import { DatabaseZap, Plus, Scale } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Crop, HarvestEntry, HarvestSummary, UserState } from '../garden/types';
import { displayLongDate, todayISO } from '../../lib/date';
import { analyzeHarvestWithDuckDB } from '../../lib/duckdb';
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
  const [unit, setUnit] = useState<HarvestEntry['unit']>('g');
  const [note, setNote] = useState('');
  const [duckSummary, setDuckSummary] = useState<HarvestSummary[] | null>(null);
  const [duckLoading, setDuckLoading] = useState(false);
  const summary = useMemo(
    () => duckSummary ?? summarizeHarvests(state.harvests),
    [duckSummary, state.harvests],
  );

  const addHarvest = () => {
    const crop = crops.find((item) => item.id === cropId) ?? crops[0];
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
    try {
      setDuckSummary(await analyzeHarvestWithDuckDB(state.harvests));
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
            <select value={cropId} onChange={(event) => setCropId(event.target.value)}>
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
              onChange={(event) => setUnit(event.target.value as HarvestEntry['unit'])}
            >
              {['g', 'kg', 'oz', 'lb', 'bunch', 'piece'].map((item) => (
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
