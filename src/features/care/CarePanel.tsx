import { CheckCircle2, CloudSun, Plus, Wind } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Crop, PlanTask, UserState } from '../garden/types';
import { displayDate, todayISO } from '../../lib/date';
import { upcomingTasks } from '../../lib/planning';
import { fetchWeather, weatherAdvice } from '../../lib/weather';

export function CarePanel({
  selectedCrops,
  planTasks,
  state,
  updateState,
}: {
  selectedCrops: Crop[];
  planTasks: PlanTask[];
  state: UserState;
  updateState: (recipe: (current: UserState) => UserState) => void;
}) {
  const [cropId, setCropId] = useState(selectedCrops[0]?.id ?? '');
  const [action, setAction] = useState('Water');
  const [note, setNote] = useState('');
  const weather = useQuery({
    queryKey: ['weather', state.profile.latitude, state.profile.longitude],
    queryFn: () => fetchWeather(state.profile),
    enabled: state.settings.weatherEnabled,
    staleTime: 1000 * 60 * 30,
  });
  const upcoming = upcomingTasks(planTasks, todayISO(), 7);
  const advice = state.settings.weatherEnabled
    ? weatherAdvice(weather.data ?? [])
    : ['Weather advice is paused in Project settings.'];
  const effectiveCropId = selectedCrops.some((crop) => crop.id === cropId)
    ? cropId
    : (selectedCrops[0]?.id ?? '');

  const addCare = () => {
    const crop = selectedCrops.find((item) => item.id === effectiveCropId) ?? selectedCrops[0];
    if (!crop) {
      return;
    }
    updateState((current) => ({
      ...current,
      careLogs: [
        {
          id: crypto.randomUUID(),
          date: todayISO(),
          cropId: crop.id,
          cropName: crop.name,
          action,
          note,
          completed: true,
        },
        ...current.careLogs,
      ],
    }));
    setNote('');
  };

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="flex items-center gap-2">
          <CloudSun size={20} aria-hidden="true" />
          <h2 className="section-title">Daily Care</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {advice.map((item) => (
            <div className="care-advice" key={item}>
              <Wind size={17} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        {weather.error ? (
          <p className="care-advice border-clay/20 bg-clay/10">
            Weather could not load from Open-Meteo. Your care log still works; check local
            conditions before watering.
          </p>
        ) : null}
        {state.settings.weatherEnabled && weather.data ? (
          <div className="forecast-strip">
            {weather.data.slice(0, 5).map((day) => (
              <div key={day.date}>
                <strong>{displayDate(day.date)}</strong>
                <span>
                  {Math.round(day.temperatureMin)}-{Math.round(day.temperatureMax)} C
                </span>
                <small>{Math.round(day.precipitationMM)} mm</small>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2 className="section-title">Log Care</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto]">
          <label className="field">
            <span>Crop</span>
            <select value={effectiveCropId} onChange={(event) => setCropId(event.target.value)}>
              {selectedCrops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Action</span>
            <select value={action} onChange={(event) => setAction(event.target.value)}>
              {['Water', 'Feed', 'Prune', 'Scout', 'Mulch', 'Trellis'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Note</span>
            <input value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="button button-primary self-end" type="button" onClick={addCare}>
            <Plus size={18} aria-hidden="true" />
            Add
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">This Week</h2>
        <div className="mt-4 grid gap-3">
          {upcoming.map((task) => (
            <article className="task-row" key={task.id}>
              <div>
                <strong>{task.cropName}</strong>
                <span>{task.title}</span>
              </div>
              <time>{displayDate(task.date)}</time>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Care Log</h2>
        <div className="mt-4 grid gap-3">
          {state.careLogs.slice(0, 8).map((entry) => (
            <article className="task-row" key={entry.id}>
              <div>
                <strong>{entry.cropName}</strong>
                <span>
                  {entry.action} · {entry.note || 'done'}
                </span>
              </div>
              <CheckCircle2 size={20} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
