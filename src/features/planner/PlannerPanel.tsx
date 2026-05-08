import { Check, Leaf, Ruler, SunMedium } from 'lucide-react';
import type { Crop, PlanTask, UserState } from '../garden/types';
import { displayDate } from '../../lib/date';
import { planDensityScore } from '../../lib/planning';
import { sunlightFit } from '../../lib/sun';

export function PlannerPanel({
  allCrops,
  selectedCrops,
  planTasks,
  state,
  updateState,
}: {
  allCrops: Crop[];
  selectedCrops: Crop[];
  planTasks: PlanTask[];
  state: UserState;
  updateState: (recipe: (current: UserState) => UserState) => void;
}) {
  const selectedIds = new Set(state.selectedCropIds);
  const density = planDensityScore(selectedCrops, state.profile.bedAreaM2);

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">Crop Plan</h2>
            <p className="muted">
              {selectedCrops.length} selected for {state.profile.bedAreaM2} m2.
            </p>
          </div>
          <div className="density">
            <span>Space load</span>
            <strong>{density}%</strong>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allCrops.map((crop) => {
            const selected = selectedIds.has(crop.id);
            const fit = sunlightFit(crop.sun_hours_min, state.profile);
            return (
              <button
                className={selected ? 'crop-card crop-card-selected' : 'crop-card'}
                key={crop.id}
                type="button"
                onClick={() =>
                  updateState((current) => ({
                    ...current,
                    selectedCropIds: selected
                      ? current.selectedCropIds.filter((id) => id !== crop.id)
                      : [...current.selectedCropIds, crop.id],
                  }))
                }
              >
                <span className="flex items-center justify-between gap-2">
                  <strong>{crop.name}</strong>
                  {selected ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    <Leaf size={18} aria-hidden="true" />
                  )}
                </span>
                <small>{crop.family}</small>
                <span className="crop-facts">
                  <span>
                    <SunMedium size={14} aria-hidden="true" />
                    {crop.sun_hours_min}h · {fit}
                  </span>
                  <span>
                    <Ruler size={14} aria-hidden="true" />
                    {crop.spacing_cm} cm
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Planting Calendar</h2>
        <div className="mt-4 grid gap-3">
          {planTasks.map((task) => (
            <article className="task-row" key={task.id}>
              <div>
                <strong>{task.cropName}</strong>
                <span>
                  {task.title} · {task.note}
                </span>
              </div>
              <time>{displayDate(task.date)}</time>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
