import type { Crop, PlanTask, UserState } from '../features/garden/types';
import { summarizeHarvests } from './harvest';
import { createStateEnvelope } from './stateSchema';
import { appVersion, gitCommit, liveUrl, repositoryUrl } from './version';

export function makeSeasonMarkdown({
  selectedCrops,
  state,
  advice,
  planTasks,
}: {
  selectedCrops: Crop[];
  state: UserState;
  advice: string[];
  planTasks?: PlanTask[];
}): string {
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
    `Care logs: ${state.careLogs.length}`,
    `Soil tests: ${state.soilTests.length}`,
    `Harvest entries: ${state.harvests.length}`,
    '',
    '## Advice',
    ...(advice.length ? advice : fallbackAdvice(selectedCrops)).map((item) => `- ${item}`),
    '',
    '## Planting Calendar',
    ...calendarLines(planTasks ?? []),
    '',
    '## Harvests',
    ...harvestLines(state),
  ];
  return lines.join('\n');
}

export function makeStateJSON(state: UserState, exportedAt?: string): string {
  return `${JSON.stringify(createStateEnvelope(state, exportedAt), null, 2)}\n`;
}

export function makeHarvestCSV(state: UserState): string {
  const header = ['id', 'date', 'crop_id', 'crop_name', 'quantity', 'unit', 'note'];
  const rows = state.harvests.map((entry) => [
    entry.id,
    entry.date,
    entry.cropId,
    entry.cropName,
    String(entry.quantity),
    entry.unit,
    entry.note,
  ]);
  return [...[header], ...rows].map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

export function makePrimaryExport(
  state: UserState,
  markdown: string,
): { body: string; fileName: string; mime: string } {
  if (state.settings.primaryExportFormat === 'markdown') {
    return { body: markdown, fileName: 'urban-farm-year-season.md', mime: 'text/markdown' };
  }
  if (state.settings.primaryExportFormat === 'csv') {
    return {
      body: makeHarvestCSV(state),
      fileName: 'urban-farm-year-harvests.csv',
      mime: 'text/csv',
    };
  }
  return {
    body: makeStateJSON(state),
    fileName: 'urban-farm-year-project.json',
    mime: 'application/json',
  };
}

export function downloadText(fileName: string, body: string, mime: string): void {
  const blob = new Blob([body], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyText(body: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard copy is unavailable. Select the text and copy it manually.');
  }
  await navigator.clipboard.writeText(body);
}

export function printableSummary(state: UserState): string {
  return [
    `Urban Farm Year ${appVersion}`,
    state.profile.locationName,
    `${state.selectedCropIds.length} crops`,
    `${state.harvests.length} harvests`,
  ].join(' · ');
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

function calendarLines(planTasks: PlanTask[]): string[] {
  if (planTasks.length === 0) {
    return ['- No planting tasks generated yet.'];
  }
  return planTasks.slice(0, 20).map((task) => `- ${task.date}: ${task.cropName} - ${task.title}`);
}

function harvestLines(state: UserState): string[] {
  const rows = summarizeHarvests(state.harvests);
  if (rows.length === 0) {
    return ['- No harvests logged yet.'];
  }
  return rows.map(
    (item) => `- ${item.cropName}: ${Math.round(item.quantity * 10) / 10} ${item.unit}`,
  );
}

function csvCell(value: string): string {
  if (/["\n\r,]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
