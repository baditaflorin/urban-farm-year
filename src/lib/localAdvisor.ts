import type { Crop, HarvestEntry, SoilTest } from '../features/garden/types';
import { bestHarvestCrop } from './harvest';

type BrowserLanguageModel = {
  prompt(input: string): Promise<string>;
};

type BrowserLanguageModelFactory = {
  availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  create(): Promise<BrowserLanguageModel>;
};

declare global {
  interface Window {
    LanguageModel?: BrowserLanguageModelFactory;
  }
}

export async function nextYearAdvice(args: {
  crops: Crop[];
  harvests: HarvestEntry[];
  latestSoil?: SoilTest;
}): Promise<string[]> {
  const prompt = makePrompt(args);
  const model = await tryBrowserModel();
  if (model) {
    const response = await model.prompt(prompt);
    return response
      .split('\n')
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  return heuristicAdvice(args);
}

function makePrompt(args: {
  crops: Crop[];
  harvests: HarvestEntry[];
  latestSoil?: SoilTest;
}): string {
  return [
    'Give five concise next-season urban gardening recommendations.',
    `Crops: ${args.crops.map((crop) => crop.name).join(', ')}`,
    `Best harvest: ${bestHarvestCrop(args.harvests)}`,
    `Soil pH: ${args.latestSoil?.ph ?? 'unknown'}`,
  ].join('\n');
}

async function tryBrowserModel(): Promise<BrowserLanguageModel | null> {
  try {
    if (!window.LanguageModel) {
      return null;
    }
    const availability = await window.LanguageModel.availability();
    if (availability !== 'available') {
      return null;
    }
    return window.LanguageModel.create();
  } catch {
    return null;
  }
}

function heuristicAdvice(args: {
  crops: Crop[];
  harvests: HarvestEntry[];
  latestSoil?: SoilTest;
}): string[] {
  const families = new Set(args.crops.map((crop) => crop.family));
  const heavyFeeders = args.crops
    .filter((crop) => crop.feed_level === 'heavy')
    .map((crop) => crop.name);
  const advice = [
    `Rotate away from ${[...families].slice(0, 3).join(', ')} in the same containers next season.`,
    heavyFeeders.length
      ? `Refresh compost before replanting heavy feeders: ${heavyFeeders.join(', ')}.`
      : 'Keep fertility light and steady for leafy and root crops.',
    `Double down on ${bestHarvestCrop(args.harvests)} if it fit the space and care rhythm.`,
  ];
  if (args.latestSoil && args.latestSoil.ph < 6) {
    advice.push('Retest pH before adding lime; containers change quickly after amendments.');
  } else {
    advice.push(
      'Keep one bed or container free for fast succession crops like radish and arugula.',
    );
  }
  advice.push('Save seed order notes now while harvest memories are fresh.');
  return advice;
}
