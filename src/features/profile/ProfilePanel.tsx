import { Database, LocateFixed, RotateCcw, SunMedium } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DataMeta, GardenLocation, UserState } from '../garden/types';
import { daylightHours } from '../../lib/sun';

type Props = {
  locations: GardenLocation[];
  meta?: DataMeta;
  state: UserState;
  updateState: (recipe: (current: UserState) => UserState) => void;
  reset: () => Promise<void>;
};

export function ProfilePanel({ locations, meta, state, updateState, reset }: Props) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return locations
      .filter((location) =>
        normalized
          ? `${location.name} ${location.admin1} ${location.country_code}`
              .toLowerCase()
              .includes(normalized)
          : true,
      )
      .slice(0, 6);
  }, [locations, query]);

  const daylight = daylightHours(state.profile);

  return (
    <div className="panel space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">Garden Profile</h2>
        <button
          className="icon-button"
          type="button"
          title="Reset local data"
          onClick={() => void reset()}
        >
          <RotateCcw size={17} aria-hidden="true" />
        </button>
      </div>

      <label className="field">
        <span>Location</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={state.profile.locationName}
        />
      </label>

      <div className="grid gap-2">
        {filtered.map((location) => (
          <button
            className="location-row"
            key={location.geoname_id}
            type="button"
            onClick={() => {
              updateState((current) => ({
                ...current,
                profile: {
                  ...current.profile,
                  locationName: `${location.name}, ${location.admin1}, ${location.country_code}`,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  timezone: location.timezone,
                  lastFrost: location.default_last_frost,
                  firstFrost: location.default_first_frost,
                },
              }));
              setQuery('');
            }}
          >
            <LocateFixed size={15} aria-hidden="true" />
            <span>{location.name}</span>
            <small>{location.country_code}</small>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Latitude"
          value={state.profile.latitude}
          step="0.0001"
          onChange={(latitude) =>
            updateState((current) => ({ ...current, profile: { ...current.profile, latitude } }))
          }
        />
        <NumberField
          label="Longitude"
          value={state.profile.longitude}
          step="0.0001"
          onChange={(longitude) =>
            updateState((current) => ({ ...current, profile: { ...current.profile, longitude } }))
          }
        />
        <TextField
          label="Last frost"
          value={state.profile.lastFrost}
          onChange={(lastFrost) =>
            updateState((current) => ({ ...current, profile: { ...current.profile, lastFrost } }))
          }
        />
        <TextField
          label="First frost"
          value={state.profile.firstFrost}
          onChange={(firstFrost) =>
            updateState((current) => ({ ...current, profile: { ...current.profile, firstFrost } }))
          }
        />
        <NumberField
          label="Bed m2"
          value={state.profile.bedAreaM2}
          step="0.5"
          onChange={(bedAreaM2) =>
            updateState((current) => ({ ...current, profile: { ...current.profile, bedAreaM2 } }))
          }
        />
        <NumberField
          label="Sun hours"
          value={state.profile.sunlightHours}
          step="0.5"
          onChange={(sunlightHours) =>
            updateState((current) => ({
              ...current,
              profile: { ...current.profile, sunlightHours },
            }))
          }
        />
      </div>

      <div className="metric-row">
        <SunMedium size={18} aria-hidden="true" />
        <span>Daylight</span>
        <strong>{daylight}h</strong>
      </div>
      <div className="metric-row">
        <Database size={18} aria-hidden="true" />
        <span>Data</span>
        <strong>{meta ? new Date(meta.generated_at).toLocaleDateString() : 'local'}</strong>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
