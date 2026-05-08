import type { Crop, SoilTest } from '../features/garden/types';

export type SoilAdvice = {
  status: 'good' | 'watch' | 'fix';
  title: string;
  detail: string;
};

export function analyzeSoil(test: SoilTest | undefined, crops: Crop[]): SoilAdvice[] {
  if (!test) {
    return [
      {
        status: 'watch',
        title: 'Add a soil test',
        detail: 'Enter pH and N-P-K values to tune crop choices and amendments.',
      },
    ];
  }

  const advice: SoilAdvice[] = [];
  const minPH = Math.min(...crops.map((crop) => crop.ph_min));
  const maxPH = Math.max(...crops.map((crop) => crop.ph_max));

  if (test.ph < minPH) {
    advice.push({
      status: 'fix',
      title: 'pH is low for this plan',
      detail: `Most selected crops prefer at least ${minPH.toFixed(1)}. Add lime only after confirming label rates.`,
    });
  } else if (test.ph > maxPH) {
    advice.push({
      status: 'fix',
      title: 'pH is high for this plan',
      detail: `Most selected crops prefer below ${maxPH.toFixed(1)}. Use compost and acidifying amendments carefully.`,
    });
  } else {
    advice.push({
      status: 'good',
      title: 'pH fits selected crops',
      detail: `The ${test.ph.toFixed(1)} pH reading sits inside the selected crop range.`,
    });
  }

  for (const nutrient of ['nitrogen', 'phosphorus', 'potassium'] as const) {
    if (test[nutrient] === 'low') {
      advice.push({
        status: 'watch',
        title: `${label(nutrient)} is low`,
        detail: amendmentFor(nutrient),
      });
    }
    if (test[nutrient] === 'high') {
      advice.push({
        status: 'watch',
        title: `${label(nutrient)} is high`,
        detail: 'Avoid adding more of this nutrient this season and irrigate consistently.',
      });
    }
  }

  if (test.organicMatterPct < 4) {
    advice.push({
      status: 'watch',
      title: 'Organic matter can improve',
      detail: 'Top dress with mature compost and keep soil covered between plantings.',
    });
  }

  const heavyFeeders = crops.filter((crop) => crop.feed_level === 'heavy');
  if (heavyFeeders.length > 0 && test.nitrogen !== 'high') {
    advice.push({
      status: 'watch',
      title: 'Heavy feeders selected',
      detail: `${heavyFeeders.map((crop) => crop.name).join(', ')} need steady fertility through harvest.`,
    });
  }

  return advice;
}

function label(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function amendmentFor(nutrient: 'nitrogen' | 'phosphorus' | 'potassium'): string {
  if (nutrient === 'nitrogen') {
    return 'Use compost, legume cover crops, or a balanced organic fertilizer with label-rate caution.';
  }
  if (nutrient === 'phosphorus') {
    return 'Use compost first and avoid over-applying phosphorus in containers or runoff-prone areas.';
  }
  return 'Compost and kelp meal can help, but container mixes often need lighter repeated feeding.';
}
