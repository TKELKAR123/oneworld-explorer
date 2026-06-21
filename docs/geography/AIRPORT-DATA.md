# Airport data (v0.1.1)

## Source

[OurAirports](https://ourairports.com/data/) `airports.csv` — Open Database License (ODbL).

Filtered to rows with non-empty IATA and `scheduled_service = yes` (~4,170 airports).

## Build

```bash
npm run build:airports
npm run validate:airports
```

Outputs `data/airports.generated.json`. Overrides in `data/airport-overrides.json` (Hawaii).

## Runtime

`packages/core/src/geography/resolve-airport.ts` loads generated JSON with fallback to legacy `data/airports.json`.

Canadian provinces and US states derived from `iso_region` during import.
