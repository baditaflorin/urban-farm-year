import { ClipboardCopy, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Crop, UserState } from '../garden/types';
import { nextYearAdvice } from '../../lib/localAdvisor';
import { summarizeHarvests } from '../../lib/harvest';
import { appVersion, gitCommit, liveUrl, repositoryUrl } from '../../lib/version';

export function NextYearPanel({
  selectedCrops,
  state,
}: {
  selectedCrops: Crop[];
  state: UserState;
}) {
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const latestSoil = state.soilTests[0];
  const harvestSummary = useMemo(() => summarizeHarvests(state.harvests), [state.harvests]);
  const markdown = useMemo(
    () => makeMarkdown({ selectedCrops, state, advice }),
    [selectedCrops, state, advice],
  );

  const refresh = async () => {
    setLoading(true);
    try {
      setAdvice(
        await nextYearAdvice({ crops: selectedCrops, harvests: state.harvests, latestSoil }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={20} aria-hidden="true" />
            <h2 className="section-title">Next-Year Planning</h2>
          </div>
          <button
            className="button button-primary"
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <Sparkles size={18} aria-hidden="true" />
            {loading ? 'Thinking locally' : 'Refresh advice'}
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {(advice.length ? advice : fallbackAdvice(selectedCrops)).map((item) => (
            <article className="advice advice-good" key={item}>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="metric-grid">
        <Mini label="Families" value={new Set(selectedCrops.map((crop) => crop.family)).size} />
        <Mini label="Harvest groups" value={harvestSummary.length} />
        <Mini label="Soil tests" value={state.soilTests.length} />
        <Mini label="Care logs" value={state.careLogs.length} />
      </section>

      <section className="panel">
        <div className="flex items-center gap-2">
          <ClipboardCopy size={20} aria-hidden="true" />
          <h2 className="section-title">Season Export</h2>
        </div>
        <textarea className="export-box mt-4" readOnly value={markdown} />
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function fallbackAdvice(crops: Crop[]): string[] {
  if (crops.length === 0) {
    return ['Select crops first, then return here for rotation and seed-order notes.'];
  }
  return [
    'Keep crop families moving between containers.',
    'Reserve one fast-turnover container for spring and fall greens.',
    'Update seed quantities from the crops that actually earned space.',
  ];
}

function makeMarkdown({
  selectedCrops,
  state,
  advice,
}: {
  selectedCrops: Crop[];
  state: UserState;
  advice: string[];
}) {
  const lines = [
    '# Urban Farm Year Export',
    '',
    `Live site: ${liveUrl}`,
    `Repository: ${repositoryUrl}`,
    `Version: ${appVersion}`,
    `Commit: ${gitCommit}`,
    '',
    `Location: ${state.profile.locationName}`,
    `Crops: ${selectedCrops.map((crop) => crop.name).join(', ') || 'none'}`,
    '',
    '## Advice',
    ...(advice.length ? advice : fallbackAdvice(selectedCrops)).map((item) => `- ${item}`),
    '',
    '## Harvests',
    ...summarizeHarvests(state.harvests).map(
      (item) => `- ${item.cropName}: ${Math.round(item.quantity * 10) / 10} ${item.unit}`,
    ),
  ];
  return lines.join('\n');
}
