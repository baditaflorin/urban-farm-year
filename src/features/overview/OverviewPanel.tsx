import { CalendarCheck, Droplets, Leaf, Scale } from 'lucide-react';
import type { Crop, PlanTask, UserState } from '../garden/types';
import { displayDate, todayISO } from '../../lib/date';
import { summarizeHarvests } from '../../lib/harvest';
import { planDensityScore, upcomingTasks } from '../../lib/planning';
import { repositoryUrl } from '../../lib/version';

export function OverviewPanel({
  selectedCrops,
  planTasks,
  state,
}: {
  selectedCrops: Crop[];
  planTasks: PlanTask[];
  state: UserState;
}) {
  const upcoming = upcomingTasks(planTasks, todayISO(), 5);
  const harvest = summarizeHarvests(state.harvests);
  const density = planDensityScore(selectedCrops, state.profile.bedAreaM2);

  return (
    <div className="space-y-5">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Planning to harvest loop</p>
          <h2>{state.profile.locationName}</h2>
          <p>
            {selectedCrops.length} crops · {state.careLogs.length} care logs ·{' '}
            {state.harvests.length} harvests
          </p>
          <a className="button button-primary w-fit" href={repositoryUrl}>
            Star the repo
          </a>
        </div>
        <img
          src={`${import.meta.env.BASE_URL}assets/garden-bed.png`}
          alt="Illustrated raised bed plan"
        />
      </section>

      <section className="metric-grid">
        <Metric icon={Leaf} label="Crops" value={String(selectedCrops.length)} />
        <Metric icon={CalendarCheck} label="Upcoming" value={String(upcoming.length)} />
        <Metric icon={Scale} label="Top harvest" value={harvest[0]?.cropName ?? 'None'} />
        <Metric icon={Droplets} label="Density" value={`${density}%`} />
      </section>

      <section className="panel">
        <h2 className="section-title">Next Tasks</h2>
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

      {state.activityLog.length > 0 ? (
        <section className="panel">
          <h2 className="section-title">Activity</h2>
          <div className="mt-4 grid gap-3">
            {state.activityLog.slice(0, 5).map((entry) => (
              <article className="task-row" key={entry.id}>
                <div>
                  <strong>{entry.action.replaceAll('-', ' ')}</strong>
                  <span>{entry.detail}</span>
                </div>
                <time>{entry.date}</time>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Leaf; label: string; value: string }) {
  return (
    <div className="metric-card">
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
