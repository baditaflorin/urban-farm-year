import { useQuery } from '@tanstack/react-query';
import {
  cropCatalogSchema,
  dataMetaSchema,
  locationCatalogSchema,
  type CropCatalog,
  type DataMeta,
  type LocationCatalog,
} from '../features/garden/types';

const dataBase = `${import.meta.env.BASE_URL}data/v1`;

async function fetchJSON<T>(path: string, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(`${dataBase}/${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  return parse(await response.json());
}

export function useGardenData() {
  const crops = useQuery<CropCatalog>({
    queryKey: ['garden-data', 'crops', 'v1'],
    queryFn: () => fetchJSON('crops.json', (value) => cropCatalogSchema.parse(value)),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const locations = useQuery<LocationCatalog>({
    queryKey: ['garden-data', 'locations', 'v1'],
    queryFn: () => fetchJSON('locations.json', (value) => locationCatalogSchema.parse(value)),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const meta = useQuery<DataMeta>({
    queryKey: ['garden-data', 'meta', 'v1'],
    queryFn: () => fetchJSON('garden-data.meta.json', (value) => dataMetaSchema.parse(value)),
    staleTime: 1000 * 60 * 60 * 24,
  });

  return { crops, locations, meta };
}
