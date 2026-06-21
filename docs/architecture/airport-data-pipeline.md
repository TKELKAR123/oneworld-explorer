# Airport data pipeline (v0.1.1)

Source: [OurAirports](https://ourairports.com/data/) `airports.csv` (ODbL).

```bash
npm run build:airports   # → data/airports.generated.json
npm run validate:airports
```

Overrides: `data/airport-overrides.json` (Hawaii airports).

Runtime: `resolve-airport.ts` loads generated file with fallback to legacy `airports.json`.
