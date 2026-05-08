# Data Contract

The static data contract is versioned under `/data/v1`.

## Files

- `/data/v1/crops.json`: crop planning and care reference data.
- `/data/v1/locations.json`: GeoNames-style seed locations for quick location setup.
- `/data/v1/garden-data.meta.json`: generation metadata.

## Freshness

The frontend reads `/data/v1/garden-data.meta.json` and shows when the data was generated.

Regenerate data:

```sh
make data
```

## Versioning

Compatible changes keep `/data/v1`. Breaking schema changes move to `/data/v2`.
