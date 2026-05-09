import {
  CalendarDays,
  ClipboardList,
  FlaskConical,
  GitFork,
  Heart,
  Home,
  ImageUp,
  LineChart,
  Settings,
  Sprout,
  Wheat,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CarePanel } from './features/care/CarePanel';
import { ClassifierPanel } from './features/classifier/ClassifierPanel';
import type { Crop } from './features/garden/types';
import { HarvestPanel } from './features/harvest/HarvestPanel';
import { NextYearPanel } from './features/next-year/NextYearPanel';
import { OverviewPanel } from './features/overview/OverviewPanel';
import { PlannerPanel } from './features/planner/PlannerPanel';
import { ProfilePanel } from './features/profile/ProfilePanel';
import { ProjectPanel } from './features/project/ProjectPanel';
import { SoilPanel } from './features/soil/SoilPanel';
import { SmartInputPanel } from './features/smart-input/SmartInputPanel';
import { useGardenData } from './lib/data';
import type { SmartDraft } from './lib/inference';
import { generatePlanTasks } from './lib/planning';
import { stateJSONFromHash } from './lib/projectIO';
import { parseStateEnvelope } from './lib/stateSchema';
import { useGardenStore } from './lib/useGardenStore';
import { appVersion, gitCommit, paypalUrl, repositoryUrl } from './lib/version';

type TabId =
  | 'overview'
  | 'plan'
  | 'care'
  | 'soil'
  | 'harvest'
  | 'classifier'
  | 'next-year'
  | 'project';

const tabs: Array<{ id: TabId; label: string; icon: typeof Home }> = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'plan', label: 'Plan', icon: CalendarDays },
  { id: 'care', label: 'Care', icon: ClipboardList },
  { id: 'soil', label: 'Soil', icon: FlaskConical },
  { id: 'harvest', label: 'Harvest', icon: Wheat },
  { id: 'classifier', label: 'Classifier', icon: ImageUp },
  { id: 'next-year', label: 'Next Year', icon: LineChart },
  { id: 'project', label: 'Project', icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    stateJSONFromHash(window.location.hash) ? 'project' : 'overview',
  );
  const [lastDraft, setLastDraft] = useState<SmartDraft | null>(null);
  const shareImported = useRef(false);
  const { crops, locations, meta } = useGardenData();
  const store = useGardenStore();

  const allCrops = useMemo(() => crops.data?.crops ?? [], [crops.data?.crops]);
  const selectedCrops = useMemo(
    () => allCrops.filter((crop) => store.state.selectedCropIds.includes(crop.id)),
    [allCrops, store.state.selectedCropIds],
  );
  const planTasks = useMemo(
    () => generatePlanTasks(selectedCrops, store.state.profile),
    [selectedCrops, store.state.profile],
  );

  const dataError = crops.error ?? locations.error ?? meta.error;
  const isLoading = !store.ready || crops.isLoading || locations.isLoading || meta.isLoading;

  useEffect(() => {
    if (!store.ready || shareImported.current) {
      return;
    }
    shareImported.current = true;
    const stateJSON = stateJSONFromHash(window.location.hash);
    if (!stateJSON) {
      return;
    }
    try {
      const parsedState: unknown = JSON.parse(stateJSON);
      const envelope = parseStateEnvelope(parsedState);
      store.updateState(() => ({
        ...envelope.state,
        activityLog: [
          {
            id: `share-import-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            action: 'import-share-url',
            detail: 'Imported project state from the URL hash.',
          },
          ...envelope.state.activityLog,
        ].slice(0, 30),
      }));
      window.history.replaceState(
        null,
        document.title,
        window.location.pathname + window.location.search,
      );
    } catch {
      shareImported.current = true;
    }
  }, [store]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded bg-canopy text-white shadow-soft">
                <Sprout aria-hidden="true" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-normal sm:text-3xl">Urban Farm Year</h1>
                <p className="text-sm text-ink/65">
                  Version {appVersion} · Commit {gitCommit}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="button button-primary" href={repositoryUrl}>
                <GitFork size={18} aria-hidden="true" />
                Star on GitHub
              </a>
              <a className="button button-secondary" href={paypalUrl}>
                <Heart size={18} aria-hidden="true" />
                Support
              </a>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto" aria-label="Primary">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  className={activeTab === tab.id ? 'tab tab-active' : 'tab'}
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={17} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[330px_1fr] lg:px-8">
        <aside className="space-y-4">
          <ProfilePanel
            locations={locations.data?.locations ?? []}
            meta={meta.data}
            state={store.state}
            updateState={store.updateState}
            reset={store.reset}
          />
        </aside>

        <section className="min-w-0">
          {isLoading ? (
            <div className="panel">Loading garden year data...</div>
          ) : dataError ? (
            <div className="panel border-clay/40 bg-clay/10">
              {dataError instanceof Error ? dataError.message : 'Static data failed to load.'}
            </div>
          ) : (
            <div className="space-y-5">
              <SmartInputPanel
                crops={allCrops}
                state={store.state}
                updateState={store.updateState}
                onDraft={setLastDraft}
              />
              <ActivePanel
                activeTab={activeTab}
                allCrops={allCrops}
                selectedCrops={selectedCrops}
                planTasks={planTasks}
                store={store}
                reset={store.reset}
              />
            </div>
          )}
          {store.error ? <p className="mt-3 text-sm text-clay">{store.error}</p> : null}
          {new URLSearchParams(window.location.search).get('debug') === '1' && lastDraft ? (
            <p className="mt-3 text-xs font-bold text-ink/55">
              Debug source hash: {lastDraft.provenance.sourceHash}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function ActivePanel({
  activeTab,
  allCrops,
  selectedCrops,
  planTasks,
  store,
  reset,
}: {
  activeTab: TabId;
  allCrops: Crop[];
  selectedCrops: Crop[];
  planTasks: ReturnType<typeof generatePlanTasks>;
  store: ReturnType<typeof useGardenStore>;
  reset: () => Promise<void>;
}) {
  if (activeTab === 'plan') {
    return (
      <PlannerPanel
        allCrops={allCrops}
        selectedCrops={selectedCrops}
        planTasks={planTasks}
        state={store.state}
        updateState={store.updateState}
      />
    );
  }
  if (activeTab === 'care') {
    return (
      <CarePanel
        selectedCrops={selectedCrops}
        planTasks={planTasks}
        state={store.state}
        updateState={store.updateState}
      />
    );
  }
  if (activeTab === 'soil') {
    return (
      <SoilPanel
        selectedCrops={selectedCrops}
        state={store.state}
        updateState={store.updateState}
      />
    );
  }
  if (activeTab === 'harvest') {
    return (
      <HarvestPanel crops={selectedCrops} state={store.state} updateState={store.updateState} />
    );
  }
  if (activeTab === 'classifier') {
    return <ClassifierPanel />;
  }
  if (activeTab === 'next-year') {
    return <NextYearPanel selectedCrops={selectedCrops} state={store.state} />;
  }
  if (activeTab === 'project') {
    return (
      <ProjectPanel
        crops={allCrops}
        selectedCrops={selectedCrops}
        planTasks={planTasks}
        state={store.state}
        updateState={store.updateState}
        reset={reset}
      />
    );
  }
  return <OverviewPanel selectedCrops={selectedCrops} planTasks={planTasks} state={store.state} />;
}
