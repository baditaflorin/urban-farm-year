import { FlaskConical, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Crop, SoilTest, UserState } from '../garden/types';
import { todayISO } from '../../lib/date';
import { analyzeSoil } from '../../lib/soil';

export function SoilPanel({
  selectedCrops,
  state,
  updateState,
}: {
  selectedCrops: Crop[];
  state: UserState;
  updateState: (recipe: (current: UserState) => UserState) => void;
}) {
  const latest = state.soilTests[0];
  const [draft, setDraft] = useState<Omit<SoilTest, 'id'>>({
    date: todayISO(),
    ph: latest?.ph ?? 6.5,
    nitrogen: latest?.nitrogen ?? 'ok',
    phosphorus: latest?.phosphorus ?? 'ok',
    potassium: latest?.potassium ?? 'ok',
    organicMatterPct: latest?.organicMatterPct ?? 5,
    texture: latest?.texture ?? 'loam',
    note: '',
  });
  const advice = useMemo(() => analyzeSoil(latest, selectedCrops), [latest, selectedCrops]);

  const save = () => {
    updateState((current) => ({
      ...current,
      soilTests: [{ ...draft, id: crypto.randomUUID() }, ...current.soilTests],
    }));
  };

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="flex items-center gap-2">
          <FlaskConical size={20} aria-hidden="true" />
          <h2 className="section-title">Soil Test</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="field">
            <span>pH</span>
            <input
              type="number"
              min="4"
              max="9"
              step="0.1"
              value={draft.ph}
              onChange={(event) => setDraft({ ...draft, ph: Number(event.target.value) })}
            />
          </label>
          <SelectNutrient
            label="Nitrogen"
            value={draft.nitrogen}
            onChange={(nitrogen) => setDraft({ ...draft, nitrogen })}
          />
          <SelectNutrient
            label="Phosphorus"
            value={draft.phosphorus}
            onChange={(phosphorus) => setDraft({ ...draft, phosphorus })}
          />
          <SelectNutrient
            label="Potassium"
            value={draft.potassium}
            onChange={(potassium) => setDraft({ ...draft, potassium })}
          />
          <label className="field">
            <span>Organic matter %</span>
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              value={draft.organicMatterPct}
              onChange={(event) =>
                setDraft({ ...draft, organicMatterPct: Number(event.target.value) })
              }
            />
          </label>
          <label className="field">
            <span>Texture</span>
            <select
              value={draft.texture}
              onChange={(event) =>
                setDraft({ ...draft, texture: event.target.value as SoilTest['texture'] })
              }
            >
              {['sandy', 'loam', 'clay', 'potting-mix'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="button button-primary mt-4" type="button" onClick={save}>
          <Plus size={18} aria-hidden="true" />
          Save soil test
        </button>
      </section>

      <section className="panel">
        <h2 className="section-title">Soil Guidance</h2>
        <div className="mt-4 grid gap-3">
          {advice.map((item) => (
            <article
              className={`advice advice-${item.status}`}
              key={`${item.title}-${item.detail}`}
            >
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SelectNutrient({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SoilTest['nitrogen'];
  onChange: (value: SoilTest['nitrogen']) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SoilTest['nitrogen'])}
      >
        {['low', 'ok', 'high'].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
