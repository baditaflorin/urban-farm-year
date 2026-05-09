export const harvestUnits = ['g', 'kg', 'oz', 'lb', 'bunch', 'piece'] as const;
export type HarvestUnit = (typeof harvestUnits)[number];

export const nutrientLevels = ['low', 'ok', 'high'] as const;
export type NutrientLevel = (typeof nutrientLevels)[number];

export const soilTextures = ['sandy', 'loam', 'clay', 'potting-mix'] as const;
export type SoilTexture = (typeof soilTextures)[number];

export const exportFormats = ['json', 'markdown', 'csv'] as const;
export type ExportFormat = (typeof exportFormats)[number];

export function isHarvestUnit(value: string): value is HarvestUnit {
  return includesOption(harvestUnits, value);
}

export function isNutrientLevel(value: string): value is NutrientLevel {
  return includesOption(nutrientLevels, value);
}

export function isSoilTexture(value: string): value is SoilTexture {
  return includesOption(soilTextures, value);
}

export function isExportFormat(value: string): value is ExportFormat {
  return includesOption(exportFormats, value);
}

function includesOption<const T extends readonly string[]>(
  options: T,
  value: string,
): value is T[number] {
  return options.some((option) => option === value);
}
