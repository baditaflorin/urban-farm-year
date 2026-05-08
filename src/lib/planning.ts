import type { Crop, GardenProfile, PlanTask } from '../features/garden/types';
import { addDays, isoDate, monthDayToDate, thisGardenYear } from './date';

export function generatePlanTasks(crops: Crop[], profile: GardenProfile): PlanTask[] {
  const year = thisGardenYear();
  const lastFrost = monthDayToDate(year, profile.lastFrost);
  const tasks: PlanTask[] = [];

  for (const crop of crops) {
    if (crop.indoor_start_weeks_before_last_frost > 0) {
      const date = addDays(lastFrost, -crop.indoor_start_weeks_before_last_frost * 7);
      tasks.push(
        taskFor(crop, 'indoors', date, 'Start indoors', 'Use a bright window or grow light.'),
      );
    }

    const directDate = addDays(lastFrost, crop.direct_sow_weeks_before_last_frost * 7);
    tasks.push(taskFor(crop, 'direct', directDate, 'Direct sow', crop.notes));

    if (
      crop.transplant_weeks_after_last_frost > 0 ||
      crop.indoor_start_weeks_before_last_frost > 0
    ) {
      const transplantDate = addDays(lastFrost, crop.transplant_weeks_after_last_frost * 7);
      tasks.push(
        taskFor(crop, 'transplant', transplantDate, 'Transplant', `${crop.spacing_cm} cm spacing.`),
      );
    }

    const plantingDate =
      crop.transplant_weeks_after_last_frost > 0
        ? addDays(lastFrost, crop.transplant_weeks_after_last_frost * 7)
        : directDate;
    const harvestDate = addDays(plantingDate, crop.harvest_start_days_after_plant);
    tasks.push(
      taskFor(
        crop,
        'harvest',
        harvestDate,
        'First harvest window',
        `${crop.harvest_window_days} day harvest window.`,
      ),
    );
  }

  return tasks.sort((a, b) => a.date.localeCompare(b.date) || a.cropName.localeCompare(b.cropName));
}

export function upcomingTasks(tasks: PlanTask[], fromISO: string, count = 8): PlanTask[] {
  return tasks.filter((task) => task.windowEnd >= fromISO).slice(0, count);
}

function taskFor(
  crop: Crop,
  type: PlanTask['type'],
  date: Date,
  title: string,
  note: string,
): PlanTask {
  return {
    id: `${crop.id}-${type}-${isoDate(date)}`,
    cropId: crop.id,
    cropName: crop.name,
    type,
    title,
    date: isoDate(date),
    windowStart: isoDate(addDays(date, -3)),
    windowEnd: isoDate(addDays(date, 5)),
    note,
  };
}

export function planDensityScore(crops: Crop[], bedAreaM2: number): number {
  if (bedAreaM2 <= 0 || crops.length === 0) {
    return 0;
  }
  const areaNeeded = crops.reduce(
    (sum, crop) => sum + Math.max(0.04, (crop.spacing_cm / 100) ** 2),
    0,
  );
  return Math.min(100, Math.round((areaNeeded / bedAreaM2) * 100));
}
